import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { resolveFormula, columnLetter } from "../formula";
import { artifactToXlsx } from "../xlsx";
import type { SheetContent } from "@/types/artifact";

const comps: SheetContent = {
  columns: [
    { key: "metric", label: "Metric" },
    { key: "nvda_fy24", label: "NVDA FY2024" },
    { key: "nvda_fy25", label: "NVDA FY2025" },
  ],
  rows: [
    { metric: { value: "Revenue (USD)" }, nvda_fy24: { value: 60922 }, nvda_fy25: { value: 130497 } },
    { metric: { value: "Gross profit (USD)" }, nvda_fy24: { value: 44300 }, nvda_fy25: { value: 97860 } },
    {
      metric: { value: "Operating income (USD)" },
      nvda_fy24: { value: 32970 },
      nvda_fy25: { value: 81450 },
    },
    {
      metric: { value: "Operating margin" },
      nvda_fy24: { value: 0.5412, formula: "[[Operating income (USD)|nvda_fy24]]/[[Revenue (USD)|nvda_fy24]]" },
      nvda_fy25: { value: 0.6242, formula: "[[Operating income (USD)|nvda_fy25]]/[[Revenue (USD)|nvda_fy25]]" },
    },
  ],
};

describe("columnLetter", () => {
  it("maps indices to spreadsheet columns", () => {
    expect(columnLetter(0)).toBe("A");
    expect(columnLetter(25)).toBe("Z");
    expect(columnLetter(26)).toBe("AA");
  });
});

describe("resolveFormula", () => {
  it("resolves a symbolic ref to the correct A1 address", () => {
    /* Operating income is data row index 2 -> sheet row 4 (row 1 is the
       header); Revenue is index 0 -> sheet row 2. nvda_fy25 is column C. */
    const { formula, unresolved } = resolveFormula(
      "[[Operating income (USD)|nvda_fy25]]/[[Revenue (USD)|nvda_fy25]]",
      comps
    );
    expect(formula).toBe("C4/C2");
    expect(unresolved).toEqual([]);
  });

  it("keeps both refs in the SAME column — the bug that produced C5/B3", () => {
    const { formula } = resolveFormula(
      "[[Operating income (USD)|nvda_fy24]]/[[Revenue (USD)|nvda_fy24]]",
      comps
    );
    expect(formula).toBe("B4/B2");
  });

  it("reports a token pointing at a row that does not exist", () => {
    const { unresolved } = resolveFormula("[[Nonexistent|nvda_fy25]]*2", comps);
    expect(unresolved).toHaveLength(1);
  });

  it("reports a token pointing at a column that does not exist", () => {
    const { unresolved } = resolveFormula("[[Revenue (USD)|nope]]*2", comps);
    expect(unresolved).toHaveLength(1);
  });

  it("leaves a plain A1 formula untouched", () => {
    expect(resolveFormula("C4/C2", comps).formula).toBe("C4/C2");
  });
});

describe("xlsx export with symbolic formulas", () => {
  async function sheetFrom(content: SheetContent) {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load((await artifactToXlsx("Comps", content)) as unknown as ArrayBuffer);
    return wb.worksheets[0];
  }

  it("writes the resolved A1 formula into the workbook", async () => {
    const sheet = await sheetFrom(comps);
    /* The Operating margin row is data index 3 -> sheet row 5, so the formula
       LIVES in C5 and REFERENCES C4 (operating income) over C2 (revenue). */
    expect(sheet.getCell("C5").formula).toBe("C4/C2");
  });

  it("falls back to the literal value when a ref cannot be resolved", async () => {
    const broken: SheetContent = {
      columns: comps.columns,
      rows: [
        { metric: { value: "Revenue (USD)" }, nvda_fy24: { value: 1 }, nvda_fy25: { value: 2 } },
        {
          metric: { value: "Margin" },
          nvda_fy24: { value: 0.5, formula: "[[Missing row|nvda_fy24]]/2" },
          nvda_fy25: { value: 0.5 },
        },
      ],
    };
    const sheet = await sheetFrom(broken);
    expect(sheet.getCell("B3").value).toBe(0.5);
    expect(sheet.getCell("B3").formula).toBeUndefined();
    expect(String(sheet.getCell("B3").note)).toMatch(/could not be resolved/);
  });
});
