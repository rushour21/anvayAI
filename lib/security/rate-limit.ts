import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rateLimits } from "@/db/schema";

/* Phase 7 fixed-window rate limiting, backed by Postgres so it needs no
   new service. The increment-or-reset is a single atomic upsert, so
   concurrent requests can't both read a stale count and let each other
   through.

   Tradeoff, stated plainly: a fixed window allows up to 2x the limit
   across a window boundary (all of window N late, all of window N+1
   early), and every check costs a DB round trip. Both are acceptable at
   this app's scale — the job here is stopping retry storms and runaway
   spend, not precise throttling. Swapping in Upstash Redis later means
   replacing this one module; nothing else touches the table. */

export type RateLimitRule = { limit: number; windowSeconds: number };

/* Sending a message runs the agent (model + tool calls), so it's the
   expensive one. Uploading a document costs real money per file in
   parsing and embeddings, so it's stricter still. */
export const RULES = {
  messages: { limit: 20, windowSeconds: 60 },
  documents: { limit: 10, windowSeconds: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the current window rolls over. */
  retryAfterSeconds: number;
};

function windowStartFor(windowSeconds: number): Date {
  const ms = windowSeconds * 1000;
  return new Date(Math.floor(Date.now() / ms) * ms);
}

/**
 * Counts one hit against `key` and reports whether it's allowed.
 * Fails open: if the limiter itself errors, the request proceeds rather
 * than taking the whole app down over a rate-limit table.
 */
export async function rateLimit(key: string, rule: RateLimitRule): Promise<RateLimitResult> {
  const windowStart = windowStartFor(rule.windowSeconds);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((windowStart.getTime() + rule.windowSeconds * 1000 - Date.now()) / 1000)
  );

  try {
    const [row] = await db
      .insert(rateLimits)
      .values({ key, windowStart, count: 1 })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          // Same window → increment. Newer window → start over at 1.
          count: sql`case when ${rateLimits.windowStart} = ${windowStart} then ${rateLimits.count} + 1 else 1 end`,
          windowStart,
        },
      })
      .returning({ count: rateLimits.count });

    const count = row?.count ?? 1;
    return {
      allowed: count <= rule.limit,
      remaining: Math.max(0, rule.limit - count),
      retryAfterSeconds,
    };
  } catch (err) {
    console.error("[rate-limit] check failed, allowing request:", err);
    return { allowed: true, remaining: rule.limit, retryAfterSeconds };
  }
}

/* Behind Vercel/most proxies the client address is the first entry in
   x-forwarded-for; Request has no direct remote-address accessor. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
