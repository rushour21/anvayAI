import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import type { ChatResult } from "@openrouter/sdk/models";
import { getClient } from "../openrouter";

/* Real news search, same mechanism as search-web.ts (OpenRouter's "web"
   plugin) but with a recency-biased system prompt — a distinct tool so the
   model can choose "recent news" vs. general web search intentionally. */

const NEWS_MODEL = "openai/gpt-4o-mini";

const NEWS_SYSTEM_PROMPT =
  "You are a financial news search assistant. Search the web for recent news specifically " +
  "(prioritize the last few days to weeks) about the user's query and reply with a short, " +
  "plain factual summary (2-4 sentences, no Markdown, no headings, no bullet lists — " +
  "sentences and paragraphs only), followed by a final line starting with 'Sources:' " +
  "listing each source as 'Title — URL', comma-separated, including publish dates where " +
  "available. If no recent news was found, say so plainly instead of guessing.";

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
            { role: "system", content: NEWS_SYSTEM_PROMPT },
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
