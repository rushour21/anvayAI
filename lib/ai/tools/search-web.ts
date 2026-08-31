import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";

/* Real web search via Tavily's API directly — no LLM call involved. This
   used to go through OpenRouter's "web" plugin + a secondary gpt-4o-mini
   summarization call, which made every search dependent on OpenAI credits
   and let a second model's own (possibly stale) training knowledge leak
   into "current" answers. The main agent now reads these raw results and
   synthesizes/cites them itself — same separation of concerns already used
   for financial data (tool returns facts, the agent does the analysis). */

const TAVILY_URL = "https://api.tavily.com/search";

function getApiKey(): string {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw new Error("TAVILY_API_KEY is not set — check .env");
  return key;
}

export type WebSearchResult = {
  title: string;
  url: string;
  content: string;
  publishedAt?: string;
};

export async function tavilySearch(
  query: string,
  topic: "general" | "news",
  timeRange?: "day" | "week" | "month"
): Promise<WebSearchResult[]> {
  const res = await fetch(TAVILY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getApiKey()}` },
    body: JSON.stringify({
      query,
      topic,
      search_depth: "basic",
      max_results: 5,
      ...(timeRange ? { time_range: timeRange } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Tavily search failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as {
    results: Array<{ title: string; url: string; content: string; published_date?: string }>;
  };
  return data.results.map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
    ...(r.published_date ? { publishedAt: r.published_date } : {}),
  }));
}

const inputSchema = z.object({
  query: z.string().describe("Search query, e.g. 'Apple Q4 2025 earnings'"),
});

export const searchWebTool = tool({
  name: "search_web",
  description:
    "Searches the real web for current information not in your training data — news, " +
    "recent events, filings, or anything time-sensitive. Input: { query }. Returns up to 5 " +
    "raw results, each { title, url, content, publishedAt }. Read them yourself and cite by " +
    "title the ones you actually use — never invent a result that isn't in this list, and " +
    "never fall back on your own training knowledge for anything time-sensitive.",
  inputSchema,
  execute: async ({ query }) => {
    const trimmed = query.trim();
    try {
      const results = await tavilySearch(trimmed, "general");
      if (results.length === 0) {
        return { ok: false as const, error: "No web results found for this query." };
      }
      return {
        ok: true as const,
        query: trimmed,
        results,
        source: "tavily",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Web search failed." };
    }
  },
});
