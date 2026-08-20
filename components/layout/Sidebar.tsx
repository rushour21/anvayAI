"use client";

import SidebarLogo from "@/components/sidebar/SidebarLogo";
import NewChatButton from "@/components/sidebar/NewChatButton";
import ChatHistoryList from "@/components/sidebar/ChatHistoryList";
import UserChip from "@/components/sidebar/UserChip";

export default function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col h-full overflow-hidden"
      style={{
        width: 268,
        background: "var(--paper-alt)",
        borderRight: "1px solid var(--line)",
        padding: "18px 12px",
      }}
    >
      <SidebarLogo />

      <div className="mt-5">
        <NewChatButton />
      </div>

      <div className="mt-3 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-0.5">
        <ChatHistoryList />
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--line)" }}>
        <UserChip />
      </div>
    </aside>
  );
}
