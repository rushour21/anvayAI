import { pgTable, uuid, text, timestamp, pgEnum, integer, boolean, index } from "drizzle-orm/pg-core";

/* Matches lib/auth/types.ts's PlanTier — kept in sync by hand for now.
   Adding "team" / "enterprise" later (docs/PRD.md §9) is a value added
   here, not a new table. */
export const planTier = pgEnum("plan_tier", ["free", "pro"]);

/* Phase 2 model modes (AGENTS.md Phase 2 §9) — kept in sync by hand with
   lib/ai/models.ts's ModelMode union. */
export const modelMode = pgEnum("model_mode", ["auto", "openai", "gemma", "nemotron", "minimax"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  plan: planTier("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversation = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  modelMode: modelMode("model_mode").notNull().default("auto"),
  /* Phase 8 rolling summary — replaces the older half of a long
     conversation so each turn stops resending the entire history.
     `summarizedThrough` marks how far the summary covers; messages newer
     than it are still sent verbatim. A timestamp rather than a message FK
     so deleting a message can't silently orphan the marker. */
  summary: text("summary"),
  summarizedThrough: timestamp("summarized_through", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})

export const messages = pgTable("messages",{
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversation.id, { onDelete: "cascade" }).notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  /* Actual OpenRouter model id used, e.g. "google/gemma-4-26b-a4b-it:free" —
     set only on assistant rows (AGENTS.md Phase 2 §10). */
  modelUsed: text("model_used"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/* Phase 3 agent observability (AGENTS.md Phase 3 §14) — one row per
   callModel() run, so agent behavior can be debugged without grepping logs. */
export const agentRuns = pgTable("agent_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversation.id, { onDelete: "cascade" }).notNull(),
  model: text("model").notNull(),
  status: text("status").notNull(), // "running" | "complete" | "error"
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  error: text("error"),
});

export const toolCalls = pgTable("tool_calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentRunId: uuid("agent_run_id").references(() => agentRuns.id, { onDelete: "cascade" }).notNull(),
  toolName: text("tool_name").notNull(),
  input: text("input").notNull(), // JSON-stringified
  output: text("output"), // JSON-stringified
  status: text("status").notNull(), // "success" | "error"
  durationMs: integer("duration_ms").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documentStatus = pgEnum("document_status", ["uploaded", "processing", "ready", "error"]);

/* Phase 6 document intelligence (AGENTS.md Phase 6 §6.1-6.2) — original file
   in Supabase Storage (storageKey), chunk text+metadata here for citations,
   embeddings live in Qdrant (documentChunks.qdrantPointId links them). */
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => conversation.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  /* Null while "pending" (uploaded but no message sent yet — still shown in
     the composer). Set to the user message's id once that message is sent,
     so the frontend can render the document's chip in chat history at that
     point instead of persisting it in the composer forever. */
  messageId: uuid("message_id").references(() => messages.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  storageKey: text("storage_key").notNull(),
  pageCount: integer("page_count"),
  status: documentStatus("status").notNull().default("uploaded"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }).notNull(),
  page: integer("page").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  text: text("text").notNull(),
  qdrantPointId: text("qdrant_point_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Phase 7 cost accounting — OpenRouter returns real usage and cost on
   every run (lib/ai/agent.ts already receives it); this persists it so
   month-to-date spend is queryable and enforceable per user. Indexed on
   (userId, createdAt) because the only hot query is "this user's spend
   since the start of the month". */
export const usageLedger = pgTable(
  "usage_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    agentRunId: uuid("agent_run_id").references(() => agentRuns.id, { onDelete: "set null" }),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    /* Micro-dollars (USD * 1_000_000) as an integer — summing thousands of
       tiny per-run float costs drifts; integer micros don't. */
    costMicros: integer("cost_micros").notNull().default(0),
    isByok: boolean("is_byok").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("usage_ledger_user_created_idx").on(t.userId, t.createdAt)]
);

/* Phase 7 fixed-window rate limiting, Postgres-backed (no new service).
   One row per limiter key ("user:<id>:messages", "ip:<addr>:documents");
   the count resets when a request arrives in a newer window. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

/* Phase 8 user memory — durable facts/preferences that outlive a single
   conversation. Deliberately small and reviewable; the embedding for
   relevance-filtered retrieval lives in Qdrant, linked by qdrantPointId. */
export const userMemories = pgTable(
  "user_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    qdrantPointId: text("qdrant_point_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("user_memories_user_idx").on(t.userId)]
);