import { describe, it, expect } from "vitest";
import { parseSheetOps } from "../op-schema";
import { applySheetOps } from "../ops";
import type { SheetContent } from "@/types/artifact";

const sheet = (): SheetContent => ({
  columns: [
    { key: "metric", label: "Metric" },
    { key: "nvda_fy25", label: "NVDA FY2025" },
  ],
  rows: [{ metric: { value: "Revenue (USD)" }, nvda_fy25: { value: 130497 } }],
});

/* These are the exact payloads that crashed in production, taken from the
   tool_calls log. They must now be either accepted or rejected cleanly —
   never throw. */
describe("parseSheetOps — payloads that previously crashed", () => {
  it("accepts `where` as an alias for `row`", () => {
    const parsed = parseSheetOps([
      { op: "delete_row", where: { column: "metric", equals: "Revenue (USD)" } },
    ]);
    expect(parsed.ok).toBe(true);
    expect(parsed.ops[0]).toEqual({
      op: "delete_row",
      row: { column: "metric", equals: "Revenue (USD)" },
    });
  });

  it("accepts `value` as an alias for `cell`, wrapping a bare scalar", () => {
    const parsed = parseSheetOps([
      { op: "set_cell", where: { column: "metric", equals: "Revenue (USD)" }, column: "nvda_fy25", value: 5 },
    ]);
    expect(parsed.ok).toBe(true);
    expect(parsed.ops[0]).toMatchObject({ column: "nvda_fy25", cell: { value: 5 } });
  });

  it("passes a full patch through `value` unchanged", () => {
    const parsed = parseSheetOps([
      {
        op: "set_cell",
        where: { column: "metric", equals: "Revenue (USD)" },
        column: "nvda_fy25",
        value: { value: 215938000000, format: "currency" },
      },
    ]);
    expect(parsed.ops[0]).toMatchObject({ cell: { value: 215938000000, format: "currency" } });
  });

  it("rejects add_row with no cells instead of throwing", () => {
    const parsed = parseSheetOps([{ op: "add_row", key: "x", column: "metric", value: "y" }]);
    expect(parsed.ok).toBe(false);
    expect(parsed.errors[0]).toMatch(/operation 1/);
  });

  it("rejects a non-array and an empty array", () => {
    expect(parseSheetOps({}).ok).toBe(false);
    expect(parseSheetOps([]).errors[0]).toMatch(/empty/);
  });

  it("names the offending operation so the model can correct it", () => {
    const parsed = parseSheetOps([
      { op: "set_cell", row: { column: "metric", equals: "Revenue (USD)" }, column: "nvda_fy25", cell: { value: 1 } },
      { op: "not_a_real_op" },
    ]);
    expect(parsed.ok).toBe(false);
    expect(parsed.errors[0]).toMatch(/operation 2/);
  });
});

describe("applySheetOps — never throws on malformed input", () => {
  it("returns an error for a missing row ref rather than crashing", () => {
    const result = applySheetOps(sheet(), [
      { op: "delete_row" } as never,
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/no matching row/);
  });

  it("lists the row labels that do exist, so the model can retry correctly", () => {
    const result = applySheetOps(sheet(), [
      { op: "delete_row", row: { column: "metric", equals: "Nope" } },
    ]);
    expect(result.errors[0]).toContain('"Revenue (USD)"');
  });

  it("survives add_row with undefined cells", () => {
    const result = applySheetOps(sheet(), [{ op: "add_row" } as never]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/needs a "cells" object/);
  });
});
