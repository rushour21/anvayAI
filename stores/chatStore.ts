"use client";

import { create } from "zustand";
import { Message, Chat } from "@/types/chat";
import { AgentRole, TraceStep } from "@/types/agent";
import { ModelMeta } from "@/types/llm";
import { DocumentAttachment, DocumentStatus } from "@/types/document";
import { DEFAULT_MODEL, MODELS } from "@/constants/models";
import { EMPTY_STATE_AGENTS } from "@/constants/agents";

interface ChatState {
  /* Current conversation */
  messages: Message[];
  isStreaming: boolean;
  traceSteps: TraceStep[];

  /* Documents attached to the current conversation */
  documents: DocumentAttachment[];

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
  updateTraceStep: (agent: AgentRole | string, status: TraceStep["status"]) => void;
  startTraceStep: (agent: string) => void;
  setIsStreaming: (v: boolean) => void;
  toggleAgent: (agent: AgentRole) => void;
  setSelectedModel: (model: ModelMeta) => void;
  setActiveChatId: (id: string | null) => void;
  clearMessages: () => void;
  sendMessage: (content: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  loadConversation: (id: string) => Promise<void>;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

/* Reference clock for "Today / Yesterday / Earlier" bucketing in the
   sidebar — approximates "now" without reading Date.now() during render. */
export const SESSION_START = Date.now();

export const useChatStore = create<ChatState>((set, get) => {
  /* Polls a just-uploaded document until it reaches "ready" or "error"
     (processing can take up to ~90s per the API contract), updating the
     matching entry in `documents` on each response. Capped at 40 attempts
     (~100s at a 2.5s interval) so a stuck document doesn't poll forever. */
  const pollDocument = (id: string, attempt = 0) => {
    const MAX_ATTEMPTS = 40;
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/documents/${id}`);
        if (!res.ok) {
          if (attempt < MAX_ATTEMPTS) pollDocument(id, attempt + 1);
          return;
        }
        const data = (await res.json()) as {
          id: string;
          filename: string;
          status: DocumentStatus;
          pageCount?: number | null;
          error?: string | null;
          createdAt: string;
        };
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === id
              ? {
                  ...d,
                  status: data.status,
                  pageCount: data.pageCount ?? undefined,
                  error: data.error ?? undefined,
                }
              : d
          ),
        }));
        if (data.status === "uploaded" || data.status === "processing") {
          if (attempt < MAX_ATTEMPTS) {
            pollDocument(id, attempt + 1);
          } else {
            set((s) => ({
              documents: s.documents.map((d) =>
                d.id === id
                  ? { ...d, status: "error", error: "Processing is taking longer than expected." }
                  : d
              ),
            }));
          }
        }
      } catch {
        if (attempt < MAX_ATTEMPTS) pollDocument(id, attempt + 1);
      }
    }, 2500);
  };

  return {
  messages: [],
  isStreaming: false,
  traceSteps: [],
  documents: [],
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

  /* Phase 3 tool_start events (AGENTS.md Phase 3 §11) — reuses the same
     trace-step UI that was originally built for the Phase 1 mock. */
  startTraceStep: (agent) =>
    set((s) => {
      const exists = s.traceSteps.some((t) => t.agent === agent);
      if (exists) {
        return {
          traceSteps: s.traceSteps.map((t) =>
            t.agent === agent ? { ...t, status: "active" as const } : t
          ),
        };
      }
      return { traceSteps: [...s.traceSteps, { agent, status: "active" as const }] };
    }),

  setIsStreaming: (v) => set({ isStreaming: v }),
  toggleAgent: (agent) =>
    set((s) => ({
      activeAgents: s.activeAgents.includes(agent)
        ? s.activeAgents.filter((a) => a !== agent)
        : [...s.activeAgents, agent],
    })),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setActiveChatId: (id) => set({ activeChatId: id }),
  clearMessages: () => set({ messages: [], traceSteps: [], documents: [] }),

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
    set({ activeChatId: id, messages: [], traceSteps: [], documents: [] });
    const res = await fetch(`/api/conversations/${id}`);
    if (!res.ok) return;
    const data = (await res.json()) as {
      modelMode: string;
      messages: Array<{ id: string; role: "user" | "assistant"; content: string; createdAt: string }>;
      documents?: Array<{
        id: string;
        filename: string;
        status: DocumentStatus;
        pageCount?: number | null;
        error?: string | null;
        messageId?: string | null;
        createdAt: string;
      }>;
    };
    const restoredModel = MODELS.find((m) => m.id === data.modelMode);
    set({
      messages: data.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.createdAt).getTime(),
      })),
      documents: (data.documents ?? []).map((d) => ({
        id: d.id,
        filename: d.filename,
        status: d.status,
        pageCount: d.pageCount ?? undefined,
        error: d.error ?? undefined,
        messageId: d.messageId ?? undefined,
        createdAt: new Date(d.createdAt).getTime(),
      })),
      ...(restoredModel ? { selectedModel: restoredModel } : {}),
    });
  },

  deleteChat: async (id) => {
    const { activeChatId } = get();
    set((s) => ({
      chatHistory: s.chatHistory.filter((c) => c.id !== id),
      ...(activeChatId === id
        ? { activeChatId: null, messages: [], traceSteps: [], documents: [] }
        : {}),
    }));
    await fetch(`/api/conversations/${id}`, { method: "DELETE" }).catch(() => {});
  },

  sendMessage: async (content) => {
    const { addMessage, setIsStreaming, updateLastAssistantMessage, selectedModel, startTraceStep, updateTraceStep } = get();

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMsg);
    // Tie any pending (composer-shown) documents to this message right away
    // — matches what the server does with the same id, so the chip moves
    // into chat history immediately instead of waiting for a round trip.
    set((s) => ({
      documents: s.documents.map((d) => (d.messageId ? d : { ...d, messageId: userMsg.id })),
    }));
    setIsStreaming(true);

    try {
      let chatId = get().activeChatId;

      if (!chatId) {
        const title = content.length > 60 ? `${content.slice(0, 60)}…` : content;
        const createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, modelMode: selectedModel.id }),
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
        // userMsg.id is reused as the persisted row's id server-side, so any
        // pending document uploads get tied to the exact same id we already
        // rendered locally — no extra round trip needed to reconcile them.
        body: JSON.stringify({ content, mode: selectedModel.id, id: userMsg.id }),
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
      let buffer = "";

      const handleEvent = (event: { type: "text"; text: string } | { type: "tool_start"; tool: string } | { type: "tool_complete"; tool: string }) => {
        if (event.type === "text") {
          full += event.text;
          if (!full) return;
          if (!started) {
            started = true;
            addMessage({ id: crypto.randomUUID(), role: "assistant", content: full, timestamp: Date.now() });
          } else {
            updateLastAssistantMessage(full);
          }
        } else if (event.type === "tool_start") {
          startTraceStep(event.tool);
        } else if (event.type === "tool_complete") {
          updateTraceStep(event.tool, "complete");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            handleEvent(JSON.parse(line));
          } catch {
            // Ignore malformed lines rather than crashing the stream.
          }
        }
      }
      if (buffer.trim()) {
        try {
          handleEvent(JSON.parse(buffer));
        } catch {
          // Ignore a malformed trailing line.
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

  uploadDocument: async (file) => {
    const tempId = crypto.randomUUID();
    set((s) => ({
      documents: [
        ...s.documents,
        { id: tempId, filename: file.name, status: "uploading" as const, createdAt: Date.now() },
      ],
    }));

    try {
      let chatId = get().activeChatId;

      if (!chatId) {
        const title = file.name.length > 60 ? `${file.name.slice(0, 60)}…` : file.name;
        const createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, modelMode: get().selectedModel.id }),
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
        window.history.replaceState(null, "", `/chat/${chatId}`);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversationId", chatId);

      const res = await fetch("/api/documents", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);

      if (!res.ok) {
        const message =
          typeof data.error === "string" ? data.error : "Upload failed. Please try again.";
        set((s) => ({
          documents: s.documents.map((d) =>
            d.id === tempId ? { ...d, status: "error" as const, error: message } : d
          ),
        }));
        return;
      }

      const uploaded = data as { id: string; filename: string; status: DocumentStatus; createdAt: string };
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === tempId
            ? {
                id: uploaded.id,
                filename: uploaded.filename,
                status: uploaded.status,
                createdAt: new Date(uploaded.createdAt).getTime(),
              }
            : d
        ),
      }));

      pollDocument(uploaded.id);
    } catch {
      set((s) => ({
        documents: s.documents.map((d) =>
          d.id === tempId
            ? { ...d, status: "error" as const, error: "Upload failed. Please try again." }
            : d
        ),
      }));
    }
  },

  deleteDocument: async (id) => {
    set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    await fetch(`/api/documents/${id}`, { method: "DELETE" }).catch(() => {});
  },
  };
});
