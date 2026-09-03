"use client";

import { create } from "zustand";
import { ArtifactContent, ArtifactKind, ArtifactSpec } from "@/types/artifact";

export interface ArtifactListItem {
  id: string;
  kind: ArtifactKind;
  title: string;
  projectId: string | null;
  conversationId: string | null;
  currentVersion: number;
  createdAt: number;
  updatedAt: number;
}

export interface ArtifactVersionMeta {
  version: number;
  author: string;
  summary: string | null;
  createdAt: number;
}

export interface LoadedArtifact extends ArtifactListItem {
  spec: ArtifactSpec | null;
  content: ArtifactContent;
  versions: ArtifactVersionMeta[];
}

interface ArtifactState {
  artifacts: ArtifactListItem[];
  active: LoadedArtifact | null;
  loading: boolean;

  loadForConversation: (conversationId: string) => Promise<void>;
  loadForProject: (projectId: string) => Promise<void>;
  open: (id: string) => Promise<void>;
  close: () => void;
  remove: (id: string) => Promise<void>;
  clear: () => void;
}

export const useArtifactStore = create<ArtifactState>((set) => {
  const load = async (query: string) => {
    const res = await fetch(`/api/artifacts?${query}`);
    if (!res.ok) return;
    set({ artifacts: (await res.json()) as ArtifactListItem[] });
  };

  return {
    artifacts: [],
    active: null,
    loading: false,

    loadForConversation: (conversationId) => load(`conversationId=${conversationId}`),
    loadForProject: (projectId) => load(`projectId=${projectId}`),

    open: async (id) => {
      set({ loading: true });
      try {
        const res = await fetch(`/api/artifacts/${id}`);
        if (!res.ok) return;
        set({ active: (await res.json()) as LoadedArtifact });
      } finally {
        set({ loading: false });
      }
    },

    close: () => set({ active: null }),

    remove: async (id) => {
      set((s) => ({
        artifacts: s.artifacts.filter((a) => a.id !== id),
        active: s.active?.id === id ? null : s.active,
      }));
      await fetch(`/api/artifacts/${id}`, { method: "DELETE" }).catch(() => {});
    },

    clear: () => set({ artifacts: [], active: null }),
  };
});
