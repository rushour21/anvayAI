import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getQuote } from "@/lib/finance/providers/market-data";
import { getIncomeStatement, getBalanceSheet } from "@/lib/finance/providers/financial-statements";
import { calculatePB } from "@/lib/finance/calculations";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year for book value. Omit for the most recent available year."),
});

export const pbRatioTool = tool({
  name: "get_pb",
  description:
    "Returns the price-to-book (P/B) ratio for a stock ticker: current price divided by " +
    "book value per share (shareholder equity / shares outstanding), computed " +
    "deterministically. Input: { symbol, year? }.",
  inputSchema,
  execute: async ({ symbol, year }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const [quote, income, balance] = await Promise.all([
        getQuote(ticker),
        getIncomeStatement(ticker),
        getBalanceSheet(ticker),
      ]);
      if (!quote) return { ok: false as const, error: `No quote data found for symbol "${ticker}".` };
      const incomeYear = year ? income.find((s) => s.year === year) : income[0];
      const balanceYear = year ? balance.find((s) => s.year === year) : balance[0];
      if (!incomeYear || !balanceYear || incomeYear.weightedAverageShsOut === 0) {
        return { ok: false as const, error: `No shares-outstanding/equity data found for symbol "${ticker}".` };
      }

      const bookValuePerShare = balanceYear.totalStockholdersEquity / incomeYear.weightedAverageShsOut;
      const calc = calculatePB(quote.price, bookValuePerShare);
      if (!calc.ok) return calc;
      return {
        symbol: ticker,
        year: balanceYear.year,
        ...calc,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "P/B lookup failed." };
    }
  },
});
