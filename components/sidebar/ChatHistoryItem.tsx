"use client";

import Icon from "@/components/ui/Icon";

interface ChatHistoryItemProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

export default function ChatHistoryItem({
  title,
  isActive,
  onClick,
}: ChatHistoryItemProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors duration-150 cursor-pointer"
      style={{
        background: isActive ? "var(--surface)" : "transparent",
        border: `1px solid ${isActive ? "var(--line)" : "transparent"}`,
        boxShadow: isActive ? "var(--shadow-hair)" : "none",
        color: isActive ? "var(--ink-900)" : "var(--ink-500)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.6)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <Icon
        name="message"
        size={14}
        className="shrink-0"
        style={{ color: isActive ? "var(--blue-500)" : "var(--ink-300)" }}
      />
      <span
        className="truncate text-[13.5px]"
        style={{ fontWeight: isActive ? 500 : 400 }}
      >
        {title}
      </span>
    </button>
  );
}
