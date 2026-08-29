export type AgentRole =
  | "memory"
  | "gateway"
  | "search"
  | "synthesizer"
  | "validator"
  | "code"
  | "rag";

export type TraceStatus = "pending" | "active" | "complete" | "error";

export interface TraceStep {
  /* AgentRole for the marketing/mock roles, or a real Phase 3 tool name
     (e.g. "get_stock_price") — AgentTrace.tsx falls back gracefully for
     any identifier it doesn't recognize in AGENT_MAP/TOOL_DISPLAY. */
  agent: AgentRole | string;
  status: TraceStatus;
  startedAt?: number;
  completedAt?: number;
}

export interface TraceEvent {
  type: "trace";
  agent: AgentRole;
  status: TraceStatus;
  timestamp: number;
}
