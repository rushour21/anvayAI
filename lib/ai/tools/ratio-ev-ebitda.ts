import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getQuote } from "@/lib/finance/providers/market-data";
import { getIncomeStatement, getBalanceSheet } from "@/lib/finance/providers/financial-statements";
import { calculateEVToEBITDA } from "@/lib/finance/calculations";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year for EBITDA/debt/cash. Omit for the most recent available year."),
});

export const evEbitdaRatioTool = tool({
  name: "get_ev_ebitda",
  description:
    "Returns the EV/EBITDA ratio for a stock ticker. Enterprise value is computed as market " +
    "cap plus total debt minus cash; EBITDA comes from the income statement — both " +
    "deterministic, not estimated by you. Input: { symbol, year? }.",
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
      if (!incomeYear || !balanceYear) {
        return { ok: false as const, error: `No EBITDA/balance sheet data found for symbol "${ticker}".` };
      }

      const enterpriseValue = quote.marketCap + balanceYear.totalDebt - balanceYear.cashAndCashEquivalents;
      const calc = calculateEVToEBITDA(enterpriseValue, incomeYear.ebitda);
      if (!calc.ok) return calc;
      return {
        symbol: ticker,
        year: incomeYear.year,
        ...calc,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "EV/EBITDA lookup failed." };
    }
  },
});
