import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { conversation, messages as messagesTable } from "@/db/schema";
import { getClient, type ChatMessage } from "@/lib/ai/openrouter";
import { FALLBACK_MODEL } from "@/lib/ai/models";
import type { ChatResult } from "@openrouter/sdk/models";

/* Phase 8 conversation memory. Before this, every turn sent the entire
   message history to the model — cost and latency grew linearly with
   conversation length and would eventually exceed the context window.
   Here the older half is replaced with a rolling summary while recent
   turns stay verbatim. */

/* ~4 characters per token is the standard rough approximation; precise
   counting isn't worth a tokenizer dependency just to decide when to
   compact. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/* Compact only once history is genuinely large — summarizing early costs
   a model call and loses detail for no benefit. */
const COMPACT_THRESHOLD_TOKENS = 3000;

/* Always send this many of the most recent messages verbatim. Financial
   work is detail-sensitive, so this window is deliberately generous. */
const VERBATIM_RECENT_MESSAGES = 8;

const SUMMARY_MODEL = FALLBACK_MODEL;
const SUMMARY_MAX_TOKENS = 600;

const SUMMARY_INSTRUCTION =
  "You are compacting the earlier part of a financial research conversation so it can be " +
  "carried forward in limited context. Write a dense factual summary in plain prose. " +
  "PRESERVE EXACTLY: every specific figure, ticker, company name, fiscal year, date, " +
  "calculation result, filename, page citation, and source cited. Preserve what the user " +
  "asked for and any stated preferences or constraints. Drop pleasantries, restatements, " +
  "and narration. Never round, re-derive, or approximate a number that was stated — copy " +
  "it. If an earlier summary is included, fold it in rather than repeating it separately.";

async function generateSummary(previousSummary: string | null, transcript: string): Promise<string | null> {
  const input = previousSummary
    ? `Earlier summary:\n${previousSummary}\n\nNewer messages to fold in:\n${transcript}`
    : transcript;
  try {
    const result = (await getClient().chat.send({
      chatRequest: {
        model: SUMMARY_MODEL,
        messages: [
          { role: "system", content: SUMMARY_INSTRUCTION },
          { role: "user", content: input },
        ],
        maxTokens: SUMMARY_MAX_TOKENS,
        stream: false,
      },
    })) as ChatResult;
    const content = result.choices?.[0]?.message?.content;
    const summary = typeof content === "string" ? content.trim() : "";
    return summary || null;
  } catch (err) {
    // Non-fatal: on failure we simply don't compact this turn and send the
    // full history, which is the pre-Phase-8 behavior.
    console.error("[memory] summarization failed, sending full history:", err);
    return null;
  }
}

export type ConversationContext = {
  /** Recent turns to send verbatim (or all of them, when not compacting). */
  messages: ChatMessage[];
  /** Rolling summary of everything older, or null when nothing is compacted. */
  summary: string | null;
};

/**
 * Builds the model input for a conversation, compacting older turns into a
 * rolling summary once the history gets large. Persists the summary so the
 * work isn't repeated on the next turn.
 */
export async function buildConversationContext(conversationId: string): Promise<ConversationContext> {
  const [convo, history] = await Promise.all([
    db.query.conversation.findFirst({ where: eq(conversation.id, conversationId) }),
    db.query.messages.findMany({
      where: eq(messagesTable.conversationId, conversationId),
      orderBy: asc(messagesTable.createdAt),
    }),
  ]);

  const toChatMessage = (m: (typeof history)[number]): ChatMessage => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  });

  const existingSummary = convo?.summary ?? null;
  const summarizedThrough = convo?.summarizedThrough ?? null;

  // Anything already covered by a previous summary never needs resending.
  const uncovered = summarizedThrough
    ? history.filter((m) => m.createdAt > summarizedThrough)
    : history;

  const uncoveredTokens = estimateTokens(uncovered.map((m) => m.content).join("\n"));

  // Small enough to send as-is (plus whatever summary already exists).
  if (uncoveredTokens < COMPACT_THRESHOLD_TOKENS || uncovered.length <= VERBATIM_RECENT_MESSAGES) {
    return { messages: uncovered.map(toChatMessage), summary: existingSummary };
  }

  const cutoff = uncovered.length - VERBATIM_RECENT_MESSAGES;
  const toCompact = uncovered.slice(0, cutoff);
  const recent = uncovered.slice(cutoff);

  const transcript = toCompact.map((m) => `${m.role}: ${m.content}`).join("\n\n");
  const summary = await generateSummary(existingSummary, transcript);

  if (!summary) {
    return { messages: uncovered.map(toChatMessage), summary: existingSummary };
  }

  const newSummarizedThrough = toCompact[toCompact.length - 1]!.createdAt;
  await db
    .update(conversation)
    .set({ summary, summarizedThrough: newSummarizedThrough })
    .where(eq(conversation.id, conversationId))
    .catch((err) => console.error("[memory] failed to persist summary:", err));

  return { messages: recent.map(toChatMessage), summary };
}
