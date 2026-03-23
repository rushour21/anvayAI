import { AgentRole } from "@/types/agent";

export interface AgentInfo {
  role: AgentRole;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const AGENT_MAP: Record<AgentRole, AgentInfo> = {
  memory: {
    role: "memory",
    label: "Memory",
    emoji: "🧠",
    color: "#8B5CF6",
    description: "Recalls past conversations and context",
  },
  gateway: {
    role: "gateway",
    label: "Gateway",
    emoji: "🚪",
    color: "#F59E0B",
    description: "Routes queries to the right agents",
  },
  search: {
    role: "search",
    label: "Web Search",
    emoji: "🔍",
    color: "#4A7CF7",
    description: "Searches the web for real-time information",
  },
  synthesizer: {
    role: "synthesizer",
    label: "Synthesizer",
    emoji: "✨",
    color: "#10B981",
    description: "Combines findings into coherent answers",
  },
  validator: {
    role: "validator",
    label: "Validator",
    emoji: "🛡️",
    color: "#F43F5E",
    description: "Fact-checks and validates responses",
  },
  code: {
    role: "code",
    label: "Code Runner",
    emoji: "💻",
    color: "#4A7CF7",
    description: "Executes and analyzes code snippets",
  },
  rag: {
    role: "rag",
    label: "Documents",
    emoji: "📄",
    color: "#8B5CF6",
    description: "Retrieves from uploaded documents",
  },
};

export const AGENT_COLORS: Record<AgentRole, string> = Object.fromEntries(
  Object.entries(AGENT_MAP).map(([k, v]) => [k, v.color])
) as Record<AgentRole, string>;

export const EMPTY_STATE_AGENTS: AgentRole[] = [
  "search",
  "memory",
  "code",
  "rag",
  "synthesizer",
  "validator",
];
