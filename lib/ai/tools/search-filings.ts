import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { searchFilings } from "@/lib/finance/providers/filings";

const inputSchema = z.object({
  query: z.string().describe("Search text, e.g. a company name — 'Apple Inc'"),
  forms: z
    .string()
    .optional()
    .describe("Comma-separated SEC form types to filter by, e.g. '10-K,10-Q'. Omit for all forms."),
});

export const searchFilingsTool = tool({
  name: "search_filings",
  description:
    "Searches real SEC EDGAR filings (10-K, 10-Q, 8-K, etc.) by company name or keyword. " +
    "Use this when the user asks about a specific filing or wants to verify something " +
    "against the actual SEC record. Input: { query, forms? }. Returns matching filings with " +
    "company name, form type, filing date, and a direct link to the filing.",
  inputSchema,
  execute: async ({ query, forms }) => {
    try {
      const results = await searchFilings(query, forms ? { forms } : undefined);
      if (results.length === 0) {
        return { ok: false as const, error: `No SEC filings found for "${query}".` };
      }
      return {
        ok: true as const,
        query,
        source: "sec_edgar",
        retrievedAt: new Date().toISOString(),
        results: results.slice(0, 10),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Filing search failed." };
    }
  },
});
