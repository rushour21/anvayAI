"use client";

import { useChatStore } from "@/stores/chatStore";
import { AgentRole } from "@/types/agent";
import { AGENT_MAP, TOOL_DISPLAY } from "@/constants/agents";
import AssistantAvatar from "./AssistantAvatar";
import AgentTrace from "./AgentTrace";

function isAgentRole(agent: string): agent is AgentRole {
  return agent in AGENT_MAP;
}

export default function TypingIndicator() {
  const traceSteps = useChatStore((s) => s.traceSteps);
  const activeStep = traceSteps.find((s) => s.status === "active");
  const active = activeStep
    ? isAgentRole(activeStep.agent)
      ? AGENT_MAP[activeStep.agent]
      : TOOL_DISPLAY[activeStep.agent]
    : null;

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
                    "linear-gradient(90deg, transparent, var(--shimmer), transparent)",
                  animationDelay: `${i * 0.14}s`,
                }}
              />
            </div>
          ))}
        </div>

        <p className="text-[12px]" style={{ color: "var(--ink-400)" }}>
          {active ? (
            <span style={{ color: active.color, fontWeight: 500 }}>
              {active.label}…
            </span>
          ) : (
            "Routing your question…"
          )}
        </p>
      </div>
    </div>
  );
}
