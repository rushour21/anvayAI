"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChatStore, SESSION_START } from "@/stores/chatStore";
import ChatHistoryItem from "./ChatHistoryItem";

const DAY = 86_400_000;

export default function ChatHistoryList() {
  const router = useRouter();
  const chatHistory = useChatStore((s) => s.chatHistory);
  const activeChatId = useChatStore((s) => s.activeChatId);
  const deleteChat = useChatStore((s) => s.deleteChat);
  const loadChatHistory = useChatStore((s) => s.loadChatHistory);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  /* Project conversations are listed under their project (ProjectList.tsx),
     not here — otherwise every chat appears twice and the recents list stops
     being a useful "what was I just doing". */
  const unfiled = chatHistory.filter((c) => !c.projectId);

  /* Bucketed against the store's fixed reference clock rather than a live
     Date.now(), which would be impure in render and desync hydration. */
  const now = SESSION_START;
  const groups = [
    { label: "Today", items: unfiled.filter((c) => now - c.createdAt < DAY) },
    {
      label: "Yesterday",
      items: unfiled.filter(
        (c) => now - c.createdAt >= DAY && now - c.createdAt < 2 * DAY
      ),
    },
    {
      label: "Earlier",
      items: unfiled.filter((c) => now - c.createdAt >= 2 * DAY),
    },
  ].filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {groups.map((g) => (
        <section key={g.label}>
          <h3
            className="px-2.5 pt-4 pb-1.5 text-[11px] font-medium"
            style={{ color: "var(--ink-400)", letterSpacing: "0.04em" }}
          >
            {g.label}
          </h3>
          <div className="flex flex-col gap-0.5">
            {g.items.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                title={chat.title}
                isActive={chat.id === activeChatId}
                onClick={() => router.push(`/chat/${chat.id}`)}
                onDelete={() => deleteChat(chat.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
