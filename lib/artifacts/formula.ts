import type { SheetContent } from "@/types/artifact";

/* Symbolic cell references.

   A model cannot reliably know where a cell lands in the finished grid, and
   when it guesses it produces formulas like C5/B3 — an operating income
   divided by a DIFFERENT year's revenue. That looks plausible and is wrong,
   which is the worst failure mode for an analyst's sheet. It also breaks the
   moment a row or column is inserted above.

   So formulas address cells the way the sheet itself does — by row label and
   column key — and the real A1 address is computed here at export time:

     [[Operating income (USD)|nvda_fy25]] / [[Revenue (USD)|nvda_fy25]]
       ->  C5/C3

   Anything already written as a plain A1 formula is passed through untouched,
   so hand-written and generated formulas can coexist. */

const TOKEN = /\[\[([^\]|]+)\|([^\]|]+)\]\]/g;

/** 0 -> A, 25 -> Z, 26 -> AA */
export function columnLetter(index: number): string {
  let result = "";
  let n = index;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export interface ResolvedFormula {
  formula: string;
  /** Tokens that pointed at a row or column that doesn't exist. */
  unresolved: string[];
}

/** Rewrites symbolic tokens into A1 references against this sheet's actual
    layout. Row 1 is the header, so data row i sits at spreadsheet row i + 2. */
export function resolveFormula(formula: string, content: SheetContent): ResolvedFormula {
  const unresolved: string[] = [];
  const rowKey = content.columns[0]?.key;

  const resolved = formula.replace(TOKEN, (match, rawRow: string, rawColumn: string) => {
    const wantedRow = rawRow.trim();
    const wantedColumn = rawColumn.trim();

    const columnIndex = content.columns.findIndex((c) => c.key === wantedColumn);
    if (columnIndex < 0) {
      unresolved.push(match);
      return match;
    }

    const rowIndex = rowKey
      ? content.rows.findIndex(
          (row) => String(row[rowKey]?.value ?? "").trim() === wantedRow
        )
      : -1;
    if (rowIndex < 0) {
      unresolved.push(match);
      return match;
    }

    return `${columnLetter(columnIndex)}${rowIndex + 2}`;
  });

  return { formula: resolved, unresolved };
}

/** True when a formula uses symbolic tokens (and so must be resolved before
    it reaches Excel). */
export function hasSymbolicRefs(formula: string): boolean {
  TOKEN.lastIndex = 0;
  return TOKEN.test(formula);
}
