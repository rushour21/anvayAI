import type { Cell, SheetColumn, SheetContent } from "@/types/artifact";

/* Incremental edits to a sheet.

   The agent never resends a whole sheet. It sends operations, and they are
   applied here. That difference is the whole point:

   - A full rewrite silently loses every cell the model didn't bother to
     re-emit, and flattens formulas on rows it never touched. An analyst
     watching their comp sheet lose a column because the model got lazy will
     not use the product twice.
   - Operations touch only what they name. Everything else is byte-identical,
     including formulas and per-cell sources.
   - Each operation yields a human-readable change line, which becomes the
     version summary — so "what changed" is answerable without diffing JSON.

   Application is ATOMIC. Every operation is validated against the current
   sheet before any is applied; one bad operation rejects the whole patch.
   A half-applied edit to a financial model is worse than a rejected one. */

/** Addresses a row either by position or, preferably, by matching a value in
    a key column — models miscount indices, but "the row where Metric is
    Revenue" survives rows being inserted above it. */
export type RowRef = { index: number } | { column: string; equals: string };

export type SheetOp =
  | { op: "set_cell"; row: RowRef; column: string; cell: Partial<Cell> }
  | { op: "add_column"; key: string; label: string; after?: string; cells?: Array<Partial<Cell>> }
  | { op: "add_row"; cells: Record<string, Partial<Cell>>; at?: number }
  | { op: "delete_row"; row: RowRef }
  | { op: "delete_column"; key: string }
  | { op: "rename_column"; key: string; label: string }
  | { op: "set_notes"; notes: string[] };

export interface ApplyResult {
  ok: boolean;
  content: SheetContent;
  /** One line per applied operation; empty when the patch was rejected. */
  changes: string[];
  errors: string[];
}

/* Defensive by design: these operations originate from a language model, so
   a "RowRef" at runtime may be undefined or the wrong shape regardless of
   what the type says. Return -1 (no match) instead of throwing — a crash
   here surfaces to the user as an opaque server error. */
function findRow(content: SheetContent, ref: RowRef | undefined): number {
  if (!ref || typeof ref !== "object") return -1;
  if ("index" in ref && typeof ref.index === "number") return ref.index;
  if (!("column" in ref) || typeof ref.column !== "string" || ref.equals === undefined) return -1;
  const wanted = String(ref.equals).trim();
  return content.rows.findIndex((row) => {
    const cell = row[ref.column];
    return cell !== undefined && String(cell.value ?? "").trim() === wanted;
  });
}

function describeRow(content: SheetContent, index: number): string {
  const first = content.columns[0];
  const label = first ? content.rows[index]?.[first.key]?.value : null;
  return label ? String(label) : `row ${index + 1}`;
}

/* Names the row labels that actually exist. A bare "no matching row" sends
   the model into blind retries; listing the real values lets it fix the
   operation on the next attempt. */
function rowHint(content: SheetContent): string {
  const key = content.columns[0]?.key;
  if (!key) return "";
  const labels = content.rows
    .map((row) => row[key]?.value)
    .filter((v) => v !== null && v !== undefined)
    .map((v) => `"${String(v)}"`);
  return `Address rows as { "column": "${key}", "equals": ... }. Available: ${labels.join(", ")}.`;
}

function clone(content: SheetContent): SheetContent {
  return {
    columns: content.columns.map((c) => ({ ...c })),
    rows: content.rows.map((row) =>
      Object.fromEntries(Object.entries(row).map(([k, cell]) => [k, { ...cell }]))
    ),
    ...(content.notes ? { notes: [...content.notes] } : {}),
  };
}

/** Validates every operation against the CURRENT sheet. Operations that add a
    column or row make later operations valid, so additions are tracked as the
    check walks the list. */
function validate(content: SheetContent, ops: SheetOp[]): string[] {
  const errors: string[] = [];
  const columnKeys = new Set(content.columns.map((c) => c.key));
  let rowCount = content.rows.length;

  ops.forEach((operation, i) => {
    const at = `operation ${i + 1} (${operation.op})`;
    switch (operation.op) {
      case "set_cell": {
        if (!columnKeys.has(operation.column)) {
          errors.push(`${at}: no column "${operation.column}".`);
        }
        const index = findRow(content, operation.row);
        if (index < 0 || index >= rowCount) {
          errors.push(`${at}: no matching row. ${rowHint(content)}`);
        }
        break;
      }
      case "add_column":
        if (columnKeys.has(operation.key)) errors.push(`${at}: column "${operation.key}" already exists.`);
        else columnKeys.add(operation.key);
        if (operation.after && !columnKeys.has(operation.after)) {
          errors.push(`${at}: no column "${operation.after}" to insert after.`);
        }
        if (operation.cells && operation.cells.length !== rowCount) {
          errors.push(`${at}: ${operation.cells.length} cells for ${rowCount} rows.`);
        }
        break;
      case "add_row": {
        if (!operation.cells || typeof operation.cells !== "object") {
          errors.push(`${at}: needs a "cells" object mapping column keys to cell values.`);
          break;
        }
        const unknown = Object.keys(operation.cells).filter((k) => !columnKeys.has(k));
        if (unknown.length) {
          errors.push(
            `${at}: unknown column(s) ${unknown.join(", ")}. Valid keys: ${[...columnKeys].join(", ")}.`
          );
        }
        rowCount += 1;
        break;
      }
      case "delete_row": {
        const index = findRow(content, operation.row);
        if (index < 0 || index >= rowCount) errors.push(`${at}: no matching row. ${rowHint(content)}`);
        else rowCount -= 1;
        break;
      }
      case "delete_column":
        if (!columnKeys.has(operation.key)) errors.push(`${at}: no column "${operation.key}".`);
        else columnKeys.delete(operation.key);
        break;
      case "rename_column":
        if (!columnKeys.has(operation.key)) errors.push(`${at}: no column "${operation.key}".`);
        break;
      case "set_notes":
        break;
      default:
        errors.push(`${at}: unrecognised operation.`);
    }
  });

  return errors;
}

export function applySheetOps(content: SheetContent, ops: SheetOp[]): ApplyResult {
  if (ops.length === 0) {
    return { ok: false, content, changes: [], errors: ["No operations supplied."] };
  }

  const errors = validate(content, ops);
  if (errors.length > 0) {
    // Atomic: reject everything, change nothing.
    return { ok: false, content, changes: [], errors };
  }

  const next = clone(content);
  const changes: string[] = [];

  for (const operation of ops) {
    switch (operation.op) {
      case "set_cell": {
        const index = findRow(next, operation.row);
        const existing = next.rows[index][operation.column];
        const before = existing?.value ?? "(empty)";
        /* Merged, not replaced: setting a value must not silently drop the
           cell's source or number format. */
        next.rows[index][operation.column] = { ...existing, ...operation.cell } as Cell;
        const after = next.rows[index][operation.column].value;
        changes.push(
          `${describeRow(next, index)} · ${operation.column}: ${before} → ${after}`
        );
        break;
      }
      case "add_column": {
        const column: SheetColumn = { key: operation.key, label: operation.label };
        const at = operation.after
          ? next.columns.findIndex((c) => c.key === operation.after) + 1
          : next.columns.length;
        next.columns.splice(at, 0, column);
        next.rows.forEach((row, i) => {
          row[operation.key] = { value: null, ...(operation.cells?.[i] ?? {}) } as Cell;
        });
        changes.push(`Added column "${operation.label}"`);
        break;
      }
      case "add_row": {
        const row: Record<string, Cell> = {};
        for (const column of next.columns) {
          row[column.key] = { value: null, ...(operation.cells?.[column.key] ?? {}) } as Cell;
        }
        const at = operation.at ?? next.rows.length;
        next.rows.splice(at, 0, row);
        changes.push(`Added row "${describeRow(next, at)}"`);
        break;
      }
      case "delete_row": {
        const index = findRow(next, operation.row);
        const label = describeRow(next, index);
        next.rows.splice(index, 1);
        changes.push(`Removed row "${label}"`);
        break;
      }
      case "delete_column": {
        const column = next.columns.find((c) => c.key === operation.key);
        next.columns = next.columns.filter((c) => c.key !== operation.key);
        next.rows.forEach((row) => delete row[operation.key]);
        changes.push(`Removed column "${column?.label ?? operation.key}"`);
        break;
      }
      case "rename_column": {
        const column = next.columns.find((c) => c.key === operation.key)!;
        changes.push(`Renamed column "${column.label}" to "${operation.label}"`);
        /* Only the label changes — the key is what cells are stored under, so
           renaming the key would orphan every value in the column. */
        column.label = operation.label;
        break;
      }
      case "set_notes":
        next.notes = operation.notes;
        changes.push("Updated notes");
        break;
    }
  }

  return { ok: true, content: next, changes, errors: [] };
}
