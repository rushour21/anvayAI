import ExcelJS from "exceljs";
import { isSheetContent, type ArtifactContent, type NoteContent, type SheetContent } from "@/types/artifact";
import { resolveFormula } from "./formula";

/* Turns an artifact into a real .xlsx.

   Two rules make this different from "an assistant wrote me a spreadsheet":

   1. A cell that carries a `formula` is written AS a formula, so it
      recalculates in Excel and can be audited. Hardcoding the computed number
      instead is the "plug" that model reviews flag.
   2. Every sourced cell gets its source in an adjacent column AND as a cell
      note, so a number can be traced without leaving the workbook.  */

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF1F3F5" },
};

function numberFormatFor(format: string | undefined): string | undefined {
  switch (format) {
    case "percent":
      return "0.0%";
    case "currency":
      return '"$"#,##0.00';
    case "number":
      return "#,##0.00";
    default:
      return undefined;
  }
}

function buildSheet(workbook: ExcelJS.Workbook, title: string, content: SheetContent) {
  /* Excel rejects sheet names over 31 chars or containing : \ / ? * [ ] */
  const safeName = title.replace(/[:\\/?*[\]]/g, " ").slice(0, 31) || "Sheet1";
  const sheet = workbook.addWorksheet(safeName);

  const hasAnySource = content.rows.some((row) =>
    content.columns.some((col) => row[col.key]?.source)
  );

  const header = content.columns.map((c) => c.label);
  if (hasAnySource) header.push("Source");
  const headerRow = sheet.addRow(header);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = HEADER_FILL;
  });

  for (const row of content.rows) {
    const excelRow = sheet.addRow([]);
    content.columns.forEach((col, i) => {
      const cell = row[col.key];
      const target = excelRow.getCell(i + 1);
      if (!cell) {
        target.value = null;
        return;
      }
      if (cell.formula) {
        /* Symbolic references ([[row|column]]) become real A1 addresses here,
           against the layout actually being written. A token that can't be
           resolved would reach Excel as text and show as a broken formula, so
           the cell falls back to its literal value instead. */
        const { formula, unresolved } = resolveFormula(cell.formula, content);
        if (unresolved.length > 0) {
          target.value = cell.value;
          target.note = `Formula could not be resolved: ${unresolved.join(", ")}`;
        } else {
          /* `result` keeps the last known value visible for readers whose Excel
             hasn't recalculated yet; the formula is still the source of truth. */
          target.value = { formula, result: cell.value ?? undefined } as ExcelJS.CellFormulaValue;
        }
      } else {
        target.value = cell.value;
      }
      const fmt = numberFormatFor(cell.format);
      if (fmt) target.numFmt = fmt;
      if (cell.source) {
        target.note = cell.source.url
          ? `${cell.source.label}\n${cell.source.url}`
          : cell.source.label;
      }
    });

    if (hasAnySource) {
      /* One representative source per row in the visible column — the full
         per-cell detail is on each cell's note. */
      const rowSource = content.columns
        .map((col) => row[col.key]?.source?.label)
        .find((label): label is string => Boolean(label));
      excelRow.getCell(content.columns.length + 1).value = rowSource ?? "";
    }
  }

  sheet.columns.forEach((column) => {
    let widest = 10;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.text ?? "").length;
      if (len > widest) widest = len;
    });
    column.width = Math.min(widest + 2, 48);
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }];

  if (content.notes?.length) {
    sheet.addRow([]);
    sheet.addRow(["Notes"]).font = { bold: true };
    for (const note of content.notes) sheet.addRow([note]);
  }
}

function buildNote(workbook: ExcelJS.Workbook, title: string, content: NoteContent) {
  const sheet = workbook.addWorksheet(title.slice(0, 31) || "Note");
  sheet.getColumn(1).width = 100;
  for (const section of content.sections) {
    sheet.addRow([section.heading]).font = { bold: true };
    const body = sheet.addRow([section.body]);
    body.alignment = { wrapText: true, vertical: "top" };
    sheet.addRow([]);
  }
  if (content.sources?.length) {
    sheet.addRow(["Sources"]).font = { bold: true };
    for (const source of content.sources) {
      sheet.addRow([source.url ? `${source.label} — ${source.url}` : source.label]);
    }
  }
}

export async function artifactToXlsx(title: string, content: ArtifactContent): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Anvay";
  workbook.created = new Date();

  if (isSheetContent(content)) {
    buildSheet(workbook, title, content);
  } else {
    buildNote(workbook, title, content);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
