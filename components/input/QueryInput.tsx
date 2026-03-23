"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { useChatStore } from "@/stores/chatStore";
import SendButton from "./SendButton";

export default function QueryInput() {
  const [value, setValue] = useState("");
  const { textareaRef, resize } = useAutoResize(5);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [value, isStreaming, sendMessage, textareaRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything — agents will collaborate on your answer…"
        rows={1}
        className="flex-1 resize-none bg-transparent outline-none"
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 400,
          color: "var(--text-primary)",
          lineHeight: "22px",
          maxHeight: 110,
        }}
      />
      <SendButton onClick={handleSend} disabled={!value.trim() || isStreaming} />
    </div>
  );
}
