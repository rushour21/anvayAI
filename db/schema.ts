import { pgTable, uuid, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

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