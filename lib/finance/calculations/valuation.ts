import { CalcResult, round2 } from "./types";

export function calculatePE(price: number, eps: number): CalcResult {
  if (typeof price !== "number" || typeof eps !== "number") {
    return { ok: false, error: "price and eps are required." };
  }
  if (eps === 0) return { ok: false, error: "eps cannot be 0." };
  return {
    ok: true,
    metric: "pe",
    inputs: { price, eps },
    result: round2(price / eps),
    unit: "ratio",
    formula: "price / eps",
  };
}

export function calculatePB(price: number, bookValuePerShare: number): CalcResult {
  if (typeof price !== "number" || typeof bookValuePerShare !== "number") {
    return { ok: false, error: "price and bookValuePerShare are required." };
  }
  if (bookValuePerShare === 0) return { ok: false, error: "bookValuePerShare cannot be 0." };
  return {
    ok: true,
    metric: "pb",
    inputs: { price, bookValuePerShare },
    result: round2(price / bookValuePerShare),
    unit: "ratio",
    formula: "price / bookValuePerShare",
  };
}

export function calculateEVToEBITDA(enterpriseValue: number, ebitda: number): CalcResult {
  if (typeof enterpriseValue !== "number" || typeof ebitda !== "number") {
    return { ok: false, error: "enterpriseValue and ebitda are required." };
  }
  if (ebitda === 0) return { ok: false, error: "ebitda cannot be 0." };
  return {
    ok: true,
    metric: "ev_ebitda",
    inputs: { enterpriseValue, ebitda },
    result: round2(enterpriseValue / ebitda),
    unit: "ratio",
    formula: "enterpriseValue / ebitda",
  };
}
