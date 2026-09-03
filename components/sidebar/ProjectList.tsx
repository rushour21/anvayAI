"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { useProjectStore } from "@/stores/projectStore";
import { useChatStore } from "@/stores/chatStore";

/* Projects own their conversations, the way a folder owns its files: a
   project chat lives here and is deliberately absent from the flat recents
   list, so it appears exactly once. */
export default function ProjectList() {
  const router = useRouter();
  const params = useParams<{ projectId?: string; chatId?: string }>();
  const projects = useProjectStore((s) => s.projects);
  const loadProjects = useProjectStore((s) => s.loadProjects);

  // Raw array selectors, filtered outside — filtering inside a Zustand
  // selector returns a new array each render and loops (see AttachedDocuments).
  const chatHistory = useChatStore((s) => s.chatHistory);
  const activeChatId = useChatStore((s) => s.activeChatId);

  /* Only explicit clicks are stored. Whether a row is open is DERIVED from
     that plus the current context, rather than synced into state by an
     effect — the effect version trips react-hooks/set-state-in-effect and
     has to re-render twice to settle. */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  /* The project you're looking at, or the one owning the chat you're in,
     opens on its own — you almost always want to see its siblings. */
  const activeChat = chatHistory.find((c) => c.id === activeChatId);
  const contextProjectId = params?.projectId ?? activeChat?.projectId ?? null;

  if (projects.length === 0) return null;

  return (
    <section>
      <h3
        className="px-2.5 pt-4 pb-1.5 text-[11px] font-medium"
        style={{ color: "var(--ink-400)", letterSpacing: "0.04em" }}
      >
        Projects
      </h3>

      <div className="flex flex-col gap-0.5">
        {projects.map((project) => {
          const isActive = params?.projectId === project.id;
          const isOpen = overrides[project.id] ?? project.id === contextProjectId;
          const conversations = chatHistory.filter((c) => c.projectId === project.id);

          return (
            <div key={project.id}>
              <div
                className="group w-full flex items-center rounded-lg transition-colors duration-150"
                style={{ background: isActive ? "var(--hover-surface)" : "transparent" }}
              >
                <button
                  onClick={() => setOverrides((prev) => ({ ...prev, [project.id]: !isOpen }))}
                  aria-label={isOpen ? `Collapse ${project.name}` : `Expand ${project.name}`}
                  aria-expanded={isOpen}
                  className="shrink-0 flex items-center justify-center cursor-pointer"
                  style={{ width: 20, height: 28, color: "var(--ink-300)" }}
                >
                  <Icon
                    name="chevronDown"
                    size={11}
                    style={{
                      transform: isOpen ? "none" : "rotate(-90deg)",
                      transition: "transform 0.15s var(--ease-out)",
                    }}
                  />
                </button>

                <button
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="flex-1 min-w-0 text-left pr-2 py-1.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Icon name="folderPlus" size={12} style={{ color: "var(--ink-400)" }} />
                    <span
                      className="text-[13px] truncate"
                      style={{
                        color: isActive ? "var(--ink-800)" : "var(--ink-600)",
                        fontWeight: isActive ? 500 : 400,
                      }}
                    >
                      {project.name}
                    </span>
                  </span>
                  {project.tickers.length > 0 && (
                    <span
                      className="block text-[10.5px] mt-0.5 pl-[18px] truncate"
                      style={{ color: "var(--ink-400)" }}
                    >
                      {project.tickers.join(" · ")}
                    </span>
                  )}
                </button>
              </div>

              {isOpen && (
                <div
                  className="ml-[19px] pl-2 flex flex-col gap-0.5 mt-0.5"
                  style={{ borderLeft: "1px solid var(--line)" }}
                >
                  {conversations.length === 0 ? (
                    <p className="px-2 py-1 text-[11.5px]" style={{ color: "var(--ink-400)" }}>
                      No conversations yet
                    </p>
                  ) : (
                    conversations.map((chat) => {
                      const chatActive = chat.id === activeChatId;
                      return (
                        <button
                          key={chat.id}
                          onClick={() => router.push(`/chat/${chat.id}`)}
                          className="text-left px-2 py-1 rounded-md truncate text-[12.5px] cursor-pointer transition-colors duration-150"
                          style={{
                            color: chatActive ? "var(--ink-900)" : "var(--ink-500)",
                            fontWeight: chatActive ? 500 : 400,
                            background: chatActive ? "var(--surface)" : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (!chatActive) e.currentTarget.style.background = "var(--hover-surface)";
                          }}
                          onMouseLeave={(e) => {
                            if (!chatActive) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {chat.title}
                        </button>
                      );
                    })
                  )}

                  <button
                    onClick={() => router.push(`/chat/new?projectId=${project.id}`)}
                    className="text-left px-2 py-1 rounded-md text-[11.5px] cursor-pointer flex items-center gap-1"
                    style={{ color: "var(--ink-400)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink-700)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink-400)")}
                  >
                    <Icon name="plus" size={10} strokeWidth={2.2} />
                    New conversation
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
