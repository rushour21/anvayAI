import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getIncomeStatement } from "@/lib/finance/providers/financial-statements";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  years: z.array(z.number()).optional().describe("Specific fiscal years to return, e.g. [2023, 2024]."),
});

export const incomeStatementTool = tool({
  name: "get_income_statement",
  description:
    "Returns annual income statement data (revenue, gross profit, operating income, net " +
    "income, EBITDA, EPS) for a stock ticker, backed by real data (Financial Modeling Prep, " +
    "from SEC filings). Input: { symbol, years? }. Returns one entry per fiscal year, most " +
    "recent first.",
  inputSchema,
  execute: async ({ symbol, years }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const all = await getIncomeStatement(ticker);
      if (all.length === 0) {
        return { ok: false as const, error: `No income statement data found for symbol "${ticker}".` };
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
      return { ok: false as const, error: err instanceof Error ? err.message : "Income statement lookup failed." };
    }
  },
});
