import { AgentRole } from "@/types/agent";
import type { IconName } from "@/components/ui/Icon";

export interface AgentInfo {
  role: AgentRole;
  label: string;
  icon: IconName;
  color: string;
  description: string;
  /** What this agent contributes, phrased for the marketing page. */
  blurb: string;
}

export const AGENT_MAP: Record<AgentRole, AgentInfo> = {
  gateway: {
    role: "gateway",
    label: "Gateway",
    icon: "route",
    color: "var(--agent-gateway)",
    description: "Routes queries to the right agents",
    blurb:
      "Reads the question, decides which specialists are needed, and skips the ones that aren't.",
  },
  memory: {
    role: "memory",
    label: "Memory",
    icon: "brain",
    color: "var(--agent-memory)",
    description: "Recalls past conversations and context",
    blurb:
      "Pulls in what you've already established so you never repeat yourself.",
  },
  search: {
    role: "search",
    label: "Web Search",
    icon: "globe",
    color: "var(--agent-search)",
    description: "Searches the web for real-time information",
    blurb:
      "Queries the live web, opens the promising results, and discards the filler.",
  },
  code: {
    role: "code",
    label: "Code Runner",
    icon: "code",
    color: "var(--agent-code)",
    description: "Executes and analyzes code snippets",
    blurb:
      "Runs snippets in a sandbox so numbers and outputs are computed, not guessed.",
  },
  rag: {
    role: "rag",
    label: "Documents",
    icon: "document",
    color: "var(--agent-rag)",
    description: "Retrieves from uploaded documents",
    blurb:
      "Retrieves the exact passages from your own files that bear on the question.",
  },
  synthesizer: {
    role: "synthesizer",
    label: "Synthesizer",
    icon: "layers",
    color: "var(--agent-synthesizer)",
    description: "Combines findings into coherent answers",
    blurb:
      "Merges every agent's findings into one answer, resolving conflicts explicitly.",
  },
  validator: {
    role: "validator",
    label: "Validator",
    icon: "shield",
    color: "var(--agent-validator)",
    description: "Fact-checks and validates responses",
    blurb:
      "Checks each claim against its source and flags anything it can't ground.",
  },
};

export const AGENT_COLORS: Record<AgentRole, string> = Object.fromEntries(
  Object.entries(AGENT_MAP).map(([k, v]) => [k, v.color])
) as Record<AgentRole, string>;

/** Agents the user can toggle from the composer. */
export const EMPTY_STATE_AGENTS: AgentRole[] = [
  "search",
  "memory",
  "code",
  "rag",
  "synthesizer",
  "validator",
];

/** Canonical execution order — gateway always first, validator always last. */
export const PIPELINE_ORDER: AgentRole[] = [
  "gateway",
  "memory",
  "search",
  "code",
  "rag",
  "synthesizer",
  "validator",
];
