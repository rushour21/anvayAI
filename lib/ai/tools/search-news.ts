import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { tavilySearch } from "./search-web";

/* Real news search, same mechanism as search-web.ts (Tavily, no LLM call)
   but with topic="news" and a 1-week recency filter — a distinct tool so
   the agent can choose "recent news" vs. general web search intentionally. */

const inputSchema = z.object({
  query: z.string().describe("News search query, e.g. 'Apple product announcement'"),
});

export const searchNewsTool = tool({
  name: "search_news",
  description:
    "Searches the real web specifically for recent news — announcements, earnings, " +
    "developments in the last days/weeks. Use this instead of search_web when the user " +
    "wants what's happening now. Input: { query }. Returns up to 5 raw results, each " +
    "{ title, url, content, publishedAt }. Read them yourself and cite by title the ones " +
    "you actually use — never invent a result that isn't in this list, and never describe " +
    "something as \"the latest\" if its publishedAt date is old or missing.",
  inputSchema,
  execute: async ({ query }) => {
    const trimmed = query.trim();
    try {
      const results = await tavilySearch(trimmed, "news", "week");
      if (results.length === 0) {
        return { ok: false as const, error: "No recent news found for this query." };
      }
      return {
        ok: true as const,
        query: trimmed,
        results,
        source: "tavily",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "News search failed." };
    }
  },
});
