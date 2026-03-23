"use client";

import { useChatStore } from "@/stores/chatStore";
import ChatHistoryItem from "./ChatHistoryItem";

export default function ChatHistoryList() {
  const chatHistory = useChatStore((s) => s.chatHistory);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const setActiveChatId = useChatStore((s) => s.setActiveChatId);

  // Group by relative time
  const now = Date.now();
  const today = chatHistory.filter((c) => now - c.createdAt < 86400000);
  const yesterday = chatHistory.filter(
    (c) => now - c.createdAt >= 86400000 && now - c.createdAt < 172800000
  );
  const older = chatHistory.filter((c) => now - c.createdAt >= 172800000);

  const sectionLabel = (text: string) => (
    <div
      className="px-2 pt-4 pb-1.5"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.8px",
        textTransform: "uppercase" as const,
        color: "rgba(255, 255, 255, 0.4)",
        fontFamily: "var(--font-body)",
      }}
    >
      {text}
    </div>
  );

  const renderGroup = (items: typeof chatHistory) =>
    items.map((chat) => (
      <ChatHistoryItem
        key={chat.id}
        title={chat.title}
        isActive={chat.id === activeChatId}
        onClick={() => setActiveChatId(chat.id)}
      />
    ));

  return (
    <div>
      {today.length > 0 && (
        <>
          {sectionLabel("Today")}
          {renderGroup(today)}
        </>
      )}
      {yesterday.length > 0 && (
        <>
          {sectionLabel("Yesterday")}
          {renderGroup(yesterday)}
        </>
      )}
      {older.length > 0 && (
        <>
          {sectionLabel("Previous")}
          {renderGroup(older)}
        </>
      )}
    </div>
  );
}
