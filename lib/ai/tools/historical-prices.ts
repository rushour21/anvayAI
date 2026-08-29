import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getHistoricalPrices } from "@/lib/finance/providers/market-data";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  from: z.string().optional().describe("Start date, YYYY-MM-DD. Omit for a recent default window."),
  to: z.string().optional().describe("End date, YYYY-MM-DD. Omit for a recent default window."),
});

export const historicalPricesTool = tool({
  name: "get_historical_prices",
  description:
    "Returns daily historical price data (open, high, low, close, volume) for a stock " +
    "ticker over a date range, backed by real market data (Financial Modeling Prep). Use " +
    "this for price trend or performance-over-time questions. Input: { symbol, from?, to? } " +
    "(dates as YYYY-MM-DD). Omit from/to for a recent default window.",
  inputSchema,
  execute: async ({ symbol, from, to }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const points = await getHistoricalPrices(ticker, from, to);
      if (points.length === 0) {
        return { ok: false as const, error: `No historical price data found for symbol "${ticker}".` };
      }
      return {
        ok: true as const,
        symbol: ticker,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
        points,
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Historical price lookup failed." };
    }
  },
});
