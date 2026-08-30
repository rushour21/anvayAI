import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import type { ChatResult } from "@openrouter/sdk/models";
import { getClient } from "../openrouter";

/* Real news search, same mechanism as search-web.ts (OpenRouter's "web"
   plugin) but with a recency-biased system prompt — a distinct tool so the
   model can choose "recent news" vs. general web search intentionally. */

const NEWS_MODEL = "openai/gpt-4o-mini";

function buildNewsSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return (
    `Today's date is ${today}. You are a financial news search assistant with live web ` +
    "search enabled for this request. Base your answer STRICTLY on the actual search " +
    "results returned to you just now — never describe anything from your own training " +
    "knowledge as if it were current news, since that knowledge has a fixed cutoff and may " +
    `already be a year or more out of date relative to ${today}. If a search result's own ` +
    "date is more than a few weeks before today, or the search didn't clearly return " +
    "current results, say so explicitly instead of presenting old or remembered " +
    "information as \"the latest\". Never invent a product name, date, or event that isn't " +
    "directly supported by a specific search result. Reply with a short, plain factual " +
    "summary (2-4 sentences, no Markdown, no headings, no bullet lists — sentences and " +
    "paragraphs only), followed by a final line starting with 'Sources:' listing each " +
    "source as 'Title — URL', comma-separated, including each item's actual publish date. " +
    "If no recent news was found, say so plainly instead of guessing."
  );
}

const inputSchema = z.object({
  query: z.string().describe("News search query, e.g. 'Apple product announcement'"),
});

export const searchNewsTool = tool({
  name: "search_news",
  description:
    "Searches the real web specifically for recent news — announcements, earnings, " +
    "developments in the last days/weeks. Use this instead of search_web when the user " +
    "wants what's happening now. Input: { query }. Returns a summary plus a sources line, " +
    "backed by OpenRouter's web search plugin.",
  inputSchema,
  execute: async ({ query }) => {
    const trimmed = query.trim();
    try {
      const result = (await getClient().chat.send({
        chatRequest: {
          model: NEWS_MODEL,
          messages: [
            { role: "system", content: buildNewsSystemPrompt() },
            { role: "user", content: trimmed },
          ],
          plugins: [{ id: "web", maxResults: 5 }],
          stream: false,
        },
      })) as ChatResult;
      const content = result.choices?.[0]?.message?.content;
      const summary = typeof content === "string" ? content.trim() : "";
      if (!summary) return { ok: false as const, error: "News search returned no result." };
      return {
        ok: true as const,
        query: trimmed,
        summary,
        source: "openrouter_web_search",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "News search failed." };
    }
  },
});
