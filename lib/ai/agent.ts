import { eq } from "drizzle-orm";
import { db } from "@/db";
import { agentRuns, toolCalls as toolCallsTable } from "@/db/schema";
import { getClient, SYSTEM_PROMPT, type ChatMessage } from "./openrouter";
import { FALLBACK_MODEL } from "./models";
import { financialAgentTools } from "./tools";
import { stepCountIs } from "@openrouter/sdk/lib/stop-conditions.js";
import { isToolResultEvent } from "@openrouter/sdk/lib/tool-types.js";
import type { StopCondition } from "@openrouter/sdk/lib/tool-types.js";

/* The financial-analyst agent (AGENTS.md Phase 3). Nothing here picks a
   model — `model` always comes from lib/ai/model-router.ts's selectModel(),
   called by the route before this function. */

const AGENT_SYSTEM_PROMPT =
  SYSTEM_PROMPT +
  " You are a financial analyst assistant with tools to look up stock prices, company " +
  "profiles, financial statements, run web searches, and perform exact financial " +
  "calculations. Use a tool whenever the user asks about a current price, a specific " +
  "company's figures, or a calculation — never invent numbers or dates. Always use " +
  "calculate_metric for arithmetic (percentages, growth, margins, CAGR, ROE, ROIC) instead " +
  "of computing it yourself; state the result it returns, don't recompute it. When " +
  "describing multiple year-over-year figures in a row, call calculate_metric once for " +
  "every adjacent year pair you intend to describe (don't skip a year in the middle), and " +
  "double-check each stated growth rate against the exact startValue/endValue you passed in " +
  "for that specific pair before writing it — never attach one pair's result to a different " +
  "year in your sentence. Every tool " +
  "you have is backed by real data (Financial Modeling Prep for prices/profiles/financials/" +
  "statements/ratios, SEC EDGAR for filings, OpenRouter web search for search_web/" +
  "search_news) — never call any of it \"mock\", \"illustrative\", or \"placeholder\". If a " +
  "tool fails or has no data for what was asked, say that clearly instead of guessing — " +
  "never fill the gap with an invented number, filing, or source. You do not need a tool to " +
  "answer general definitional questions (e.g. \"what is a P/E ratio\"). Only call the " +
  "tools actually needed for the question — don't call every financial tool for every " +
  "message. When a tool result includes a source (a filing, a search result, a named data " +
  "provider), cite it by name in your answer; if a fact has no source attached, don't " +
  "invent one. Clearly separate what the data says, what a calculation computed, and what " +
  "is your own analysis — don't present your interpretation as a verified fact.";

export type AgentEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; tool: string }
  | { type: "tool_complete"; tool: string };

const MAX_STEPS = 8;
/* Only meaningful when a fallback candidate actually exists — it exists to
   abort a hung/rate-limited free model quickly and try the fallback. When
   the primary model already IS the fallback (Auto escalates straight to
   openai, or the user picked openai/gemma/etc. directly with no fallback
   distinct from it), there is nothing to fall back to, so aborting early
   only turns a slow-but-working multi-tool run into a hard failure — a
   real bug hit in production on a two-company comparison query that needed
   several tool calls before its first token. Use a much longer safety net
   in that case instead. */
const FIRST_EVENT_TIMEOUT_MS = 15000;
const NO_FALLBACK_TIMEOUT_MS = 50000;

/* Production-only (never seen locally) transient failure from inside
   @openrouter/sdk's own response-parsing on a follow-up turn after a tool
   call — most likely a stale/corrupted keep-alive connection reused in
   Vercel's serverless environment, not a real conversation problem. Retried
   once, same model, only if no assistant text has reached the user yet. */
const TRANSIENT_SDK_ERROR_MESSAGE = "Unexpected response type from API";
const MAX_TRANSIENT_RETRIES = 1;

/* ---- Minimal async push-queue used to merge the three concurrent
   ModelResult stream consumers (text / tool-start / tool-complete) into one
   ordered event stream for the route to await/yield from. ---- */
class EventQueue<T> {
  private items: T[] = [];
  private waiting: ((r: IteratorResult<T>) => void) | null = null;
  private ended = false;
  private error: unknown = null;

  push(item: T) {
    if (this.ended) return;
    if (this.waiting) {
      const w = this.waiting;
      this.waiting = null;
      w({ value: item, done: false });
    } else {
      this.items.push(item);
    }
  }

  end(err?: unknown) {
    if (this.ended) return;
    if (err) this.error = err;
    this.ended = true;
    if (this.waiting) {
      const w = this.waiting;
      this.waiting = null;
      w({ value: undefined as unknown as T, done: true });
    }
  }

  next(): Promise<IteratorResult<T>> {
    if (this.items.length > 0) {
      return Promise.resolve({ value: this.items.shift() as T, done: false });
    }
    if (this.ended) {
      if (this.error) return Promise.reject(this.error);
      return Promise.resolve({ value: undefined as unknown as T, done: true });
    }
    return new Promise((resolve) => {
      this.waiting = resolve;
    });
  }
}

/* Stops the run if the last 3 tool calls (name + arguments) are identical —
   the officially-supported way to add a custom stop rule with this SDK
   (no separate doom-loop package installed; see the approved plan for why). */
function createDoomLoopStopCondition(onTrip: () => void): StopCondition {
  return ({ steps }) => {
    const calls = steps.flatMap((s) => s.toolCalls.map((tc) => `${tc.name}:${JSON.stringify(tc.arguments)}`));
    if (calls.length < 3) return false;
    const last = calls.slice(-3);
    const looping = last.every((c) => c === last[0]);
    if (looping) onTrip();
    return looping;
  };
}

/* Wraps each tool's execute() with timing + a tool_calls row, without
   touching the tool definitions in lib/ai/tools/*.ts. A thrown error is
   turned into a structured { ok: false, error } result instead of
   propagating, so the model can see and recover from it. */
function instrumentTools(agentRunId: string) {
  return financialAgentTools.map((t) => {
    const original = t.function.execute as (input: unknown) => Promise<unknown> | unknown;
    return {
      ...t,
      function: {
        ...t.function,
        execute: async (input: unknown) => {
          const start = Date.now();
          let output: unknown;
          let status: "success" | "error" = "success";
          try {
            output = await original(input);
            if (output && typeof output === "object" && (output as { ok?: boolean }).ok === false) {
              status = "error";
            }
          } catch (err) {
            status = "error";
            output = { ok: false, error: err instanceof Error ? err.message : "Tool execution failed" };
          }
          const durationMs = Date.now() - start;
          console.log(
            `[agent] tool=${t.function.name} duration=${durationMs}ms status=${status}`
          );
          await db
            .insert(toolCallsTable)
            .values({
              agentRunId,
              toolName: t.function.name,
              input: JSON.stringify(input),
              output: JSON.stringify(output),
              status,
              durationMs,
            })
            .catch((err) => console.error("[agent] failed to log tool_calls row:", err));
          return output;
        },
      },
    };
  });
}

/**
 * Runs the financial analyst agent for one message turn and yields safe,
 * user-facing events (assistant text and tool start/complete — never
 * chain-of-thought). Returns the model that actually answered.
 */
export async function* runFinancialAgent({
  conversationId,
  userId,
  messages,
  model,
}: {
  conversationId: string;
  userId: string;
  messages: ChatMessage[];
  model: string;
}): AsyncGenerator<AgentEvent, { modelUsed: string }, undefined> {
  const [run] = await db.insert(agentRuns).values({ conversationId, model, status: "running" }).returning();

  const candidates = model === FALLBACK_MODEL ? [model] : [model, FALLBACK_MODEL];
  let lastError: unknown = null;

  candidateLoop:
  for (let i = 0; i < candidates.length; i++) {
    const candidateModel = candidates[i];
    const isLastCandidate = i === candidates.length - 1;

    let sawText = false;
    let transientRetriesLeft = MAX_TRANSIENT_RETRIES;

    retryCandidate:
    while (true) {
    const doomLoopFlag = { tripped: false };

    const tools = instrumentTools(run.id);
    const result = getClient().callModel({
      model: candidateModel,
      input: messages.map((m) => ({ role: m.role, content: m.content })),
      instructions: AGENT_SYSTEM_PROMPT,
      tools: tools as unknown as typeof financialAgentTools,
      stopWhen: [stepCountIs(MAX_STEPS), createDoomLoopStopCondition(() => (doomLoopFlag.tripped = true))],
    });

    const queue = new EventQueue<AgentEvent>();
    const toolNameByCallId = new Map<string, string>();

    const textLoop = (async () => {
      for await (const delta of result.getTextStream()) {
        sawText = true;
        queue.push({ type: "text", text: delta });
      }
    })();

    const toolStartLoop = (async () => {
      for await (const call of result.getToolCallsStream()) {
        toolNameByCallId.set(call.id, call.name);
        queue.push({ type: "tool_start", tool: call.name });
      }
    })();

    const toolCompleteLoop = (async () => {
      for await (const event of result.getFullResponsesStream()) {
        if (isToolResultEvent(event)) {
          queue.push({ type: "tool_complete", tool: toolNameByCallId.get(event.toolCallId) ?? "tool" });
        }
      }
    })();

    Promise.all([textLoop, toolStartLoop, toolCompleteLoop]).then(
      () => queue.end(),
      (err) => queue.end(err)
    );

    const timeoutMs = candidates.length > 1 ? FIRST_EVENT_TIMEOUT_MS : NO_FALLBACK_TIMEOUT_MS;
    let firstResult: IteratorResult<AgentEvent>;
    try {
      firstResult = await Promise.race([
        queue.next(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Agent run produced no output in time")), timeoutMs)
        ),
      ]);
    } catch (err) {
      await result.cancel().catch(() => {});
      lastError = err;
      console.error(`[agent] candidate failed conversationId=${conversationId} model=${candidateModel}:`, err);
      const isTransient = err instanceof Error && err.message === TRANSIENT_SDK_ERROR_MESSAGE;
      if (isTransient && transientRetriesLeft > 0) {
        transientRetriesLeft -= 1;
        console.warn(
          `[agent] retrying candidate after transient SDK error conversationId=${conversationId} model=${candidateModel}`
        );
        continue retryCandidate;
      }
      if (isLastCandidate) break candidateLoop;
      continue candidateLoop;
    }

    // Something is flowing — no more fallback from here (can't splice two
    // partial answers together), except a same-model retry for the known
    // transient SDK error below.
    try {
      if (!firstResult.done) yield firstResult.value;
      while (true) {
        const next = await queue.next();
        if (next.done) break;
        yield next.value;
      }
    } catch (err) {
      lastError = err;
      console.error(`[agent] stream failed mid-run conversationId=${conversationId} model=${candidateModel}:`, err);
      const isTransient = err instanceof Error && err.message === TRANSIENT_SDK_ERROR_MESSAGE;
      if (isTransient && !sawText && transientRetriesLeft > 0) {
        transientRetriesLeft -= 1;
        console.warn(
          `[agent] retrying candidate after transient SDK error conversationId=${conversationId} model=${candidateModel}`
        );
        continue retryCandidate;
      }
      break candidateLoop;
    }

    const finalResponse = await result.getResponse().catch(() => null);
    await db
      .update(agentRuns)
      .set({ status: "complete", completedAt: new Date(), model: candidateModel })
      .where(eq(agentRuns.id, run.id));

    if (doomLoopFlag.tripped) {
      console.warn(
        `[agent] doom-loop stop conversationId=${conversationId} userId=${userId} model=${candidateModel}`
      );
    }
    console.log(
      `[agent] run complete conversationId=${conversationId} userId=${userId} model=${candidateModel} ` +
        `usage=${JSON.stringify(finalResponse?.usage ?? null)}`
    );

    return { modelUsed: candidateModel };
    }
  }

  const message = lastError instanceof Error ? lastError.message : "Agent run failed";
  await db
    .update(agentRuns)
    .set({ status: "error", completedAt: new Date(), error: message })
    .where(eq(agentRuns.id, run.id));
  console.error(`[agent] run failed conversationId=${conversationId} userId=${userId} error=${message}`);
  throw lastError instanceof Error ? lastError : new Error(message);
}
