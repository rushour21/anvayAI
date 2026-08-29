import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { getCompanyProfile } from "@/lib/finance/providers/company-data";

/* Real company data via Financial Modeling Prep (lib/finance/providers) —
   no longer mock. */

const inputSchema = z.object({
  symbol: z.string().describe("Stock ticker symbol, e.g. AAPL"),
});

export const companyProfileTool = tool({
  name: "get_company_profile",
  description:
    "Returns company profile information (name, sector, industry, description, CEO, " +
    "website, country) for a stock ticker, backed by real data (Financial Modeling Prep). " +
    "Use this to identify or describe a company before deeper analysis. Input: { symbol }.",
  inputSchema,
  execute: async ({ symbol }) => {
    const ticker = symbol.trim().toUpperCase();
    try {
      const profile = await getCompanyProfile(ticker);
      if (!profile) {
        return { ok: false as const, error: `No company profile found for symbol "${ticker}".` };
      }
      return {
        ok: true as const,
        ...profile,
        source: "financial_modeling_prep",
        retrievedAt: new Date().toISOString(),
      };
    } catch (err) {
      return { ok: false as const, error: err instanceof Error ? err.message : "Company profile lookup failed." };
    }
  },
});
