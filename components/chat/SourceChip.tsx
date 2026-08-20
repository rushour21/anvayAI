"use client";

import { Source } from "@/types/chat";
import Icon from "@/components/ui/Icon";

export default function SourceChip({ source, index }: { source: Source; index: number }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl no-underline transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--line)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--blue-200)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--shadow-soft)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--line)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
      title={source.title}
    >
      <span
        className="shrink-0 flex items-center justify-center rounded-md font-mono text-[9px] font-bold"
        style={{
          width: 17,
          height: 17,
          background: `color-mix(in srgb, ${source.agentColor} 14%, transparent)`,
          color: source.agentColor,
        }}
      >
        {index + 1}
      </span>
      <span className="text-[11.5px] font-medium" style={{ color: "var(--ink-700)" }}>
        {source.domain}
      </span>
      <Icon
        name="arrowUpRight"
        size={11}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: "var(--ink-400)" }}
      />
    </a>
  );
}
