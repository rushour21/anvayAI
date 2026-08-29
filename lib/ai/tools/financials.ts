import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getAnnualFinancials } from "@/lib/finance/providers/financial-statements";

/* Real financial statements via Financial Modeling Prep
   (lib/finance/providers) — no longer mock. */

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  years: z
    .array(z.number())
    .optional()
    .describe("Specific fiscal years to return, e.g. [2022, 2025]. Omit to get the most recent years available."),
});

export const financialsTool = tool({
  name: "get_financials",
  description:
    "Returns annual financial statement figures (revenue, gross profit, operating income, " +
    "net income, shareholder equity) for a stock ticker, backed by real data (Financial " +
    "Modeling Prep, from SEC filings). Use this before calculate_metric whenever you need " +
    "raw figures for growth, margin, CAGR, or ROE calculations. Input: { symbol, years? }. " +
    "Returns one entry per fiscal year, most recent years first.",
  inputSchema,
  execute: async ({ symbol, years }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const all = await getAnnualFinancials(ticker);
      if (all.length === 0) {
        return { ok: false as const, error: `No financial statement data found for symbol "${ticker}".` };
      }
      const filtered = years && years.length > 0 ? all.filter((y) => years.includes(y.year)) : all;
      return {
        ok: true as const,
        symbol: ticker,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
        years: filtered,
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Financials lookup failed." };
    }
  },
});
