import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import {
  calculatePercentageChange,
  calculateYoYGrowth,
  calculateCAGR,
  calculateGrossMargin,
  calculateOperatingMargin,
  calculateNetMargin,
  calculateROE,
  calculateROIC,
  type CalcResult,
} from "@/lib/finance/calculations";

/* The one tool the model must never substitute with mental arithmetic
   (AGENTS.md Phase 3 §6) — every metric here is computed by the
   deterministic functions in lib/finance/calculations/, not by the LLM.
   This tool is a thin dispatcher only; see that directory for the actual
   math and its unit tests. */

const inputSchema = z.object({
  metric: z.enum([
    "percentage_change",
    "yoy_growth",
    "cagr",
    "gross_margin",
    "operating_margin",
    "net_margin",
    "roe",
    "roic",
  ]),
  startValue: z.number().optional(),
  endValue: z.number().optional(),
  years: z.number().optional(),
  revenue: z.number().optional(),
  grossProfit: z.number().optional(),
  operatingIncome: z.number().optional(),
  netIncome: z.number().optional(),
  netEarnings: z.number().optional(),
  shareholderEquity: z.number().optional(),
  nopat: z.number().optional(),
  investedCapital: z.number().optional(),
});

type Input = z.infer<typeof inputSchema>;

function missingFieldsError(metric: string, fields: string[]): CalcResult {
  return { ok: false, error: `Missing required numeric input(s) for "${metric}": ${fields.join(", ")}.` };
}

function compute(input: Input): CalcResult {
  switch (input.metric) {
    case "percentage_change": {
      const { startValue, endValue } = input;
      if (typeof startValue !== "number" || typeof endValue !== "number") {
        return missingFieldsError(input.metric, ["startValue", "endValue"]);
      }
      return calculatePercentageChange(startValue, endValue);
    }
    case "yoy_growth": {
      const { startValue, endValue } = input;
      if (typeof startValue !== "number" || typeof endValue !== "number") {
        return missingFieldsError(input.metric, ["startValue", "endValue"]);
      }
      return calculateYoYGrowth(startValue, endValue);
    }
    case "cagr": {
      const { startValue, endValue, years } = input;
      if (typeof startValue !== "number" || typeof endValue !== "number" || typeof years !== "number") {
        return missingFieldsError(input.metric, ["startValue", "endValue", "years"]);
      }
      return calculateCAGR(startValue, endValue, years);
    }
    case "gross_margin": {
      const { revenue, grossProfit } = input;
      if (typeof revenue !== "number" || typeof grossProfit !== "number") {
        return missingFieldsError(input.metric, ["revenue", "grossProfit"]);
      }
      return calculateGrossMargin(revenue, grossProfit);
    }
    case "operating_margin": {
      const { revenue, operatingIncome } = input;
      if (typeof revenue !== "number" || typeof operatingIncome !== "number") {
        return missingFieldsError(input.metric, ["revenue", "operatingIncome"]);
      }
      return calculateOperatingMargin(revenue, operatingIncome);
    }
    case "net_margin": {
      const { revenue, netIncome } = input;
      if (typeof revenue !== "number" || typeof netIncome !== "number") {
        return missingFieldsError(input.metric, ["revenue", "netIncome"]);
      }
      return calculateNetMargin(revenue, netIncome);
    }
    case "roe": {
      const { netEarnings, shareholderEquity } = input;
      if (typeof netEarnings !== "number" || typeof shareholderEquity !== "number") {
        return missingFieldsError(input.metric, ["netEarnings", "shareholderEquity"]);
      }
      return calculateROE(netEarnings, shareholderEquity);
    }
    case "roic": {
      const { nopat, investedCapital } = input;
      if (typeof nopat !== "number" || typeof investedCapital !== "number") {
        return missingFieldsError(input.metric, ["nopat", "investedCapital"]);
      }
      return calculateROIC(nopat, investedCapital);
    }
  }
}

export const calculateMetricTool = tool({
  name: "calculate_metric",
  description:
    "Performs an exact financial calculation with plain deterministic arithmetic — never " +
    "approximate this yourself. Supports: percentage_change, yoy_growth, cagr, gross_margin, " +
    "operating_margin, net_margin, roe, roic. Pass only the numeric inputs relevant to the " +
    "chosen metric (e.g. cagr needs startValue, endValue, years; gross_margin needs revenue " +
    "and grossProfit). Get the raw figures from get_financials first if you don't already " +
    "have them. Returns the inputs used, the result, its unit, and the formula applied — or " +
    "a structured error if required inputs are missing or invalid.",
  inputSchema,
  execute: async (input) => compute(input),
});
