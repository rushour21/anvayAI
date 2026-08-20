"use client";

import { TraceStatus } from "@/types/agent";
import Icon, { type IconName } from "@/components/ui/Icon";

interface AgentTraceDotProps {
  label: string;
  icon: IconName;
  color: string;
  status: TraceStatus;
  index: number;
}

export default function AgentTraceDot({
  label,
  icon,
  color,
  status,
  index,
}: AgentTraceDotProps) {
  const isPending = status === "pending";
  const isActive = status === "active";

  return (
    <div
      className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full transition-all duration-300"
      style={{
        background: isActive
          ? `color-mix(in srgb, ${color} 10%, transparent)`
          : "transparent",
        border: `1px solid ${isActive ? `color-mix(in srgb, ${color} 28%, transparent)` : "transparent"}`,
      }}
      title={label}
    >
      <span
        className="relative flex items-center justify-center shrink-0"
        style={{ width: 18, height: 18 }}
      >
        {isActive && (
          <span
            className="absolute rounded-full animate-model-pulse"
            style={{ width: 18, height: 18, background: color }}
          />
        )}
        <span
          className={`relative flex items-center justify-center rounded-full ${
            !isPending ? "animate-dot-pop" : ""
          }`}
          style={{
            width: 18,
            height: 18,
            background: isPending ? "transparent" : `color-mix(in srgb, ${color} 14%, transparent)`,
            border: isPending ? "1px dashed var(--ink-300)" : "none",
            color: isPending ? "var(--ink-300)" : color,
            animationDelay: `${index * 90}ms`,
          }}
        >
          <Icon name={icon} size={10.5} strokeWidth={2} />
        </span>
      </span>
      <span
        className="text-[11px] whitespace-nowrap"
        style={{
          fontWeight: isActive ? 600 : 500,
          color: isPending ? "var(--ink-300)" : isActive ? color : "var(--ink-500)",
        }}
      >
        {label}
      </span>
    </div>
  );
}
