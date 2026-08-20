"use client";

import { useChatStore } from "@/stores/chatStore";
import { EMPTY_STATE_AGENTS, AGENT_MAP } from "@/constants/agents";
import AgentPill from "./AgentPill";

export default function AgentPills() {
  const activeAgents = useChatStore((s) => s.activeAgents);
  const toggleAgent = useChatStore((s) => s.toggleAgent);

  return (
    <div
      className="flex flex-wrap gap-2 justify-center"
      role="group"
      aria-label="Agents to run"
    >
      {EMPTY_STATE_AGENTS.map((role) => {
        const info = AGENT_MAP[role];
        return (
          <AgentPill
            key={role}
            icon={info.icon}
            label={info.label}
            color={info.color}
            isActive={activeAgents.includes(role)}
            onClick={() => toggleAgent(role)}
          />
        );
      })}
    </div>
  );
}
