import { describe, it, expect } from "vitest";
import {
  calculatePercentageChange,
  calculateYoYGrowth,
  calculateCAGR,
  calculateGrossMargin,
  calculateOperatingMargin,
  calculateNetMargin,
  calculateROE,
  calculateROIC,
  calculatePE,
  calculatePB,
  calculateEVToEBITDA,
} from "../index";

describe("calculatePercentageChange", () => {
  it("computes a normal increase", () => {
    const r = calculatePercentageChange(100, 150);
    expect(r).toMatchObject({ ok: true, result: 50, unit: "percent" });
  });

  it("computes a normal decrease", () => {
    const r = calculatePercentageChange(200, 150);
    expect(r).toMatchObject({ ok: true, result: -25 });
  });

  it("rejects a zero denominator", () => {
    const r = calculatePercentageChange(0, 100);
    expect(r.ok).toBe(false);
  });

  it("rejects missing values", () => {
    // @ts-expect-error deliberately omitting a required arg
    const r = calculatePercentageChange(100, undefined);
    expect(r.ok).toBe(false);
  });

  it("handles negative values", () => {
    const r = calculatePercentageChange(-100, -50);
    expect(r).toMatchObject({ ok: true, result: 50 });
  });
});

describe("calculateYoYGrowth", () => {
  it("computes normal growth", () => {
    const r = calculateYoYGrowth(365817, 394328);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result).toBeCloseTo(7.79, 1);
  });

  it("rejects a zero denominator", () => {
    expect(calculateYoYGrowth(0, 100).ok).toBe(false);
  });
});

describe("calculateCAGR", () => {
  it("matches the textbook example (100 -> 150 over 3 years)", () => {
    const r = calculateCAGR(100, 150, 3);
    expect(r).toMatchObject({ ok: true, result: 14.47 });
  });

  it("rejects a negative starting value", () => {
    expect(calculateCAGR(-100, 150, 3).ok).toBe(false);
  });

  it("rejects zero or negative years", () => {
    expect(calculateCAGR(100, 150, 0).ok).toBe(false);
    expect(calculateCAGR(100, 150, -1).ok).toBe(false);
  });

  it("rejects a zero or negative endValue", () => {
    expect(calculateCAGR(100, 0, 3).ok).toBe(false);
    expect(calculateCAGR(100, -50, 3).ok).toBe(false);
  });

  it("rejects missing years", () => {
    // @ts-expect-error deliberately omitting a required arg
    const r = calculateCAGR(100, 150, undefined);
    expect(r.ok).toBe(false);
  });
});

describe("calculateGrossMargin", () => {
  it("computes a normal margin", () => {
    const r = calculateGrossMargin(1000, 400);
    expect(r).toMatchObject({ ok: true, result: 40 });
  });

  it("rejects zero revenue", () => {
    expect(calculateGrossMargin(0, 400).ok).toBe(false);
  });

  it("handles a negative gross profit (loss)", () => {
    const r = calculateGrossMargin(1000, -50);
    expect(r).toMatchObject({ ok: true, result: -5 });
  });
});

describe("calculateOperatingMargin", () => {
  it("computes a normal margin", () => {
    expect(calculateOperatingMargin(1000, 200)).toMatchObject({ ok: true, result: 20 });
  });

  it("rejects zero revenue", () => {
    expect(calculateOperatingMargin(0, 200).ok).toBe(false);
  });
});

describe("calculateNetMargin", () => {
  it("computes a normal margin", () => {
    expect(calculateNetMargin(1000, 100)).toMatchObject({ ok: true, result: 10 });
  });

  it("rejects zero revenue", () => {
    expect(calculateNetMargin(0, 100).ok).toBe(false);
  });

  it("handles a net loss", () => {
    const r = calculateNetMargin(513983, -2722);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.result).toBeLessThan(0);
  });
});

describe("calculateROE", () => {
  it("computes a normal ROE", () => {
    expect(calculateROE(100, 500)).toMatchObject({ ok: true, result: 20 });
  });

  it("rejects zero shareholder equity", () => {
    expect(calculateROE(100, 0).ok).toBe(false);
  });
});

describe("calculateROIC", () => {
  it("computes a normal ROIC", () => {
    expect(calculateROIC(80, 400)).toMatchObject({ ok: true, result: 20 });
  });

  it("rejects zero invested capital", () => {
    expect(calculateROIC(80, 0).ok).toBe(false);
  });

  it("rejects missing nopat", () => {
    // @ts-expect-error deliberately omitting a required arg
    const r = calculateROIC(undefined, 400);
    expect(r.ok).toBe(false);
  });
});

describe("calculatePE", () => {
  it("computes a normal P/E", () => {
    expect(calculatePE(200, 10)).toMatchObject({ ok: true, result: 20, unit: "ratio" });
  });

  it("rejects zero eps", () => {
    expect(calculatePE(200, 0).ok).toBe(false);
  });
});

describe("calculatePB", () => {
  it("computes a normal P/B", () => {
    expect(calculatePB(50, 25)).toMatchObject({ ok: true, result: 2 });
  });

  it("rejects zero book value per share", () => {
    expect(calculatePB(50, 0).ok).toBe(false);
  });
});

describe("calculateEVToEBITDA", () => {
  it("computes a normal EV/EBITDA", () => {
    expect(calculateEVToEBITDA(1000, 100)).toMatchObject({ ok: true, result: 10 });
  });

  it("rejects zero ebitda", () => {
    expect(calculateEVToEBITDA(1000, 0).ok).toBe(false);
  });
});
