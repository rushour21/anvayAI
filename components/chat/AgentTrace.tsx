"use client";

import { TraceStep } from "@/types/agent";
import { AGENT_MAP } from "@/constants/agents";
import AgentTraceDot from "./AgentTraceDot";

interface AgentTraceProps {
  steps: TraceStep[];
}

export default function AgentTrace({ steps }: AgentTraceProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.agent} className="flex items-center">
          <AgentTraceDot
            label={AGENT_MAP[step.agent]?.label ?? step.agent}
            color={AGENT_MAP[step.agent]?.color ?? "#999"}
            status={step.status}
            index={i}
          />
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div
              className="mx-0.5"
              style={{
                width: 20,
                height: 1,
                background:
                  step.status === "complete"
                    ? "rgba(0,0,0,0.12)"
                    : "rgba(0,0,0,0.06)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
