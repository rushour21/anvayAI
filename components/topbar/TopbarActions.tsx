"use client";

import Icon, { type IconName } from "@/components/ui/Icon";

function IconButton({ label, icon }: { label: string; icon: IconName }) {
  return (
    <button
      aria-label={label}
      title={label}
      className="flex items-center justify-center rounded-xl transition-all duration-150 cursor-pointer"
      style={{
        width: 34,
        height: 34,
        background: "transparent",
        border: "1px solid transparent",
        color: "var(--ink-500)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--paper-sunk)";
        e.currentTarget.style.color = "var(--ink-800)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--ink-500)";
      }}
    >
      <Icon name={icon} size={17} />
    </button>
  );
}

export default function TopbarActions() {
  return (
    <div className="flex items-center gap-0.5">
      <IconButton label="Search chats" icon="search" />
      <IconButton label="Share" icon="share" />
      <IconButton label="Settings" icon="settings" />
    </div>
  );
}
