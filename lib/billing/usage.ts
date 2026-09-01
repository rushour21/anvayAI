import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { usageLedger, users } from "@/db/schema";

/* Phase 7 cost accounting. OpenRouter returns real usage and cost on every
   run; lib/ai/agent.ts records it here, and the messages route checks the
   ceiling before starting a run so a user at their limit gets a clear
   refusal instead of a provider 402 mid-stream. */

export type PlanTier = "free" | "pro";

/* Monthly ceilings in micro-dollars (USD * 1_000_000). Deliberately
   conservative for free — this exists to stop a runaway bill, not to
   monetize. */
export const MONTHLY_BUDGET_MICROS: Record<PlanTier, number> = {
  free: 2_000_000, // $2.00
  pro: 50_000_000, // $50.00
};

/* Warn once the user is this far into their ceiling. */
export const SOFT_WARN_RATIO = 0.8;

export function usdToMicros(usd: number): number {
  return Math.round(usd * 1_000_000);
}

export function microsToUsd(micros: number): number {
  return micros / 1_000_000;
}

function startOfUtcMonth(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/* BYOK runs are recorded but excluded from the total — the user is paying
   their own provider directly, so they don't consume our ceiling. */
export async function getMonthToDateSpendMicros(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<string>`coalesce(sum(${usageLedger.costMicros}), 0)::bigint` })
    .from(usageLedger)
    .where(
      and(
        eq(usageLedger.userId, userId),
        gte(usageLedger.createdAt, startOfUtcMonth()),
        eq(usageLedger.isByok, false)
      )
    );
  return Number(row?.total ?? 0);
}

export type BudgetStatus = {
  allowed: boolean;
  spentMicros: number;
  limitMicros: number;
  /** True once past SOFT_WARN_RATIO but still under the ceiling. */
  warn: boolean;
};

export async function checkBudget(userId: string): Promise<BudgetStatus> {
  const [user, spentMicros] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId) }),
    getMonthToDateSpendMicros(userId),
  ]);
  const plan: PlanTier = user?.plan === "pro" ? "pro" : "free";
  const limitMicros = MONTHLY_BUDGET_MICROS[plan];
  return {
    allowed: spentMicros < limitMicros,
    spentMicros,
    limitMicros,
    warn: spentMicros >= limitMicros * SOFT_WARN_RATIO && spentMicros < limitMicros,
  };
}

/* Shape of what @openrouter/sdk returns on ModelResult.getResponse().usage
   — only the fields we persist, all optional since a failed or cancelled
   run may not report any of them. */
export type RunUsage = {
  inputTokens?: number | null;
  outputTokens?: number | null;
  cost?: number | null;
  isByok?: boolean | null;
};

export async function recordUsage(params: {
  userId: string;
  agentRunId: string;
  model: string;
  usage: RunUsage | null | undefined;
}): Promise<void> {
  const { userId, agentRunId, model, usage } = params;
  if (!usage) return;
  await db
    .insert(usageLedger)
    .values({
      userId,
      agentRunId,
      model,
      inputTokens: Math.max(0, Math.round(usage.inputTokens ?? 0)),
      outputTokens: Math.max(0, Math.round(usage.outputTokens ?? 0)),
      costMicros: Math.max(0, usdToMicros(usage.cost ?? 0)),
      isByok: Boolean(usage.isByok),
    })
    .catch((err) => console.error("[billing] failed to record usage:", err));
}
