import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getQuote } from "@/lib/finance/providers/market-data";
import { getIncomeStatement } from "@/lib/finance/providers/financial-statements";
import { calculatePE } from "@/lib/finance/calculations";

/* Ratio tools separate raw data (providers) from calculation (deterministic
   functions in lib/finance/calculations) — the model never computes the
   ratio itself (AGENTS.md Phase 4 §4.3). */

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year for EPS. Omit for the most recent available year."),
});

export const peRatioTool = tool({
  name: "get_pe",
  description:
    "Returns the price-to-earnings (P/E) ratio for a stock ticker: current price divided " +
    "by EPS, computed deterministically (not estimated by you). Input: { symbol, year? }.",
  inputSchema,
  execute: async ({ symbol, year }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const [quote, statements] = await Promise.all([getQuote(ticker), getIncomeStatement(ticker)]);
      if (!quote) return { ok: false as const, error: `No quote data found for symbol "${ticker}".` };
      const statement = year ? statements.find((s) => s.year === year) : statements[0];
      if (!statement) return { ok: false as const, error: `No EPS data found for symbol "${ticker}".` };

      const calc = calculatePE(quote.price, statement.eps);
      if (!calc.ok) return calc;
      return {
        symbol: ticker,
        year: statement.year,
        ...calc,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "P/E lookup failed." };
    }
  },
});
