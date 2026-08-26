"use client";

import Icon from "@/components/ui/Icon";
import { useUIStore } from "@/stores/uiStore";
import ResizeHandle from "./ResizeHandle";

/* The workspace panel — where a generated comp sheet, an uploaded Excel
   file, or an exported document will open. No real content lives here
   yet; this is the shell, honest about having nothing to show. */
export default function RightPanel() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const rightPanelWidth = useUIStore((s) => s.rightPanelWidth);
  const closeRightPanel = useUIStore((s) => s.closeRightPanel);

  if (!rightPanelOpen) return null;

  return (
    <>
      <ResizeHandle />
      <aside
        className="hidden lg:flex flex-col h-full overflow-hidden shrink-0"
        style={{
          width: rightPanelWidth,
          background: "var(--surface)",
          borderLeft: "1px solid var(--line)",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-between gap-2 px-4"
          style={{ height: 52, borderBottom: "1px solid var(--line)" }}
        >
          <span
            className="text-[13px] font-medium truncate"
            style={{ color: "var(--ink-800)" }}
          >
            Workspace
          </span>
          <button
            onClick={closeRightPanel}
            aria-label="Close panel"
            title="Close panel"
            className="flex items-center justify-center rounded-lg shrink-0 cursor-pointer transition-colors duration-150"
            style={{ width: 28, height: 28, color: "var(--ink-400)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--paper-sunk)";
              e.currentTarget.style.color = "var(--ink-800)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--ink-400)";
            }}
          >
            <Icon name="close" size={15} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center px-6 text-center">
          <span
            className="flex items-center justify-center rounded-2xl mb-3"
            style={{ width: 44, height: 44, background: "var(--paper-sunk)", color: "var(--ink-300)" }}
          >
            <Icon name="layers" size={20} />
          </span>
          <p className="text-[13px] font-medium" style={{ color: "var(--ink-700)" }}>
            Nothing open yet
          </p>
          <p className="text-[12.5px] mt-1.5" style={{ color: "var(--ink-400)", maxWidth: "26ch" }}>
            Generated comp sheets, exports, and uploaded files will appear here.
          </p>
        </div>
      </aside>
    </>
  );
}
