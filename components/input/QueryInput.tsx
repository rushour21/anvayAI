"use client";

import { useState, useCallback, KeyboardEvent } from "react";
import { useAutoResize } from "@/hooks/useAutoResize";
import { useChatStore } from "@/stores/chatStore";
import SendButton from "./SendButton";

export default function QueryInput() {
  const [value, setValue] = useState("");
  const { textareaRef, resize } = useAutoResize(6);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const isStreaming = useChatStore((s) => s.isStreaming);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    sendMessage(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [value, isStreaming, sendMessage, textareaRef]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    /* Enter sends; Shift+Enter and Cmd/Ctrl+Enter both stay available. */
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2.5">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          resize();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Ask about a company, a filing, or your own documents"
        rows={1}
        aria-label="Message"
        className="flex-1 resize-none bg-transparent outline-none text-[14.5px]"
        style={{
          color: "var(--ink-900)",
          lineHeight: "22px",
          maxHeight: 132,
          paddingBlock: 6,
        }}
      />
      <SendButton onClick={handleSend} disabled={!value.trim() || isStreaming} />
    </div>
  );
}
