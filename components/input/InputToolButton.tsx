"use client";

import Icon, { type IconName } from "@/components/ui/Icon";

interface InputToolButtonProps {
  label: string;
  icon: IconName;
  isActive: boolean;
  onClick: () => void;
}

export default function InputToolButton({
  label,
  icon,
  isActive,
  onClick,
}: InputToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
      style={{
        background: isActive ? "var(--blue-50)" : "transparent",
        border: `1px solid ${isActive ? "var(--blue-200)" : "transparent"}`,
        fontSize: 12,
        fontWeight: 500,
        color: isActive ? "var(--blue-700)" : "var(--ink-400)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--paper-sunk)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon name={icon} size={13} />
      {label}
    </button>
  );
}
