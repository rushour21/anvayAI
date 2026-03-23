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
const MOCK_SOURCES = [
  { id: "1", url: "https://arxiv.org/paper", domain: "arxiv.org", title: "Research Paper on LLMs", agentColor: "#4A7CF7" },
  { id: "2", url: "https://github.com/example", domain: "github.com", title: "Open Source Implementation", agentColor: "#10B981" },
  { id: "3", url: "https://docs.example.com", domain: "docs.example.com", title: "API Documentation", agentColor: "#8B5CF6" },
];

const MOCK_TRACE: TraceStep[] = [
  { agent: "gateway", status: "complete" },
  { agent: "memory", status: "complete" },
  { agent: "search", status: "complete" },
  { agent: "synthesizer", status: "complete" },
  { agent: "validator", status: "complete" },
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  traceSteps: [],
  activeAgents: [...EMPTY_STATE_AGENTS],
  selectedModel: DEFAULT_MODEL,
  chatHistory: [
    { id: "1", title: "How does RAG work with vector DBs?", messages: [], createdAt: Date.now() - 3600000, updatedAt: Date.now() - 3600000 },
    { id: "2", title: "Compare Next.js vs Remix", messages: [], createdAt: Date.now() - 7200000, updatedAt: Date.now() - 7200000 },
    { id: "3", title: "Explain attention mechanisms", messages: [], createdAt: Date.now() - 86400000, updatedAt: Date.now() - 86400000 },
    { id: "4", title: "Best practices for API design", messages: [], createdAt: Date.now() - 172800000, updatedAt: Date.now() - 172800000 },
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
        content: `That's a great question about "${content}".\n\nBased on my multi-agent research across ${traceAgents.length} modules, here's a comprehensive answer:\n\n**Key Findings:**\n\n1. The topic involves several interconnected concepts that work together in modern systems.\n2. Recent developments have significantly improved performance and reliability.\n3. Best practices suggest a layered approach for optimal results.\n\nThe agents collaborated to verify this information, ensuring accuracy and completeness. Each source was cross-referenced to maintain high confidence in the response.\n\nWould you like me to dive deeper into any specific aspect?`,
        timestamp: Date.now(),
        sources: MOCK_SOURCES,
        traceSteps: traceAgents.map((role) => ({ agent: role, status: "complete" })),
      };
      addMessage(aiMsg);
      setIsStreaming(false);
    }, traceAgents.length * 800 + 400);
  },
}));
