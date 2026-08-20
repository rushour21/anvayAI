"use client";

import { useChatStore } from "@/stores/chatStore";
import { AGENT_MAP } from "@/constants/agents";
import type { AgentRole } from "@/types/agent";
import InputToolButton from "./InputToolButton";

/* The composer toggles the same agents the empty state does, so the two
   surfaces can never disagree about what will run. */
const TOOLS: AgentRole[] = ["search", "rag", "code", "memory"];

export default function InputToolbar() {
  const activeAgents = useChatStore((s) => s.activeAgents);
  const toggleAgent = useChatStore((s) => s.toggleAgent);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-0.5 flex-wrap">
        {TOOLS.map((role) => (
          <InputToolButton
            key={role}
            label={AGENT_MAP[role].label}
            icon={AGENT_MAP[role].icon}
            isActive={activeAgents.includes(role)}
            onClick={() => toggleAgent(role)}
          />
        ))}
      </div>
      <span
        className="hidden sm:block text-[11px] font-mono shrink-0"
        style={{ color: "var(--ink-300)" }}
      >
        ⌘↵
      </span>
    </div>
  );
}
