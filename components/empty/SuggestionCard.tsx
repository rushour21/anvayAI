"use client";

import { useChatStore } from "@/stores/chatStore";

interface SuggestionCardProps {
  label: string;
  description: string;
}

export default function SuggestionCard({ label, description }: SuggestionCardProps) {
  const sendMessage = useChatStore((s) => s.sendMessage);

  return (
    <button
      onClick={() => sendMessage(description)}
      className="text-left p-5 rounded-2xl transition-all duration-300 cursor-pointer group surface-card hover:shadow-medium hover:-translate-y-1"
      style={{
        minWidth: 240,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "1px",
          textTransform: "uppercase" as const,
          color: "var(--secondary-gold)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </div>
      <div
        className="mt-2"
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "var(--text-slate)",
          lineHeight: 1.5,
          fontFamily: "var(--font-body)",
        }}
      >
        {description}
      </div>
    </button>
  );
}
