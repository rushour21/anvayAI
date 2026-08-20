"use client";

import { useChatStore } from "@/stores/chatStore";
import { AGENT_MAP } from "@/constants/agents";
import AssistantAvatar from "./AssistantAvatar";
import AgentTrace from "./AgentTrace";

export default function TypingIndicator() {
  const traceSteps = useChatStore((s) => s.traceSteps);
  const activeStep = traceSteps.find((s) => s.status === "active");
  const active = activeStep ? AGENT_MAP[activeStep.agent] : null;

  return (
    <div className="flex gap-3 animate-fade-up">
      <AssistantAvatar />

      <div className="flex-1 min-w-0 flex flex-col gap-3">
        {traceSteps.length > 0 && (
          <div className="self-start max-w-full overflow-x-auto">
            <AgentTrace steps={traceSteps} />
          </div>
        )}

        {/* Shimmer standing in for the not-yet-streamed answer */}
        <div className="flex flex-col gap-2">
          {[100, 88, 62].map((w, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-md"
              style={{ width: `${w}%`, height: 11, background: "var(--paper-sunk)" }}
            >
              <div
                className="absolute inset-y-0 animate-shimmer"
                style={{
                  width: "45%",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.95), transparent)",
                  animationDelay: `${i * 0.14}s`,
                }}
              />
            </div>
          ))}
        </div>

        <p className="text-[12px]" style={{ color: "var(--ink-400)" }}>
          {active ? (
            <>
              <span style={{ color: active.color, fontWeight: 500 }}>
                {active.label}
              </span>{" "}
              {active.description.toLowerCase()}…
            </>
          ) : (
            "Routing your question…"
          )}
        </p>
      </div>
    </div>
  );
}
