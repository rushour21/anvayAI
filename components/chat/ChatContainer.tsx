"use client";

import { useChatStore } from "@/stores/chatStore";
import MessageBubble from "./MessageBubble";
import EmptyState from "./EmptyState";
import TypingIndicator from "./TypingIndicator";
import { useEffect, useRef } from "react";

export default function ChatContainer() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
      style={{ padding: "36px 40px" }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <div className="flex flex-col" style={{ gap: 28 }}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isStreaming && messages[messages.length - 1]?.role === "user" && (
            <TypingIndicator />
          )}
        </div>
      </div>
    </div>
  );
}
