"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";

interface ChatHistoryItemProps {
  title: string;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export default function ChatHistoryItem({
  title,
  isActive,
  onClick,
  onDelete,
}: ChatHistoryItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="group relative w-full flex items-center gap-2.5 rounded-xl transition-colors duration-150"
      style={{
        background: isActive
          ? "var(--surface)"
          : hovered
            ? "var(--hover-surface)"
            : "transparent",
        border: `1px solid ${isActive ? "var(--line)" : "transparent"}`,
        boxShadow: isActive ? "var(--shadow-hair)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onClick}
        className="flex items-center gap-2.5 flex-1 min-w-0 px-2.5 py-2 text-left cursor-pointer"
        style={{
          color: isActive ? "var(--ink-900)" : "var(--ink-500)",
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

      {/* Delete button — visible on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete chat"
        title="Delete chat"
        className="flex items-center justify-center rounded-md shrink-0 cursor-pointer transition-all duration-150"
        style={{
          width: 24,
          height: 24,
          marginRight: 6,
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
          color: "var(--ink-400)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--red-500, #ef4444)";
          e.currentTarget.style.background = "var(--red-50, rgba(239,68,68,0.08))";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--ink-400)";
          e.currentTarget.style.background = "transparent";
        }}
      >
        <Icon name="trash" size={13} strokeWidth={1.8} />
      </button>
    </div>
  );
}
