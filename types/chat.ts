import { TraceStep } from "./agent";

export type MessageRole = "user" | "assistant";

export interface Source {
  id: string;
  url: string;
  domain: string;
  title: string;
  favicon?: string;
  agentColor: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  sources?: Source[];
  traceSteps?: TraceStep[];
  isStreaming?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}
