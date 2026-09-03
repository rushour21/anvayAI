"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import ThesisCard from "@/components/projects/ThesisCard";
import OpenQuestions from "@/components/projects/OpenQuestions";
import { useProjectStore } from "@/stores/projectStore";
import { useChatStore } from "@/stores/chatStore";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-4"
      style={{ background: "var(--surface)", border: "1px solid var(--line)" }}
    >
      <h2 className="text-[12px] font-medium mb-2" style={{ color: "var(--ink-500)" }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <p className="text-[12.5px]" style={{ color: "var(--ink-400)" }}>
      {text}
    </p>
  );
}

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const overview = useProjectStore((s) => s.overview);
  const loading = useProjectStore((s) => s.overviewLoading);
  const loadOverview = useProjectStore((s) => s.loadOverview);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  useEffect(() => {
    if (projectId) loadOverview(projectId);
  }, [projectId, loadOverview]);

  const startConversation = () => {
    clearMessages();
    setActiveChatId(null);
    /* The project is carried on the URL; the store reads it when creating the
       conversation, so the new chat lands inside this project. */
    router.push(`/chat/new?projectId=${projectId}`);
  };

  if (loading || !overview) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[13px]" style={{ color: "var(--ink-400)" }}>
          {loading ? "Loading project…" : "Project not found."}
        </p>
      </div>
    );
  }

  const changed = overview.changedSince;
  const hasChanges =
    changed && changed.conversations + changed.documents + changed.artifacts > 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto px-6 py-6 flex flex-col gap-3" style={{ maxWidth: 820 }}>
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[20px] font-medium" style={{ color: "var(--ink-800)" }}>
              {overview.name}
            </h1>
            {overview.tickers.length > 0 && (
              <p className="text-[12.5px] mt-1" style={{ color: "var(--ink-400)" }}>
                {overview.tickers.join(" · ")}
              </p>
            )}
          </div>
          <button
            onClick={startConversation}
            className="btn btn-primary shrink-0 px-3 py-1.5 rounded-lg text-[12.5px] cursor-pointer flex items-center gap-1.5"
          >
            <Icon name="plus" size={13} strokeWidth={2.2} />
            New conversation
          </button>
        </header>

        {/* Leads with what moved while they were away — the analyst's core
            "what changed" loop, not a directory listing. */}
        {hasChanges && (
          <section
            className="rounded-xl p-4"
            style={{
              background: "color-mix(in srgb, var(--blue-500) 7%, transparent)",
              border: "1px solid color-mix(in srgb, var(--blue-500) 22%, transparent)",
            }}
          >
            <h2 className="text-[12px] font-medium mb-1" style={{ color: "var(--ink-600)" }}>
              Since you last opened this
            </h2>
            <p className="text-[13px]" style={{ color: "var(--ink-700)" }}>
              {[
                changed.artifacts && `${changed.artifacts} new item${changed.artifacts > 1 ? "s" : ""}`,
                changed.documents && `${changed.documents} new document${changed.documents > 1 ? "s" : ""}`,
                changed.conversations &&
                  `${changed.conversations} conversation${changed.conversations > 1 ? "s" : ""} updated`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </section>
        )}

        <ThesisCard projectId={overview.id} thesis={overview.thesis} />
        <OpenQuestions projectId={overview.id} questions={overview.openQuestions} />

        <Section title="Saved items">
          {overview.artifacts.length === 0 ? (
            <Empty text="Ask for a comparison table or a note in a conversation — it gets saved here with its sources." />
          ) : (
            <ul className="flex flex-col gap-1">
              {overview.artifacts.map((artifact) => (
                <li key={artifact.id} className="flex items-center gap-2">
                  <Icon
                    name={artifact.kind === "sheet" ? "layers" : "document"}
                    size={12}
                    style={{ color: "var(--agent-rag)" }}
                  />
                  <span className="text-[12.5px] flex-1 truncate" style={{ color: "var(--ink-700)" }}>
                    {artifact.title}
                  </span>
                  <a
                    href={`/api/artifacts/${artifact.id}/export?format=xlsx`}
                    className="text-[11.5px] shrink-0"
                    style={{ color: "var(--blue-500)" }}
                  >
                    Excel
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Conversations">
          {overview.conversations.length === 0 ? (
            <Empty text="No conversations in this project yet." />
          ) : (
            <ul className="flex flex-col gap-0.5">
              {overview.conversations.map((convo) => (
                <li key={convo.id}>
                  <button
                    onClick={() => router.push(`/chat/${convo.id}`)}
                    className="w-full text-left text-[12.5px] py-1 cursor-pointer truncate"
                    style={{ color: "var(--ink-700)" }}
                  >
                    {convo.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Documents">
          {overview.documents.length === 0 ? (
            <Empty text="Upload a filing or report in any conversation here — it becomes searchable from all of them." />
          ) : (
            <ul className="flex flex-col gap-1">
              {overview.documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2">
                  <Icon name="document" size={12} style={{ color: "var(--ink-400)" }} />
                  <span className="text-[12.5px] flex-1 truncate" style={{ color: "var(--ink-700)" }}>
                    {doc.filename}
                  </span>
                  <span className="text-[11px] shrink-0" style={{ color: "var(--ink-400)" }}>
                    {doc.status === "ready" ? `${doc.pageCount ?? "—"} pages` : doc.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}
