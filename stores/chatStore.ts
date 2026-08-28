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
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
}

/* Reference clock for "Today / Yesterday / Earlier" bucketing in the
   sidebar — approximates "now" without reading Date.now() during render. */
export const SESSION_START = Date.now();

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  traceSteps: [],
  activeAgents: [...EMPTY_STATE_AGENTS],
  selectedModel: DEFAULT_MODEL,
  chatHistory: [],
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

  loadChatHistory: async () => {
    const res = await fetch("/api/conversations");
    if (!res.ok) return;
    const data = (await res.json()) as Array<{
      id: string;
      title: string;
      createdAt: string;
      updatedAt: string;
    }>;
    set({
      chatHistory: data.map((c) => ({
        id: c.id,
        title: c.title,
        messages: [],
        createdAt: new Date(c.createdAt).getTime(),
        updatedAt: new Date(c.updatedAt).getTime(),
      })),
    });
  },

  loadConversation: async (id) => {
    set({ activeChatId: id, messages: [], traceSteps: [] });
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      messages: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }>;
    };
    set({
      messages: data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt).getTime(),
      })),
    });
  },

  deleteChat: async (id) => {
    const { activeChatId } = get();
    set((s) => ({
      chatHistory: s.chatHistory.filter((c) => c.id !== id),
      ...(activeChatId === id
        ? { activeChatId: null, messages: [], traceSteps: [] }
        : {}),
    }));
    await fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  },

  sendMessage: async (content) => {
    const { addMessage, setIsStreaming, updateLastAssistantMessage } = get();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    setIsStreaming(true);

    try {
      let chatId = get().activeChatId;

      if (!chatId) {
        const title = content.length > 60 ? `${content.slice(0, 60)}…` : content;
        const createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!createRes.ok) throw new Error("Failed to create conversation");
        const created = (await createRes.json()) as { id: string; title: string };
        chatId = created.id;

        const now = Date.now();
        set((s) => ({
          activeChatId: chatId,
          chatHistory: [
            { id: chatId!, title: created.title, messages: [], createdAt: now, updatedAt: now },
            ...s.chatHistory,
          ],
        }));
        /* Reflect the real id in the URL without a full navigation — mirrors
           the ?q= handoff's use of replaceState in app/(dashboard)/chat/[chatId]/page.tsx. */
        window.history.replaceState(null, "", `/chat/${chatId}`);
      }

      const res = await fetch(`/api/conversations/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "Something went wrong. Please try again."
        );
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let started = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        if (!full) continue;
        if (!started) {
          started = true;
          addMessage({ id: crypto.randomUUID(), role: "assistant", content: full, timestamp: Date.now() });
        } else {
          updateLastAssistantMessage(full);
        }
      }

      const finishedId = chatId;
      set((s) => ({
        chatHistory: s.chatHistory.map((c) =>
          c.id === finishedId ? { ...c, updatedAt: Date.now() } : c
        ),
      }));
    } catch {
      addMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Something went wrong. Please try again.",
        timestamp: Date.now(),
      });
    } finally {
      setIsStreaming(false);
    }
  },
}));
