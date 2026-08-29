import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getBalanceSheet } from "@/lib/finance/providers/financial-statements";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  years: z.array(z.number()).optional().describe("Specific fiscal years to return, e.g. [2023, 2024]."),
});

export const balanceSheetTool = tool({
  name: "get_balance_sheet",
  description:
    "Returns annual balance sheet data (total assets, total liabilities, shareholder " +
    "equity, total debt, cash) for a stock ticker, backed by real data (Financial Modeling " +
    "Prep, from SEC filings). Input: { symbol, years? }. Returns one entry per fiscal year, " +
    "most recent first.",
  inputSchema,
  execute: async ({ symbol, years }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const all = await getBalanceSheet(ticker);
      if (all.length === 0) {
        return { ok: false as const, error: `No balance sheet data found for symbol "${ticker}".` };
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
      return { ok: false as const, error: err instanceof Error ? err.message : "Balance sheet lookup failed." };
    }
  },
});
