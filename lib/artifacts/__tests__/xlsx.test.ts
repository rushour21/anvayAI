import { describe, it, expect } from "vitest";
import ExcelJS from "exceljs";
import { artifactToXlsx } from "../xlsx";
import { artifactToCsv } from "../csv";
import type { SheetContent, NoteContent } from "@/types/artifact";

const compSheet: SheetContent = {
  columns: [
    { key: "metric", label: "Metric" },
    { key: "fy24", label: "FY24" },
    { key: "fy25", label: "FY25" },
    { key: "growth", label: "Growth" },
  ],
  rows: [
    {
      metric: { value: "Revenue" },
      fy24: { value: 60922, format: "number", source: { label: "NVDA 10-K, Page 41", page: 41 } },
      fy25: { value: 130497, format: "number", source: { label: "NVDA 10-K, Page 41", page: 41 } },
      // Computed: must survive as a formula, not a baked-in number.
      growth: { value: 1.1421, formula: "C2/B2-1", format: "percent" },
    },
  ],
  notes: ["Figures in $ millions."],
};

async function loadBack(buffer: Buffer): Promise<ExcelJS.Worksheet> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as unknown as ArrayBuffer);
  const sheet = wb.worksheets[0];
  if (!sheet) throw new Error("no worksheet produced");
  return sheet;
}

describe("artifactToXlsx", () => {
  it("writes a computed cell as a real formula, not a hardcoded value", async () => {
    const sheet = await loadBack(await artifactToXlsx("NVDA Comps", compSheet));
    const cell = sheet.getCell("D2");
    expect(cell.formula).toBe("C2/B2-1");
  });

  it("writes sourced cells as plain values", async () => {
    const sheet = await loadBack(await artifactToXlsx("NVDA Comps", compSheet));
    expect(sheet.getCell("B2").value).toBe(60922);
    expect(sheet.getCell("B2").formula).toBeUndefined();
  });

  it("adds a Source column when any cell carries a source", async () => {
    const sheet = await loadBack(await artifactToXlsx("NVDA Comps", compSheet));
    expect(sheet.getCell("E1").value).toBe("Source");
    expect(sheet.getCell("E2").value).toBe("NVDA 10-K, Page 41");
  });

  it("omits the Source column entirely when nothing is sourced", async () => {
    const unsourced: SheetContent = {
      columns: [{ key: "a", label: "A" }],
      rows: [{ a: { value: 1 } }],
    };
    const sheet = await loadBack(await artifactToXlsx("Plain", unsourced));
    expect(sheet.getCell("B1").value).toBeNull();
  });

  it("sanitises sheet names Excel would reject", async () => {
    const sheet = await loadBack(await artifactToXlsx("NVDA/AMD: Q3 [draft]", compSheet));
    expect(sheet.name).not.toMatch(/[:\\/?*[\]]/);
    expect(sheet.name.length).toBeLessThanOrEqual(31);
  });

  it("renders a note artifact without columns", async () => {
    const note: NoteContent = {
      sections: [{ heading: "Thesis", body: "Margins recovering." }],
      sources: [{ label: "NVDA Q3 release" }],
    };
    const sheet = await loadBack(await artifactToXlsx("Earnings Note", note));
    expect(sheet.getCell("A1").value).toBe("Thesis");
    expect(sheet.getCell("A2").value).toBe("Margins recovering.");
  });
});

describe("artifactToCsv", () => {
  it("emits the computed value for formula cells", () => {
    const csv = artifactToCsv(compSheet);
    const [, dataRow] = csv.split("\n");
    expect(dataRow).toContain("1.1421");
  });

  it("quotes fields containing commas and escapes embedded quotes", () => {
    const tricky: SheetContent = {
      columns: [{ key: "a", label: "A" }],
      rows: [{ a: { value: 'Revenue, net of "returns"' } }],
    };
    expect(artifactToCsv(tricky)).toContain('"Revenue, net of ""returns"""');
  });

  it("includes the Source column", () => {
    expect(artifactToCsv(compSheet).split("\n")[0]).toBe("Metric,FY24,FY25,Growth,Source");
  });
});
