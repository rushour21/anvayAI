import { describe, it, expect } from "vitest";
import { usdToMicros, microsToUsd, MONTHLY_BUDGET_MICROS, SOFT_WARN_RATIO } from "../usage";

describe("micro-dollar conversion", () => {
  it("round-trips a plain value", () => {
    expect(microsToUsd(usdToMicros(1.23))).toBeCloseTo(1.23, 6);
  });

  it("keeps sub-cent precision, which per-run model costs actually need", () => {
    // A single cheap run can cost well under a cent; rounding to cents here
    // would record it as zero and the ledger would never accumulate.
    expect(usdToMicros(0.000123)).toBe(123);
    expect(usdToMicros(0.0000005)).toBe(1);
  });

  it("rounds rather than truncating", () => {
    expect(usdToMicros(0.0000004)).toBe(0);
    expect(usdToMicros(0.0000006)).toBe(1);
  });

  it("sums without float drift, which is why micros are integers", () => {
    // 0.1 + 0.2 !== 0.3 in float; in integer micros it's exact.
    const total = usdToMicros(0.1) + usdToMicros(0.2);
    expect(total).toBe(300_000);
    expect(microsToUsd(total)).toBeCloseTo(0.3, 10);
  });

  it("handles zero, which is what BYOK runs report", () => {
    expect(usdToMicros(0)).toBe(0);
  });
});

describe("budget tiers", () => {
  it("gives pro a strictly higher ceiling than free", () => {
    expect(MONTHLY_BUDGET_MICROS.pro).toBeGreaterThan(MONTHLY_BUDGET_MICROS.free);
  });

  it("sets both ceilings above zero, so no tier is locked out by default", () => {
    expect(MONTHLY_BUDGET_MICROS.free).toBeGreaterThan(0);
    expect(MONTHLY_BUDGET_MICROS.pro).toBeGreaterThan(0);
  });

  it("warns before the ceiling, not at or past it", () => {
    expect(SOFT_WARN_RATIO).toBeGreaterThan(0);
    expect(SOFT_WARN_RATIO).toBeLessThan(1);
  });
});
