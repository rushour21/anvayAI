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
    label: "Web & filings",
    icon: "globe",
    color: "var(--agent-search)",
    description: "Searches the web and public filings for real-time information",
    blurb:
      "Queries the live web and SEC filings, opens the promising results, and discards the filler.",
  },
  code: {
    role: "code",
    label: "Calculations",
    icon: "code",
    color: "var(--agent-code)",
    description: "Runs the numbers behind an answer",
    blurb:
      "Runs the math in a sandbox so figures and ratios are computed, not guessed.",
  },
  rag: {
    role: "rag",
    label: "Your documents",
    icon: "document",
    color: "var(--agent-rag)",
    description: "Retrieves from uploaded documents",
    blurb:
      "Retrieves the exact passages from your own files that bear on the question.",
  },
  synthesizer: {
    role: "synthesizer",
    label: "Analyzing",
    icon: "layers",
    color: "var(--agent-synthesizer)",
    description: "Combines findings into a coherent answer",
    blurb:
      "Merges every finding into one answer, resolving conflicts explicitly.",
  },
  validator: {
    role: "validator",
    label: "Checking sources",
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

/** What the user can toggle from the composer. Everything else (memory,
    calculations, source-checking) always runs in the background — a
    non-technical user shouldn't have to understand or choose between
    seven internal pipeline steps. */
export const EMPTY_STATE_AGENTS: AgentRole[] = ["search", "rag"];

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
