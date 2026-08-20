"use client";

import { create } from "zustand";
import { Message, Chat } from "@/types/chat";
import { AgentRole, TraceStep } from "@/types/agent";
import { ModelMeta } from "@/types/llm";
import { DEFAULT_MODEL } from "@/constants/models";
import { EMPTY_STATE_AGENTS } from "@/constants/agents";

interface ChatState {
  /* Current conversation */
  messages: Message[];
  isStreaming: boolean;
  traceSteps: TraceStep[];

  /* Agent pill toggles (empty state) */
  activeAgents: AgentRole[];

  /* Model */
  selectedModel: ModelMeta;

  /* Chat history */
  chatHistory: Chat[];
  activeChatId: string | null;

  /* Actions */
  addMessage: (msg: Message) => void;
  updateLastAssistantMessage: (content: string) => void;
  setTraceSteps: (steps: TraceStep[]) => void;
  updateTraceStep: (agent: AgentRole, status: TraceStep["status"]) => void;
  setIsStreaming: (v: boolean) => void;
  toggleAgent: (agent: AgentRole) => void;
  setSelectedModel: (model: ModelMeta) => void;
  setActiveChatId: (id: string | null) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => void;
}

// Mock AI response data
/* One reference clock for the seeded history. Buckets are derived from
   differences against this, so server and client agree without reading the
   clock during render. Real timestamps will come from the API. */
export const SESSION_START = Date.now();

const MOCK_SOURCES = [
  { id: "1", url: "https://arxiv.org", domain: "arxiv.org", title: "Preprint on long-context retrieval", agentColor: "var(--agent-search)" },
  { id: "2", url: "https://github.com", domain: "github.com", title: "Reference implementation", agentColor: "var(--agent-code)" },
  { id: "3", url: "https://nature.com", domain: "nature.com", title: "Peer-reviewed benchmark review", agentColor: "var(--agent-validator)" },
];


export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  traceSteps: [],
  activeAgents: [...EMPTY_STATE_AGENTS],
  selectedModel: DEFAULT_MODEL,
  chatHistory: [
    { id: "1", title: "How does RAG work with vector DBs?", messages: [], createdAt: SESSION_START - 3600000, updatedAt: SESSION_START - 3600000 },
    { id: "2", title: "Compare Next.js vs Remix", messages: [], createdAt: SESSION_START - 7200000, updatedAt: SESSION_START - 7200000 },
    { id: "3", title: "Explain attention mechanisms", messages: [], createdAt: SESSION_START - 86400000, updatedAt: SESSION_START - 86400000 },
    { id: "4", title: "Best practices for API design", messages: [], createdAt: SESSION_START - 172800000, updatedAt: SESSION_START - 172800000 },
  ],
  activeChatId: null,

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  updateLastAssistantMessage: (content) =>
    set((s) => {
      const msgs = [...s.messages];
      const lastIdx = msgs.findLastIndex((m) => m.role === "assistant");
      if (lastIdx >= 0) msgs[lastIdx] = { ...msgs[lastIdx], content };
      return { messages: msgs };
    }),

  setTraceSteps: (steps) => set({ traceSteps: steps }),

  updateTraceStep: (agent, status) =>
    set((s) => ({
      traceSteps: s.traceSteps.map((t) =>
        t.agent === agent ? { ...t, status } : t
      ),
    })),

  setIsStreaming: (v) => set({ isStreaming: v }),
  toggleAgent: (agent) =>
    set((s) => ({
      activeAgents: s.activeAgents.includes(agent)
        ? s.activeAgents.filter((a) => a !== agent)
        : [...s.activeAgents, agent],
    })),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  clearMessages: () => set({ messages: [], traceSteps: [] }),

  sendMessage: (content) => {
    const { addMessage, setIsStreaming, setTraceSteps, activeAgents } = get();

    // Add user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setIsStreaming(true);

    // Build dynamic trace based on active agents
    // Standards: gateway first, then selected agents, then synthesizer, then validator
    const traceAgents: AgentRole[] = ["gateway"];
    if (activeAgents.includes("memory")) traceAgents.push("memory");
    if (activeAgents.includes("search")) traceAgents.push("search");
    if (activeAgents.includes("code")) traceAgents.push("code");
    if (activeAgents.includes("rag")) traceAgents.push("rag");
    traceAgents.push("synthesizer");
    if (activeAgents.includes("validator")) traceAgents.push("validator");

    const trace: TraceStep[] = traceAgents.map((role) => ({
      agent: role,
      status: "pending" as const,
    }));
    setTraceSteps(trace);

    // Simulate agent trace animation
    traceAgents.forEach((agent, i) => {
      setTimeout(() => {
        set((s) => ({
          traceSteps: s.traceSteps.map((t) =>
            t.agent === agent ? { ...t, status: "active" } : t
          ),
        }));
      }, i * 800);
      setTimeout(() => {
        set((s) => ({
          traceSteps: s.traceSteps.map((t) =>
            t.agent === agent ? { ...t, status: "complete" } : t
          ),
        }));
      }, i * 800 + 600);
    });

    // Add AI response after trace completes
    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: [
          `Here is what the agents found on "${content}".`,
          "",
          `${traceAgents.length} modules ran on this question. Their findings agree on three points:`,
          "",
          "1. The core mechanism is well established, and the recent work refines it rather than replacing it.",
          "2. Measured gains hold up across the benchmarks that were checked, though the margins narrow at scale.",
          "3. The practical recommendation depends on your latency budget more than on raw accuracy.",
          "",
          "The Validator cross-checked each claim against the sources below. Anything it could not ground was dropped rather than included.",
          "",
          "Want me to go deeper on any one of these?",
        ].join("\n"),
        timestamp: Date.now(),
        sources: MOCK_SOURCES,
        traceSteps: traceAgents.map((role) => ({ agent: role, status: "complete" })),
      };
      addMessage(aiMsg);
      setIsStreaming(false);
    }, traceAgents.length * 800 + 400);
  },
}));
