import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getIncomeStatement, getBalanceSheet } from "@/lib/finance/providers/financial-statements";
import { calculateROIC } from "@/lib/finance/calculations";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year. Omit for the most recent available year."),
});

export const roicRatioTool = tool({
  name: "get_roic",
  description:
    "Returns return on invested capital (ROIC) for a stock ticker. NOPAT is operating " +
    "income after tax (using the filed effective tax rate); invested capital is " +
    "shareholder equity plus total debt minus cash — both deterministic. Input: " +
    "{ symbol, year? }.",
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
      if (incomeYear.incomeBeforeTax === 0) {
        return { ok: false as const, error: "Cannot derive an effective tax rate (incomeBeforeTax is 0)." };
      }
      const effectiveTaxRate = incomeYear.incomeTaxExpense / incomeYear.incomeBeforeTax;
      const nopat = incomeYear.operatingIncome * (1 - effectiveTaxRate);
      const investedCapital =
        balanceYear.totalStockholdersEquity + balanceYear.totalDebt - balanceYear.cashAndCashEquivalents;

      const calc = calculateROIC(nopat, investedCapital);
      if (!calc.ok) return calc;
      return {
        symbol: ticker,
        year: incomeYear.year,
        ...calc,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "ROIC lookup failed." };
    }
  },
});
