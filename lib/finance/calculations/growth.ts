import { CalcResult, round2 } from "./types";

export function calculatePercentageChange(startValue: number, endValue: number): CalcResult {
  if (typeof startValue !== "number" || typeof endValue !== "number") {
    return { ok: false, error: "startValue and endValue are required." };
  }
  if (startValue === 0) return { ok: false, error: "startValue cannot be 0 for a percentage change." };
  return {
    ok: true,
    metric: "percentage_change",
    inputs: { startValue, endValue },
    result: round2(((endValue - startValue) / Math.abs(startValue)) * 100),
    unit: "percent",
    formula: "((endValue - startValue) / |startValue|) * 100",
  };
}

export function calculateYoYGrowth(startValue: number, endValue: number): CalcResult {
  if (typeof startValue !== "number" || typeof endValue !== "number") {
    return { ok: false, error: "startValue and endValue are required." };
  }
  if (startValue === 0) return { ok: false, error: "startValue cannot be 0 for YoY growth." };
  return {
    ok: true,
    metric: "yoy_growth",
    inputs: { startValue, endValue },
    result: round2(((endValue - startValue) / Math.abs(startValue)) * 100),
    unit: "percent",
    formula: "((thisYear - lastYear) / |lastYear|) * 100",
  };
}

export function calculateCAGR(startValue: number, endValue: number, years: number): CalcResult {
  if (typeof startValue !== "number" || typeof endValue !== "number" || typeof years !== "number") {
    return { ok: false, error: "startValue, endValue, and years are required." };
  }
  if (startValue <= 0 || endValue <= 0) {
    return { ok: false, error: "CAGR requires positive startValue and endValue." };
  }
  if (years <= 0) return { ok: false, error: "years must be greater than 0." };
  return {
    ok: true,
    metric: "cagr",
    inputs: { startValue, endValue, years },
    result: round2((Math.pow(endValue / startValue, 1 / years) - 1) * 100),
    unit: "percent",
    formula: "((endValue / startValue) ^ (1 / years) - 1) * 100",
  };
}
