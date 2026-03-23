"use client";

import { Source } from "@/types/chat";

interface SourceChipProps {
  source: Source;
}

export default function SourceChip({ source }: SourceChipProps) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-300 no-underline border border-divider-grey"
      style={{
        background: "var(--surface-pure)",
        boxShadow: "var(--shadow-soft)",
        borderLeft: `3px solid ${source.agentColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "var(--shadow-medium)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--shadow-soft)";
      }}
    >
      {/* Favicon circle */}
      <div
        className="flex items-center justify-center rounded-full flex-shrink-0"
        style={{
          width: 18,
          height: 18,
          background: `${source.agentColor}15`,
          fontSize: 9,
          fontWeight: 700,
          color: source.agentColor,
          fontFamily: "var(--font-mono)",
        }}
      >
        {source.domain[0].toUpperCase()}
      </div>
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          opacity: 0.9,
        }}
      >
        {source.domain}
      </span>
    </a>
  );
}
