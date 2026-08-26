import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

/* Matches lib/auth/types.ts's PlanTier — kept in sync by hand for now.
   Adding "team" / "enterprise" later (docs/PRD.md §9) is a value added
   here, not a new table. */
export const planTier = pgEnum("plan_tier", ["free", "pro"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  plan: planTier("plan").notNull().default("free"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
