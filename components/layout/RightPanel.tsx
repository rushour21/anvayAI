"use client";

import { useEffect } from "react";
import Icon from "@/components/ui/Icon";
import ArtifactList from "@/components/workspace/ArtifactList";
import ArtifactView from "@/components/workspace/ArtifactView";
import { useUIStore } from "@/stores/uiStore";
import { useChatStore } from "@/stores/chatStore";
import { useArtifactStore } from "@/stores/artifactStore";
import ResizeHandle from "./ResizeHandle";

/* The workspace panel — saved artifacts (comp sheets, notes) for the current
   conversation. Shows the list, or one artifact when opened. */
export default function RightPanel() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const rightPanelWidth = useUIStore((s) => s.rightPanelWidth);
  const closeRightPanel = useUIStore((s) => s.closeRightPanel);

  const activeChatId = useChatStore((s) => s.activeChatId);
  const active = useArtifactStore((s) => s.active);
  const loadForConversation = useArtifactStore((s) => s.loadForConversation);
  const clear = useArtifactStore((s) => s.clear);

  /* Refetched whenever the panel opens or the conversation changes — an agent
     run can create an artifact at any point, and the list is cheap. */
  useEffect(() => {
    if (!rightPanelOpen) return;
    if (activeChatId) loadForConversation(activeChatId);
    else clear();
  }, [rightPanelOpen, activeChatId, loadForConversation, clear]);

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

        {active ? <ArtifactView /> : <ArtifactList />}
      </aside>
    </>
  );
}
