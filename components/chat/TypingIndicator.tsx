"use client";

import { useChatStore } from "@/stores/chatStore";
import { AGENT_MAP } from "@/constants/agents";

export default function TypingIndicator() {
  const traceSteps = useChatStore((s) => s.traceSteps);
  const activeStep = traceSteps.find((s) => s.status === "active");

  return (
    <div className="flex gap-3 animate-fade-up">
      {/* Hexagon avatar */}
      <div className="flex-shrink-0 mt-1">
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            background: "linear-gradient(135deg, var(--aurora-blue), var(--aurora-lavender), var(--aurora-mint))",
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          }}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Shimmer card */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 240,
            height: 32,
            borderRadius: 12,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
              width: "50%",
            }}
          />
        </div>

        {/* Active agent step text */}
        <div
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            fontFamily: "var(--font-body)",
          }}
        >
          {traceSteps
            .filter((s) => s.status === "complete")
            .map((s) => AGENT_MAP[s.agent]?.label)
            .join(" → ")}
          {activeStep && (
            <>
              {traceSteps.some((s) => s.status === "complete") && " → "}
              <span style={{ color: AGENT_MAP[activeStep.agent]?.color }}>
                {AGENT_MAP[activeStep.agent]?.label}
              </span>
              <span className="animate-model-pulse"> ●</span>
              <span style={{ color: "var(--text-placeholder)" }}> active</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
