"use client";

import Icon, { type IconName } from "@/components/ui/Icon";

interface AgentPillProps {
  icon: IconName;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

export default function AgentPill({
  icon,
  label,
  color,
  isActive,
  onClick,
}: AgentPillProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isActive}
      className="flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full cursor-pointer transition-all duration-200"
      style={{
        background: isActive ? "var(--surface)" : "transparent",
        border: `1px solid ${isActive ? "var(--blue-200)" : "var(--line)"}`,
        boxShadow: isActive ? "var(--shadow-soft)" : "none",
        fontSize: 13,
        fontWeight: 500,
        color: isActive ? "var(--ink-900)" : "var(--ink-400)",
      }}
    >
      <span
        className="flex items-center justify-center rounded-md shrink-0 transition-colors duration-200"
        style={{
          width: 22,
          height: 22,
          background: isActive
            ? `color-mix(in srgb, ${color} 14%, transparent)`
            : "var(--paper-sunk)",
          color: isActive ? color : "var(--ink-300)",
        }}
      >
        <Icon name={icon} size={13} />
      </span>
      {label}
    </button>
  );
}
