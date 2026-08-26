"use client";

import Icon from "@/components/ui/Icon";
import { useUIStore } from "@/stores/uiStore";

export default function TopbarActions() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

  return (
    <div className="flex items-center">
      <button
        aria-label={rightPanelOpen ? "Close workspace panel" : "Open workspace panel"}
        aria-pressed={rightPanelOpen}
        title={rightPanelOpen ? "Close workspace panel" : "Open workspace panel"}
        onClick={toggleRightPanel}
        className="flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer"
        style={{
          width: 34,
          height: 34,
          background: rightPanelOpen ? "var(--blue-50)" : "transparent",
          border: "1px solid transparent",
          color: rightPanelOpen ? "var(--blue-600)" : "var(--ink-500)",
        }}
        onMouseEnter={(e) => {
          if (!rightPanelOpen) e.currentTarget.style.background = "var(--paper-sunk)";
          e.currentTarget.style.color = rightPanelOpen ? "var(--blue-600)" : "var(--ink-800)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = rightPanelOpen ? "var(--blue-50)" : "transparent";
          e.currentTarget.style.color = rightPanelOpen ? "var(--blue-600)" : "var(--ink-500)";
        }}
      >
        <Icon name="layers" size={17} />
      </button>
    </div>
  );
}
