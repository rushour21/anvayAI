"use client";

import { Message } from "@/types/chat";
import AgentTrace from "./AgentTrace";
import SourcesStrip from "./SourcesStrip";
import MessageActions from "./MessageActions";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-4 animate-fade-up ${isUser ? "flex-row-reverse" : "flex-row"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div
            className="rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #1A1F3C 0%, #2D3250 100%)",
            }}
          >
            RI
          </div>
        ) : (
          <div
            className="rounded-full flex items-center justify-center border border-divider-grey shadow-sm"
            style={{
              width: 32,
              height: 32,
              background: "var(--surface-pure)",
            }}
          >
            <div 
              className="w-5 h-5 rounded-sm"
              style={{
                background: "var(--secondary-gold)",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
              }}
            />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`} style={{ maxWidth: "82%" }}>
        {/* Agent trace for AI messages */}
        {!isUser && message.traceSteps && (
          <div className="mb-2">
            <AgentTrace steps={message.traceSteps} />
          </div>
        )}

        {/* Bubble */}
        <div
          className="relative px-5 py-3.5 border border-divider-grey transition-all duration-300"
          style={{
            background: isUser
              ? "rgba(226, 232, 240, 0.4)"
              : "var(--surface-pure)",
            borderRadius: isUser ? "20px 4px 20px 20px" : "4px 20px 20px 20px",
            boxShadow: isUser ? "none" : "var(--shadow-soft)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 500,
              lineHeight: 1.7,
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
            }}
          >
            {message.content}
          </div>
        </div>

        {/* Sources strip for AI messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <SourcesStrip sources={message.sources} />
          </div>
        )}

        {/* Action buttons on hover */}
        {!isUser && isHovered && (
          <div className="mt-2 animate-fade-up">
            <MessageActions />
          </div>
        )}
      </div>
    </div>
  );
}
