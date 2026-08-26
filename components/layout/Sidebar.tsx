"use client";

import { useRouter } from "next/navigation";
import AnvayMark from "@/components/ui/AnvayMark";
import Icon from "@/components/ui/Icon";
import SidebarLogo from "@/components/sidebar/SidebarLogo";
import SidebarToggle from "@/components/sidebar/SidebarToggle";
import NewChatButton from "@/components/sidebar/NewChatButton";
import ChatHistoryList from "@/components/sidebar/ChatHistoryList";
import UserChip from "@/components/sidebar/UserChip";
import { useChatStore } from "@/stores/chatStore";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { getInitials } from "@/lib/initials";

export default function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  if (collapsed) return <CollapsedRail />;

  return (
    <aside
      className="hidden lg:flex flex-col h-full overflow-hidden shrink-0"
      style={{
        width: 240,
        background: "var(--paper-alt)",
        borderRight: "1px solid var(--line)",
        padding: "14px 10px",
        transition: "width 0.18s var(--ease-out)",
      }}
    >
      <div className="flex items-center justify-between px-1">
        <SidebarLogo />
        <SidebarToggle />
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <NewChatButton />
        <button
          onClick={() => {
            /* TODO: wire to project creation flow */
          }}
          className="btn w-full py-2 text-[13px] cursor-pointer flex items-center justify-center gap-1.5"
          style={{
            background: "transparent",
            border: "1px solid var(--line)",
            color: "var(--ink-600)",
            borderRadius: "var(--radius-md, 10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--hover-surface)";
            e.currentTarget.style.borderColor = "var(--ink-300)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          <Icon name="folderPlus" size={14} strokeWidth={1.8} />
          Create project
        </button>
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

/* A slim icon-only rail — collapsed state keeps navigation reachable
   without spending 240px on it. */
function CollapsedRail() {
  const router = useRouter();
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  return (
    <aside
      className="hidden lg:flex flex-col items-center h-full overflow-hidden shrink-0"
      style={{
        width: 56,
        background: "var(--paper-alt)",
        borderRight: "1px solid var(--line)",
        padding: "14px 8px",
        transition: "width 0.18s var(--ease-out)",
      }}
    >
      <button
        onClick={toggleSidebar}
        aria-label="Expand sidebar"
        title="Expand sidebar"
        className="flex items-center justify-center rounded-lg cursor-pointer"
        style={{ width: 32, height: 32 }}
      >
        <AnvayMark size={22} tone="brand" />
      </button>

      <button
        onClick={() => {
          clearMessages();
          setActiveChatId(null);
          router.push("/chat/new");
        }}
        aria-label="New chat"
        title="New chat"
        className="btn btn-primary mt-4 flex items-center justify-center cursor-pointer"
        style={{ width: 34, height: 34, padding: 0, borderRadius: 10 }}
      >
        <Icon name="plus" size={16} strokeWidth={2.2} />
      </button>

      {user && (
        <div className="mt-auto">
          <span
            className="shrink-0 rounded-full flex items-center justify-center text-white text-[11px] font-semibold"
            style={{
              width: 30,
              height: 30,
              background: "linear-gradient(140deg, var(--blue-400) 0%, var(--blue-600) 100%)",
            }}
          >
            {getInitials(user.name)}
          </span>
        </div>
      )}
    </aside>
  );
}
