"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import MarkdownContent from "@/components/chat/MarkdownContent";
import SheetTable from "./SheetTable";
import { useArtifactStore } from "@/stores/artifactStore";
import { isSheetContent } from "@/types/artifact";

export default function ArtifactView() {
  const active = useArtifactStore((s) => s.active);
  const close = useArtifactStore((s) => s.close);
  const [showHistory, setShowHistory] = useState(false);

  if (!active) return null;

  /* The most recent version's summary is what just changed. Surfacing it means
     an edit reads as an edit — the analyst sees "Added FY26E" rather than
     wondering what the agent quietly rewrote. */
  const latest = active.versions?.[0];
  const hasHistory = (active.versions?.length ?? 0) > 1;

  const exportUrl = (format: "xlsx" | "csv") =>
    `/api/artifacts/${active.id}/export?format=${format}`;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-4 pt-3 pb-2.5" style={{ borderBottom: "1px solid var(--line)" }}>
        <button
          onClick={close}
          className="flex items-center gap-1 text-[11.5px] mb-2 cursor-pointer"
          style={{ color: "var(--ink-400)" }}
        >
          <Icon name="arrowRight" size={11} style={{ transform: "rotate(180deg)" }} />
          All items
        </button>
        <p className="text-[13px] font-medium" style={{ color: "var(--ink-800)" }}>
          {active.title}
        </p>
        <button
          onClick={() => hasHistory && setShowHistory((v) => !v)}
          className="text-[11px] mt-0.5 flex items-center gap-1"
          style={{ color: "var(--ink-400)", cursor: hasHistory ? "pointer" : "default" }}
        >
          {active.kind === "sheet" ? "Sheet" : "Note"} · v{active.currentVersion}
          {hasHistory && (
            <>
              <span>· {active.versions.length} versions</span>
              <Icon
                name="chevronDown"
                size={9}
                style={{ transform: showHistory ? "none" : "rotate(-90deg)" }}
              />
            </>
          )}
        </button>

        {latest?.summary && !showHistory && (
          <p className="text-[11px] mt-1.5 truncate" style={{ color: "var(--ink-500)" }}>
            Last change: {latest.summary}
          </p>
        )}

        {showHistory && (
          <ul className="mt-2 flex flex-col gap-1">
            {active.versions.map((version) => (
              <li key={version.version} className="flex gap-2 text-[11px]">
                <span className="shrink-0 font-medium" style={{ color: "var(--ink-500)" }}>
                  v{version.version}
                </span>
                <span style={{ color: "var(--ink-400)" }}>
                  {version.summary ?? "No description"}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-1.5 mt-2.5">
          {/* A plain link, not fetch+blob: the browser handles the download and
              the Content-Disposition filename from the route is preserved. */}
          <a
            href={exportUrl("xlsx")}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] cursor-pointer"
            style={{ border: "1px solid var(--line)", color: "var(--ink-600)" }}
          >
            <Icon name="upload" size={10} strokeWidth={2} />
            Excel
          </a>
          <a
            href={exportUrl("csv")}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] cursor-pointer"
            style={{ border: "1px solid var(--line)", color: "var(--ink-600)" }}
          >
            CSV
          </a>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-3">
        {isSheetContent(active.content) ? (
          <SheetTable content={active.content} />
        ) : (
          <div className="flex flex-col gap-4">
            {active.content.sections.map((section, i) => (
              <section key={i}>
                <h3 className="text-[12.5px] font-medium mb-1" style={{ color: "var(--ink-800)" }}>
                  {section.heading}
                </h3>
                <div className="text-[12.5px]" style={{ color: "var(--ink-700)" }}>
                  <MarkdownContent content={section.body} />
                </div>
              </section>
            ))}
            {active.content.sources && active.content.sources.length > 0 && (
              <section style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                <h3 className="text-[11px] font-medium mb-1" style={{ color: "var(--ink-500)" }}>
                  Sources
                </h3>
                {active.content.sources.map((source, i) => (
                  <p key={i} className="text-[11px]" style={{ color: "var(--ink-400)" }}>
                    {source.label}
                  </p>
                ))}
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
