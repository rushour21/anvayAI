import { CalcResult, round2 } from "./types";

export function calculateROE(netEarnings: number, shareholderEquity: number): CalcResult {
  if (typeof netEarnings !== "number" || typeof shareholderEquity !== "number") {
    return { ok: false, error: "netEarnings and shareholderEquity are required." };
  }
  if (shareholderEquity === 0) return { ok: false, error: "shareholderEquity cannot be 0." };
  return {
    ok: true,
    metric: "roe",
    inputs: { netEarnings, shareholderEquity },
    result: round2((netEarnings / shareholderEquity) * 100),
    unit: "percent",
    formula: "(netEarnings / shareholderEquity) * 100",
  };
}

export function calculateROIC(nopat: number, investedCapital: number): CalcResult {
  if (typeof nopat !== "number" || typeof investedCapital !== "number") {
    return { ok: false, error: "nopat and investedCapital are required." };
  }
  if (investedCapital === 0) return { ok: false, error: "investedCapital cannot be 0." };
  return {
    ok: true,
    metric: "roic",
    inputs: { nopat, investedCapital },
    result: round2((nopat / investedCapital) * 100),
    unit: "percent",
    formula: "(nopat / investedCapital) * 100",
  };
}
