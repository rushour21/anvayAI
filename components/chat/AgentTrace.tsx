"use client";

import { TraceStep } from "@/types/agent";
import { AgentRole } from "@/types/agent";
import { AGENT_MAP, TOOL_DISPLAY } from "@/constants/agents";
import AgentTraceDot from "./AgentTraceDot";

function isAgentRole(agent: string): agent is AgentRole {
  return agent in AGENT_MAP;
}

export default function AgentTrace({ steps }: { steps: TraceStep[] }) {
  if (!steps.length) return null;

  return (
    <div
      className="flex items-center flex-wrap gap-y-1 px-1.5 py-1 rounded-full"
      style={{ background: "var(--paper-sunk)", border: "1px solid var(--line)" }}
    >
      {steps.map((step, i) => {
        const info = isAgentRole(step.agent) ? AGENT_MAP[step.agent] : TOOL_DISPLAY[step.agent];
        return (
          <div key={step.agent} className="flex items-center">
            <AgentTraceDot
              label={info?.label ?? step.agent}
              icon={info?.icon ?? "sparkle"}
              color={info?.color ?? "var(--ink-400)"}
              status={step.status}
              index={i}
            />
            {i < steps.length - 1 && (
              <span
                className="shrink-0"
                style={{
                  width: 10,
                  height: 1.5,
                  borderRadius: 1,
                  background:
                    step.status === "complete" ? "var(--ink-200)" : "var(--ink-100)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
