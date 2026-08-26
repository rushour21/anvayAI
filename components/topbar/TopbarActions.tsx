"use client";

import Icon, { type IconName } from "@/components/ui/Icon";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useUIStore } from "@/stores/uiStore";

function IconButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: IconName;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className="flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer"
      style={{
        width: 34,
        height: 34,
        background: active ? "var(--blue-50)" : "transparent",
        border: "1px solid transparent",
        color: active ? "var(--blue-600)" : "var(--ink-500)",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "var(--paper-sunk)";
        e.currentTarget.style.color = active ? "var(--blue-600)" : "var(--ink-800)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? "var(--blue-50)" : "transparent";
        e.currentTarget.style.color = active ? "var(--blue-600)" : "var(--ink-500)";
      }}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

export default function TopbarActions() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

  return (
    <div className="flex items-center gap-0.5">
      <IconButton label="Search chats" icon="search" />
      <IconButton label="Share" icon="share" />
      <IconButton
        label={rightPanelOpen ? "Close workspace panel" : "Open workspace panel"}
        icon="layers"
        active={rightPanelOpen}
        onClick={toggleRightPanel}
      />
      <ThemeToggle />
      <IconButton label="Settings" icon="sliders" />
    </div>
  );
}
