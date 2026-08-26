"use client";

import { useChatStore } from "@/stores/chatStore";
import Icon, { type IconName } from "@/components/ui/Icon";

interface SuggestionCardProps {
  label: string;
  icon: IconName;
  prompt: string;
}

export default function SuggestionCard({ label, icon, prompt }: SuggestionCardProps) {
  const sendMessage = useChatStore((s) => s.sendMessage);

  return (
    <button
      onClick={() => sendMessage(prompt)}
      className="group text-left p-3.5 rounded-2xl transition-all duration-200 cursor-pointer"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--blue-200)";
        e.currentTarget.style.boxShadow = "var(--shadow-soft)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <span className="flex items-center gap-1.5 mb-2">
        <Icon name={icon} size={13} style={{ color: "var(--blue-500)" }} />
        <span
          className="text-[11px] font-medium uppercase"
          style={{ color: "var(--ink-400)", letterSpacing: "0.06em" }}
        >
          {label}
        </span>
      </span>
      <span
        className="block text-[13px] leading-snug"
        style={{ color: "var(--ink-700)" }}
      >
        {prompt}
      </span>
    </button>
  );
}
