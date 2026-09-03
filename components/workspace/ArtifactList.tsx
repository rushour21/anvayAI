"use client";

import Icon from "@/components/ui/Icon";
import { useArtifactStore } from "@/stores/artifactStore";

/* Flat list with the kind as a badge, sorted by recency — deliberately not
   folders by file type. An analyst looks for "the thing I was just working
   on", not for "my sheets folder". */
export default function ArtifactList() {
  const artifacts = useArtifactStore((s) => s.artifacts);
  const open = useArtifactStore((s) => s.open);

  if (artifacts.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center">
        <span
          className="flex items-center justify-center rounded-2xl mb-3"
          style={{ width: 44, height: 44, background: "var(--paper-sunk)", color: "var(--ink-300)" }}
        >
          <Icon name="layers" size={20} />
        </span>
        <p className="text-[13px] font-medium" style={{ color: "var(--ink-700)" }}>
          Nothing saved yet
        </p>
        <p className="text-[12.5px] mt-1.5" style={{ color: "var(--ink-400)", maxWidth: "28ch" }}>
          Ask for a comparison or a note — it gets saved here with its sources, ready to
          export to Excel.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
      {artifacts.map((artifact) => (
        <button
          key={artifact.id}
          onClick={() => open(artifact.id)}
          className="text-left px-2.5 py-2 rounded-lg cursor-pointer transition-colors duration-150"
          style={{ border: "1px solid var(--line)", background: "var(--surface)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--paper-sunk)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface)")}
        >
          <span className="flex items-center gap-1.5">
            <Icon
              name={artifact.kind === "sheet" ? "layers" : "document"}
              size={12}
              style={{ color: "var(--agent-rag)" }}
            />
            <span
              className="text-[12px] font-medium truncate"
              style={{ color: "var(--ink-700)" }}
            >
              {artifact.title}
            </span>
          </span>
          <span className="block text-[10.5px] mt-0.5" style={{ color: "var(--ink-400)" }}>
            {artifact.kind === "sheet" ? "Sheet" : "Note"} · v{artifact.currentVersion}
          </span>
        </button>
      ))}
    </div>
  );
}
