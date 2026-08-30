import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import type { ChatResult } from "@openrouter/sdk/models";
import { getClient } from "../openrouter";

/* Real web search via OpenRouter's built-in "web" plugin (id: "web") — a
   separate, non-streaming chat.send() call on a fixed cheap model, kept
   independent of whichever model the main agent turn is using. The Chat
   Completions surface doesn't return structured citation objects for this
   plugin, so the sub-call is instructed to list its sources as plain text,
   which we return as-is rather than inventing a {title,url} shape we can't
   actually populate reliably. */

const SEARCH_MODEL = "openai/gpt-4o-mini";

function buildSearchSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return (
    `Today's date is ${today}. You are a web search assistant with live web search enabled ` +
    "for this request. Base your answer STRICTLY on the actual search results returned to " +
    "you just now — never describe anything from your own training knowledge as if it were " +
    `current, since that knowledge has a fixed cutoff and may already be out of date relative ` +
    `to ${today}. If the search results are ambiguous, outdated, or don't clearly answer the ` +
    "query, say so explicitly rather than filling the gap with remembered or guessed " +
    "information. Never invent a product name, date, figure, or event that isn't directly " +
    "supported by a specific search result. Reply with a short, plain factual summary of " +
    "what you found (2-4 sentences, no Markdown, no headings, no bullet lists — sentences " +
    "and paragraphs only), followed by a final line starting with 'Sources:' listing each " +
    "source as 'Title — URL', comma-separated. If search found nothing useful, say so " +
    "plainly instead of guessing."
  );
}

const inputSchema = z.object({
  query: z.string().describe("Search query, e.g. 'Apple Q4 2025 earnings'"),
});

export const searchWebTool = tool({
  name: "search_web",
  description:
    "Searches the real web for current information not in your training data — news, " +
    "recent events, filings, or anything time-sensitive. Input: { query }. Returns a text " +
    "summary of what was found plus a sources line. Backed by OpenRouter's web search " +
    "plugin — real results, but the summary comes from a secondary model call, so treat it " +
    "as a starting point rather than a verbatim quote.",
  inputSchema,
  execute: async ({ query }) => {
    const trimmed = query.trim();
    try {
      const result = await getClient().chat.send({
        chatRequest: {
          model: SEARCH_MODEL,
          messages: [
            { role: "system", content: buildSearchSystemPrompt() },
            { role: "user", content: trimmed },
          ],
          plugins: [{ id: "web", maxResults: 5 }],
          stream: false,
        },
      }) as ChatResult;
      const content = result.choices?.[0]?.message?.content;
      const summary = typeof content === "string" ? content.trim() : "";
      if (!summary) {
        return { ok: false as const, error: "Web search returned no result." };
      }
      return {
        ok: true as const,
        query: trimmed,
        summary,
        source: "openrouter_web_search",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return {
        ok: false as const,
        error: err instanceof Error ? err.message : "Web search failed.",
      };
    }
  },
});
