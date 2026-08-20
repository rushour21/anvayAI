"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import AgentTrace from "./AgentTrace";
import SourcesStrip from "./SourcesStrip";
import MessageActions from "./MessageActions";
import AnvayMark from "./AnvayMark";

export default function MessageBubble({ message }: { message: Message }) {
  const [hovered, setHovered] = useState(false);
  const isUser = message.role === "user";

  /* User turns are compact right-aligned bubbles; assistant turns run full
     width as a document, which is what long cited answers need. */
  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div
          className="px-4 py-2.5 text-[14.5px] leading-relaxed"
          style={{
            maxWidth: "78%",
            background: "var(--blue-500)",
            color: "#fff",
            borderRadius: "18px 18px 6px 18px",
            whiteSpace: "pre-wrap",
          }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex gap-3 animate-fade-up"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnvayMark />

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {message.traceSteps && message.traceSteps.length > 0 && (
          <div className="self-start max-w-full overflow-x-auto">
            <AgentTrace steps={message.traceSteps} />
          </div>
        )}

        <div
          className="text-[15px] leading-[1.72]"
          style={{ color: "var(--ink-700)", whiteSpace: "pre-wrap" }}
        >
          {message.content}
        </div>

        {message.sources && message.sources.length > 0 && (
          <SourcesStrip sources={message.sources} />
        )}

        <div
          className="transition-opacity duration-150"
          style={{ opacity: hovered ? 1 : 0 }}
        >
          <MessageActions content={message.content} />
        </div>
      </div>
    </div>
  );
}
