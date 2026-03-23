"use client";

import SidebarLogo from "@/components/sidebar/SidebarLogo";
import NewChatButton from "@/components/sidebar/NewChatButton";
import ChatHistoryList from "@/components/sidebar/ChatHistoryList";
import UserChip from "@/components/sidebar/UserChip";

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col h-full overflow-hidden border-r"
      style={{
        width: 280,
        background: "linear-gradient(180deg, #1A1F3C 0%, #11142B 100%)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        padding: "24px 16px",
      }}
    >
      <SidebarLogo isDark />
      <div className="mt-8">
        <NewChatButton />
      </div>
      <div className="mt-8 flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-1">
        <ChatHistoryList />
      </div>
      <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}>
        <UserChip isDark />
      </div>
    </aside>
  );
}
