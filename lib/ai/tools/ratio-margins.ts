import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getIncomeStatement } from "@/lib/finance/providers/financial-statements";
import { calculateGrossMargin, calculateOperatingMargin, calculateNetMargin } from "@/lib/finance/calculations";

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
  year: z.number().optional().describe("Fiscal year. Omit for the most recent available year."),
});

export const marginsRatioTool = tool({
  name: "get_margins",
  description:
    "Returns gross, operating, and net margin for a stock ticker in one call, each computed " +
    "deterministically from the income statement. Input: { symbol, year? }.",
  inputSchema,
  execute: async ({ symbol, year }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const income = await getIncomeStatement(ticker);
      const statement = year ? income.find((s) => s.year === year) : income[0];
      if (!statement) return { ok: false as const, error: `No financial data found for symbol "${ticker}".` };

      const gross = calculateGrossMargin(statement.revenue, statement.grossProfit);
      const operating = calculateOperatingMargin(statement.revenue, statement.operatingIncome);
      const net = calculateNetMargin(statement.revenue, statement.netIncome);

      return {
        ok: true as const,
        symbol: ticker,
        year: statement.year,
        grossMargin: gross,
        operatingMargin: operating,
        netMargin: net,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Margins lookup failed." };
    }
  },
});
