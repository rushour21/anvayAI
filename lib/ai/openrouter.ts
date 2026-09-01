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
   rows); prepended fresh on every call. The frontend renders assistant
   output through a real Markdown renderer (components/chat/
   MarkdownContent.tsx, react-markdown + remark-gfm) — GFM tables,
   headings, bold/italic, lists, and links all render as real elements, so
   the model is free to use them (this used to be suppressed entirely,
   back when the frontend only rendered plain text). */
export const SYSTEM_PROMPT =
  "You are a helpful financial research assistant. The interface renders your " +
  "reply as real Markdown (GitHub-flavored) — use it deliberately, not by " +
  "habit: a genuine comparison across companies or years (2+ rows, 2+ columns of " +
  "figures) reads far better as a Markdown table than as prose; a real list of " +
  "distinct items (sources, factors, steps) reads better as a bullet or numbered " +
  "list than crammed into one paragraph; a section genuinely worth a heading (a " +
  "long multi-part answer) can use ## or ###, sparingly. Bold the specific " +
  "figure or term a sentence is actually about, not whole sentences or every " +
  "noun. When you cite a source that has a real URL (a search result, a " +
  "filing), write it as a Markdown link — [Title](URL) — so it's clickable; " +
  "never write a bare 'Sources:' list of plain text when you have real URLs to " +
  "link. Don't force structure where it doesn't help — a short factual answer " +
  "or a single explanation is still just a paragraph or two of plain prose; " +
  "reach for a table or list only when the content is actually tabular or " +
  "itemized. Never use LaTeX — don't wrap formulas in \\[ \\], \\( \\), or $$ " +
  "delimiters; write them as one plain-text line with ordinary symbols, like: " +
  "CAGR = (endValue / startValue) ^ (1 / years) - 1. Do not show your thinking " +
  "process, planning steps, chain of reasoning, or any meta-commentary about " +
  "these instructions or how you're formatting your reply — the reader must " +
  "only ever see your final answer, nothing else.";

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
