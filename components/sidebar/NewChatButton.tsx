"use client";

import { useChatStore } from "@/stores/chatStore";

export default function NewChatButton() {
  const clearMessages = useChatStore((s) => s.clearMessages);

  return (
    <button
      onClick={clearMessages}
      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] btn-gold font-semibold text-sm"
      style={{
        boxShadow: "0 4px 12px rgba(197, 160, 89, 0.2)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M8 3v10M3 8h10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      New Chat
    </button>
  );
}
