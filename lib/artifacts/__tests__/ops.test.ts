import { describe, it, expect } from "vitest";
import { applySheetOps } from "../ops";
import type { SheetContent } from "@/types/artifact";

const sheet = (): SheetContent => ({
  columns: [
    { key: "metric", label: "Metric" },
    { key: "fy24", label: "FY24" },
    { key: "fy25", label: "FY25" },
  ],
  rows: [
    {
      metric: { value: "Revenue" },
      fy24: { value: 60922, format: "number", source: { label: "10-K p41" } },
      fy25: { value: 130497, format: "number", source: { label: "10-K p41" } },
    },
    {
      metric: { value: "Gross margin" },
      fy24: { value: 0.727, format: "percent" },
      fy25: { value: 0.75, formula: "C2/B2", format: "percent" },
    },
  ],
});

describe("applySheetOps — preservation", () => {
  it("leaves untouched cells byte-identical, including formulas and sources", () => {
    const before = sheet();
    const result = applySheetOps(before, [
      { op: "set_cell", row: { column: "metric", equals: "Revenue" }, column: "fy25", cell: { value: 130500 } },
    ]);
    expect(result.ok).toBe(true);
    // The formula on an unrelated row survives.
    expect(result.content.rows[1].fy25.formula).toBe("C2/B2");
    // The edited cell keeps its source and format — merge, not replace.
    expect(result.content.rows[0].fy25.source?.label).toBe("10-K p41");
    expect(result.content.rows[0].fy25.format).toBe("number");
  });

  it("does not mutate the input", () => {
    const before = sheet();
    applySheetOps(before, [
      { op: "set_cell", row: { index: 0 }, column: "fy24", cell: { value: 1 } },
    ]);
    expect(before.rows[0].fy24.value).toBe(60922);
  });
});

describe("applySheetOps — atomicity", () => {
  it("rejects the whole patch when any operation is invalid", () => {
    const result = applySheetOps(sheet(), [
      { op: "set_cell", row: { column: "metric", equals: "Revenue" }, column: "fy24", cell: { value: 1 } },
      { op: "set_cell", row: { column: "metric", equals: "Nonexistent" }, column: "fy24", cell: { value: 2 } },
    ]);
    expect(result.ok).toBe(false);
    expect(result.content.rows[0].fy24.value).toBe(60922);
    expect(result.errors[0]).toMatch(/no matching row/);
  });

  it("rejects an unknown column", () => {
    const result = applySheetOps(sheet(), [
      { op: "set_cell", row: { index: 0 }, column: "fy26", cell: { value: 1 } },
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/no column "fy26"/);
  });

  it("rejects an empty patch", () => {
    expect(applySheetOps(sheet(), []).ok).toBe(false);
  });
});

describe("applySheetOps — structural edits", () => {
  it("adds a period column with per-row cells", () => {
    const result = applySheetOps(sheet(), [
      {
        op: "add_column",
        key: "fy26",
        label: "FY26E",
        cells: [{ value: 180000, format: "number" }, { value: 0.76, formula: "D2/D1", format: "percent" }],
      },
    ]);
    expect(result.ok).toBe(true);
    expect(result.content.columns.map((c) => c.label)).toEqual(["Metric", "FY24", "FY25", "FY26E"]);
    expect(result.content.rows[1].fy26.formula).toBe("D2/D1");
  });

  it("inserts a column at a chosen position", () => {
    const result = applySheetOps(sheet(), [
      { op: "add_column", key: "fy23", label: "FY23", after: "metric" },
    ]);
    expect(result.content.columns.map((c) => c.key)).toEqual(["metric", "fy23", "fy24", "fy25"]);
  });

  it("rejects a column count that does not match the rows", () => {
    const result = applySheetOps(sheet(), [
      { op: "add_column", key: "x", label: "X", cells: [{ value: 1 }] },
    ]);
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/1 cells for 2 rows/);
  });

  it("adds a row, filling unlisted columns as empty", () => {
    const result = applySheetOps(sheet(), [
      { op: "add_row", cells: { metric: { value: "Operating margin" } } },
    ]);
    expect(result.content.rows).toHaveLength(3);
    expect(result.content.rows[2].fy24.value).toBeNull();
  });

  it("deletes a row matched by value", () => {
    const result = applySheetOps(sheet(), [
      { op: "delete_row", row: { column: "metric", equals: "Gross margin" } },
    ]);
    expect(result.content.rows).toHaveLength(1);
    expect(result.changes[0]).toMatch(/Removed row "Gross margin"/);
  });

  it("renames only the label, so cell values are not orphaned", () => {
    const result = applySheetOps(sheet(), [
      { op: "rename_column", key: "fy25", label: "FY2025A" },
    ]);
    expect(result.content.columns[2]).toEqual({ key: "fy25", label: "FY2025A" });
    expect(result.content.rows[0].fy25.value).toBe(130497);
  });
});

describe("applySheetOps — change log", () => {
  it("describes each edit in terms an analyst can read", () => {
    const result = applySheetOps(sheet(), [
      { op: "set_cell", row: { column: "metric", equals: "Revenue" }, column: "fy25", cell: { value: 130500 } },
    ]);
    expect(result.changes[0]).toBe("Revenue · fy25: 130497 → 130500");
  });

  it("applies several operations in order", () => {
    const result = applySheetOps(sheet(), [
      { op: "add_column", key: "fy26", label: "FY26E" },
      { op: "set_cell", row: { column: "metric", equals: "Revenue" }, column: "fy26", cell: { value: 180000 } },
    ]);
    expect(result.ok).toBe(true);
    expect(result.changes).toHaveLength(2);
    expect(result.content.rows[0].fy26.value).toBe(180000);
  });
});
