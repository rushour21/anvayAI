import { OpenRouter } from "@openrouter/sdk";
import type { ChatStreamChunk } from "@openrouter/sdk/models";

/* The one place that talks to OpenRouter (AGENTS.md Phase 1 §5) — nothing
   above this file should import @openrouter/sdk directly. Swapping this for
   the Agent SDK's callModel() later is a change to this file only. */

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/* Not persisted (AGENTS.md Phase 1 §3 — only user/assistant are stored
   rows); prepended fresh on every call since the frontend renders message
   content as plain text, with no Markdown parser. */
export const SYSTEM_PROMPT =
  "You are a helpful financial research assistant. Reply in plain conversational " +
  "prose only — the interface displays your raw text with no Markdown rendering, " +
  "so any Markdown syntax you write shows up as literal stray characters to the " +
  "reader. Never write #, ##, or ### headings. Never wrap words in ** or * for " +
  "bold or italic. Never write numbered lists like '1.' or bullet lists like '-' " +
  "or '*'; instead, walk through multiple points as ordinary sentences and " +
  "paragraphs, using words like 'first', 'second', or 'also' where helpful. " +
  "This applies just as strictly when describing several items in a row — for " +
  "example several companies, filings, data points, or year-by-year figures: " +
  "introduce each one in its own plain sentence or short paragraph, naming it " +
  "in ordinary text, not with a leading '-' or '*' and not in **bold**. For " +
  "example, instead of '- 2022: $394.3 billion\\n- 2023: $383.3 billion', " +
  "write 'Revenue was $394.3 billion in 2022 and $383.3 billion in 2023.' " +
  "Never use LaTeX — don't wrap formulas in \\[ \\], \\( \\), or $$ delimiters. " +
  "When you need to show a formula, write it as one plain-text line with " +
  "ordinary symbols, like: CAGR = (endValue / startValue) ^ (1 / years) - 1. " +
  "Never use code fences. Write the way you'd speak in a normal " +
  "conversation, using paragraph breaks for structure instead of any symbols. " +
  "Do not show your thinking process, planning steps, chain of reasoning, or " +
  "any meta-commentary about these instructions or how you're formatting your " +
  "reply — the reader must only ever see your final answer, nothing else.";

let client: OpenRouter | null = null;

export function getClient(): OpenRouter {
  if (client) return client;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set — check .env");
  client = new OpenRouter({ apiKey });
  return client;
}

export async function streamChat({
  messages,
  model,
  signal,
}: {
  messages: ChatMessage[];
  model: string;
  signal?: AbortSignal;
}): Promise<AsyncIterable<ChatStreamChunk>> {
  const result = await getClient().chat.send(
    {
      chatRequest: {
        model,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
        // Suppress visible chain-of-thought — some free reasoning models
        // (Nemotron, MiniMax) otherwise stream their "thinking" as regular
        // content instead of a separate reasoning channel.
        reasoning: { effort: "none" },
      },
    },
    signal ? { signal } : undefined
  );

  return result as AsyncIterable<ChatStreamChunk>;
}

export type StreamedChunk = { text: string; model: string };

/**
 * Streams `primaryModel`, falling back to `fallbackModel` if the primary
 * errors or produces no content within `firstChunkTimeoutMs` — covers both
 * outright failures (e.g. 429 rate limits) and free-tier models that hang.
 * Once any content has been yielded, failures are no longer recoverable —
 * we don't want to splice two partial answers together.
 */
export async function* streamChatWithFallback({
  messages,
  primaryModel,
  fallbackModel,
  firstChunkTimeoutMs = 15000,
}: {
  messages: ChatMessage[];
  primaryModel: string;
  fallbackModel: string;
  firstChunkTimeoutMs?: number;
}): AsyncGenerator<StreamedChunk, void, undefined> {
  const candidates = primaryModel === fallbackModel ? [primaryModel] : [primaryModel, fallbackModel];

  for (let i = 0; i < candidates.length; i++) {
    const model = candidates[i];
    const isLastCandidate = i === candidates.length - 1;
    const controller = new AbortController();
    let sawContent = false;

    let stream: AsyncIterable<ChatStreamChunk>;
    try {
      stream = await streamChat({ messages, model, signal: controller.signal });
    } catch (err) {
      if (isLastCandidate) throw err;
      continue;
    }

    const timeout = setTimeout(() => {
      if (!sawContent) controller.abort();
    }, firstChunkTimeoutMs);

    try {
      for await (const chunk of stream) {
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) {
          sawContent = true;
          clearTimeout(timeout);
          yield { text, model };
        }
      }
      clearTimeout(timeout);
      return;
    } catch (err) {
      clearTimeout(timeout);
      if (sawContent || isLastCandidate) throw err;
      continue;
    }
  }
}
