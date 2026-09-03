import { pgTable, uuid, text, timestamp, pgEnum, integer, boolean, index, jsonb, primaryKey } from "drizzle-orm/pg-core";

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

/* A project is how an analyst organizes work: a coverage list, a deal, a
   situation. Deliberately NOT one company — analysts cover 15-60 names, so a
   single comp sheet spans several tickers and one ticker shows up in several
   projects. `tickers` is therefore a plain array, not a foreign key.

   A project is an organizing unit inside ONE user's account, never a tenancy
   boundary — docs/CONTEXT-AND-MEMORY.md rules out workspaces/teams for v1, and
   nothing here changes that. Everything stays owned by user_id. */
export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    name: text("name").notNull(),
    tickers: text("tickers").array().notNull().default([]),
    /* The analyst's current view — rating, price target, the live debate. The
       one thing they carry that isn't a file, and what makes "what changed
       since last time" answerable. */
    thesis: text("thesis"),
    openQuestions: text("open_questions").array().notNull().default([]),
    /* Powers the overview's "changed since you last looked" section. Null
       until the project is opened for the first time. */
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("projects_user_idx").on(t.userId, t.updatedAt)]
);

export const conversation = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  /* Nullable on purpose: projects are optional and lazy. A conversation with
     no project still works exactly as before — requiring one up front would
     put a "create a project first" wall in front of the first question. */
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
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
},
  // Filtered on every project overview and project-scoped sidebar fetch.
  (t) => [index("conversations_project_idx").on(t.projectId)]
)

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
  /* Stamped from the conversation's project at upload time. This is what lets
     a 10-K uploaded in one conversation be searchable from every other
     conversation in the same project — previously it was invisible outside the
     conversation it was uploaded to. */
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
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
},
  /* resolveDocumentScope() filters by project_id on every project-scoped
     document search — without this it's a sequential scan per query. */
  (t) => [index("documents_project_idx").on(t.projectId)]
);

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


export const artifactKind = pgEnum("artifact_kind", ["sheet", "note"]);

/* An artifact is the durable output of research — a comp sheet, an earnings
   note. Unlike a chat message it survives the conversation, carries a source
   for every number, and keeps the `spec` (the recipe: which tickers, metrics
   and periods produced it) so it can be rebuilt next quarter instead of
   retyped. That last property is the one no general assistant has. */
export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    /* Cascades: an artifact belongs to its project. Conversations and
       documents only SET NULL, because those outlive a project being tidied
       away — an artifact does not. */
    projectId: uuid("project_id").references(() => projects.id, { onDelete: "cascade" }),
    conversationId: uuid("conversation_id").references(() => conversation.id, { onDelete: "set null" }),
    kind: artifactKind("kind").notNull(),
    title: text("title").notNull(),
    spec: jsonb("spec"),
    currentVersion: integer("current_version").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("artifacts_project_idx").on(t.projectId, t.updatedAt)]
);

/* Immutable snapshots. Cell-level provenance lives inside `content` rather
   than a separate table, so it versions along with the values it describes
   for free — see types/artifact.ts for the shape. */
export const artifactVersions = pgTable(
  "artifact_versions",
  {
    artifactId: uuid("artifact_id").references(() => artifacts.id, { onDelete: "cascade" }).notNull(),
    version: integer("version").notNull(),
    content: jsonb("content").notNull(),
    author: text("author").notNull(), // "agent" | "user"
    summary: text("summary"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.artifactId, t.version] }),
    index("artifact_versions_artifact_idx").on(t.artifactId, t.version),
  ]
);
