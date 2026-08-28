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
const SYSTEM_PROMPT =
  "You are a helpful financial research assistant. Reply in plain conversational " +
  "prose only — the interface displays your raw text with no Markdown rendering, " +
  "so any Markdown syntax you write shows up as literal stray characters to the " +
  "reader. Never write #, ##, or ### headings. Never wrap words in ** or * for " +
  "bold or italic. Never write numbered lists like '1.' or bullet lists like '-' " +
  "or '*'; instead, walk through multiple points as ordinary sentences and " +
  "paragraphs, using words like 'first', 'second', or 'also' where helpful. " +
  "Never use LaTeX or code fences. Write the way you'd speak in a normal " +
  "conversation, using paragraph breaks for structure instead of any symbols.";

let client: OpenRouter | null = null;

function getClient(): OpenRouter {
  if (client) return client;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set — check .env");
  client = new OpenRouter({ apiKey });
  return client;
}

export async function streamChat({
  messages,
}: {
  messages: ChatMessage[];
}): Promise<AsyncIterable<ChatStreamChunk>> {
  const model = process.env.OPENROUTER_MODEL;
  if (!model) throw new Error("OPENROUTER_MODEL is not set — check .env");

  const result = await getClient().chat.send({
    chatRequest: {
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
    },
  });

  return result as AsyncIterable<ChatStreamChunk>;
}
