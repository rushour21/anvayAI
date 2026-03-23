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
  agent: AgentRole;
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
