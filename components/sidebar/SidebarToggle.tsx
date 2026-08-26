"use client";

import Icon from "@/components/ui/Icon";
import { useUIStore } from "@/stores/uiStore";

export default function SidebarToggle() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <button
      onClick={toggleSidebar}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="flex items-center justify-center rounded-lg shrink-0 transition-colors duration-150 cursor-pointer"
      style={{ width: 30, height: 30, color: "var(--ink-400)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--hover-surface)";
        e.currentTarget.style.color = "var(--ink-800)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--ink-400)";
      }}
    >
      <Icon name="panelLeft" size={16} />
    </button>
  );
}
