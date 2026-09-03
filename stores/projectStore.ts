"use client";

import { create } from "zustand";
import { Project, ProjectOverview } from "@/types/project";

/* Projects are the durable container: conversations and artifacts live inside
   one. Kept separate from chatStore, which owns a single conversation's
   messages, and from uiStore, which owns chrome. */

interface ProjectState {
  projects: Project[];
  /** The project the current conversation belongs to, if any. */
  activeProjectId: string | null;
  overview: ProjectOverview | null;
  overviewLoading: boolean;

  loadProjects: () => Promise<void>;
  loadOverview: (id: string) => Promise<void>;
  createProject: (input: { name: string; tickers?: string; thesis?: string }) => Promise<Project | null>;
  updateProject: (id: string, patch: Partial<Pick<Project, "name" | "thesis">> & { tickers?: string[]; openQuestions?: string[] }) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setActiveProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  overview: null,
  overviewLoading: false,

  setActiveProjectId: (id) => set({ activeProjectId: id }),

  loadProjects: async () => {
    const res = await fetch("/api/projects");
    if (!res.ok) return;
    set({ projects: (await res.json()) as Project[] });
  },

  loadOverview: async (id) => {
    set({ overviewLoading: true, overview: null });
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) return;
      set({ overview: (await res.json()) as ProjectOverview, activeProjectId: id });
    } finally {
      set({ overviewLoading: false });
    }
  },

  createProject: async ({ name, tickers, thesis }) => {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, tickers, thesis }),
    });
    if (!res.ok) return null;
    const created = (await res.json()) as Project;
    set((s) => ({ projects: [created, ...s.projects] }));
    return created;
  },

  updateProject: async (id, patch) => {
    // Optimistic: the overview panel edits inline and shouldn't flicker.
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } as Project : p)),
      overview: s.overview?.id === id ? ({ ...s.overview, ...patch } as ProjectOverview) : s.overview,
    }));
    await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  },

  deleteProject: async (id) => {
    const wasActive = get().activeProjectId === id;
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      ...(wasActive ? { activeProjectId: null, overview: null } : {}),
    }));
    await fetch(`/api/projects/${id}`, { method: "DELETE" }).catch(() => {});
  },
}));
