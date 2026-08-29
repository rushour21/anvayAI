import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getMarketCap } from "@/lib/finance/providers/market-data";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
});

export const marketCapTool = tool({
  name: "get_market_cap",
  description:
    "Returns a company's current market capitalization, backed by real market data " +
    "(Financial Modeling Prep). Use this for company size/valuation-scale questions. " +
    "Input: { symbol }.",
  inputSchema,
  execute: async ({ symbol }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const cap = await getMarketCap(ticker);
      if (!cap) {
        return { ok: false as const, error: `No market cap data found for symbol "${ticker}".` };
      }
      return {
        ok: true as const,
        symbol: cap.symbol,
        date: cap.date,
        marketCap: cap.marketCap,
        currency: "USD",
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Market cap lookup failed." };
    }
  },
});
