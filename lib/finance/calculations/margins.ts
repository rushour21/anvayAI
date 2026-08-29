import { CalcResult, round2 } from "./types";

export function calculateGrossMargin(revenue: number, grossProfit: number): CalcResult {
  if (typeof revenue !== "number" || typeof grossProfit !== "number") {
    return { ok: false, error: "revenue and grossProfit are required." };
  }
  if (revenue === 0) return { ok: false, error: "revenue cannot be 0." };
  return {
    ok: true,
    metric: "gross_margin",
    inputs: { revenue, grossProfit },
    result: round2((grossProfit / revenue) * 100),
    unit: "percent",
    formula: "(grossProfit / revenue) * 100",
  };
}

export function calculateOperatingMargin(revenue: number, operatingIncome: number): CalcResult {
  if (typeof revenue !== "number" || typeof operatingIncome !== "number") {
    return { ok: false, error: "revenue and operatingIncome are required." };
  }
  if (revenue === 0) return { ok: false, error: "revenue cannot be 0." };
  return {
    ok: true,
    metric: "operating_margin",
    inputs: { revenue, operatingIncome },
    result: round2((operatingIncome / revenue) * 100),
    unit: "percent",
    formula: "(operatingIncome / revenue) * 100",
  };
}

export function calculateNetMargin(revenue: number, netIncome: number): CalcResult {
  if (typeof revenue !== "number" || typeof netIncome !== "number") {
    return { ok: false, error: "revenue and netIncome are required." };
  }
  if (revenue === 0) return { ok: false, error: "revenue cannot be 0." };
  return {
    ok: true,
    metric: "net_margin",
    inputs: { revenue, netIncome },
    result: round2((netIncome / revenue) * 100),
    unit: "percent",
    formula: "(netIncome / revenue) * 100",
  };
}
