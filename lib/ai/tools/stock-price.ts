import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getQuote } from "@/lib/finance/providers/market-data";

/* Real market data via Financial Modeling Prep (lib/finance/providers) —
   no longer mock. See lib/finance/providers/market-data.ts for the
   provider boundary; this tool never calls the external API directly. */

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
});

export const stockPriceTool = tool({
  name: "get_stock_price",
  description:
    "Returns the current price for a stock ticker, backed by real market data (Financial " +
    "Modeling Prep). Use this when the user asks about a current or live share price. " +
    "Input: { symbol } (e.g. 'AAPL'). Returns symbol, price, currency, exchange, and source.",
  inputSchema,
  execute: async ({ symbol }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const quote = await getQuote(ticker);
      if (!quote) {
        return { ok: false as const, error: `No price data found for symbol "${ticker}".` };
      }
      return {
        ok: true as const,
        symbol: quote.symbol,
        name: quote.name,
        price: quote.price,
        currency: quote.currency,
        change: quote.change,
        changePercent: quote.changePercent,
        exchange: quote.exchange,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Stock price lookup failed." };
    }
  },
});
