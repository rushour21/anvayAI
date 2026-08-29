import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getIncomeStatement, getBalanceSheet } from "@/lib/finance/providers/financial-statements";
import { calculateROE } from "@/lib/finance/calculations";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year. Omit for the most recent available year."),
});

export const roeRatioTool = tool({
  name: "get_roe",
  description:
    "Returns return on equity (ROE) for a stock ticker: net income divided by shareholder " +
    "equity, computed deterministically. Input: { symbol, year? }.",
  inputSchema,
  execute: async ({ symbol, year }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const [income, balance] = await Promise.all([getIncomeStatement(ticker), getBalanceSheet(ticker)]);
      const incomeYear = year ? income.find((s) => s.year === year) : income[0];
      const balanceYear = year ? balance.find((s) => s.year === year) : balance[0];
      if (!incomeYear || !balanceYear) {
        return { ok: false as const, error: `No financial data found for symbol "${ticker}".` };
      }
      const calc = calculateROE(incomeYear.netIncome, balanceYear.totalStockholdersEquity);
      if (!calc.ok) return calc;
      return {
        symbol: ticker,
        year: incomeYear.year,
        ...calc,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "ROE lookup failed." };
    }
  },
});
