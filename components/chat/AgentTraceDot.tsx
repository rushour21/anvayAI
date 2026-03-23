"use client";

import { TraceStatus } from "@/types/agent";

interface AgentTraceDotProps {
  label: string;
  color: string;
  status: TraceStatus;
  index: number;
}

export default function AgentTraceDot({ label, color, status, index }: AgentTraceDotProps) {
  // Use professional indigo/gold for trace if needed, but keeping agent colors for identity
  return (
    <div
      className="flex flex-col items-center"
      style={{
        animationDelay: `${index * 150}ms`,
      }}
    >
      <div className="relative flex items-center justify-center" style={{ width: 14, height: 14 }}>
        {status === "active" && (
          <span
            className="absolute rounded-full animate-ping"
            style={{
              width: 14,
              height: 14,
              background: color,
              opacity: 0.2,
            }}
          />
        )}
        <span
          className={`rounded-full transition-all duration-300 ${
            status !== "pending" ? "animate-dot-pop" : ""
          }`}
          style={{
            width: 7,
            height: 7,
            background:
              status === "complete" || status === "active" ? color : "transparent",
            border:
              status === "pending"
                ? `1.5px dashed rgba(0,0,0,0.15)`
                : `1.5px solid ${color}`,
          }}
        />
      </div>
      <span
        className="mt-1.5"
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: status === "active" ? color : "var(--text-slate)",
          opacity: status === "pending" ? 0.4 : 0.8,
          fontFamily: "var(--font-body)",
          letterSpacing: "0.4px",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}
