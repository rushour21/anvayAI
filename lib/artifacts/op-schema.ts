import { z } from "zod";

/* Runtime validation for sheet operations.

   The operations come from a language model, so the TypeScript types in
   ops.ts describe an intention, not a guarantee. Without a real schema the
   model has nothing to follow: it reached for `where` instead of `row` and
   `value` instead of `cell`, and the malformed operation reached the applier
   and crashed on undefined. Two fixes here:

   1. A discriminated union, so the JSON schema handed to the model spells out
      each operation's exact shape.
   2. Alias normalisation, because `where`/`value` are perfectly reasonable
      names and rejecting them just burns a retry. Be liberal in what we
      accept; the applier stays strict about what it does. */

const cellPatchSchema = z.object({
  value: z.union([z.string(), z.number(), z.null()]).optional(),
  formula: z.string().optional(),
  format: z.enum(["number", "percent", "currency", "text"]).optional(),
  source: z
    .object({
      label: z.string(),
      url: z.string().optional(),
      page: z.number().optional(),
      documentId: z.string().optional(),
      tool: z.string().optional(),
    })
    .optional(),
});

const rowRefSchema = z.union([
  z.object({ column: z.string(), equals: z.string() }),
  z.object({ index: z.number().int().min(0) }),
]);

export const sheetOpSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("set_cell"),
    row: rowRefSchema,
    column: z.string(),
    cell: cellPatchSchema,
  }),
  z.object({
    op: z.literal("add_column"),
    key: z.string(),
    label: z.string(),
    after: z.string().optional(),
    cells: z.array(cellPatchSchema).optional(),
  }),
  z.object({
    op: z.literal("add_row"),
    cells: z.record(z.string(), cellPatchSchema),
    at: z.number().int().min(0).optional(),
  }),
  z.object({ op: z.literal("delete_row"), row: rowRefSchema }),
  z.object({ op: z.literal("delete_column"), key: z.string() }),
  z.object({ op: z.literal("rename_column"), key: z.string(), label: z.string() }),
  z.object({ op: z.literal("set_notes"), notes: z.array(z.string()) }),
]);

type RawOp = Record<string, unknown>;

/** Maps the names a model naturally reaches for onto the canonical ones. */
function normalise(raw: RawOp): RawOp {
  const op = { ...raw };

  // `where` is a natural name for a row matcher.
  if (op.where !== undefined && op.row === undefined) {
    op.row = op.where;
    delete op.where;
  }

  // set_cell: `value` used for the cell patch. Distinguish a bare scalar
  // ("value": 5) from a full patch ("value": { value: 5, format: ... }).
  if (op.op === "set_cell" && op.cell === undefined && op.value !== undefined) {
    const v = op.value;
    op.cell = v !== null && typeof v === "object" && !Array.isArray(v) ? v : { value: v };
    delete op.value;
  }

  // A row matcher written flat: { column: "metric", equals: "Revenue" }
  // alongside the target column is ambiguous, but only when `row` is absent.
  if (op.op === "delete_row" && op.row === undefined && typeof op.column === "string" && op.equals !== undefined) {
    op.row = { column: op.column, equals: op.equals };
    delete op.column;
    delete op.equals;
  }

  return op;
}

export interface ParsedOps {
  ok: boolean;
  ops: z.infer<typeof sheetOpSchema>[];
  errors: string[];
}

/** Parses raw model output into operations, reporting per-operation errors
    the model can act on rather than throwing. */
export function parseSheetOps(raw: unknown): ParsedOps {
  if (!Array.isArray(raw)) {
    return { ok: false, ops: [], errors: ["`operations` must be an array."] };
  }
  if (raw.length === 0) {
    return { ok: false, ops: [], errors: ["`operations` was empty — nothing to do."] };
  }

  const ops: z.infer<typeof sheetOpSchema>[] = [];
  const errors: string[] = [];

  raw.forEach((entry, i) => {
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) {
      errors.push(`operation ${i + 1}: must be an object.`);
      return;
    }
    const parsed = sheetOpSchema.safeParse(normalise(entry as RawOp));
    if (parsed.success) {
      ops.push(parsed.data);
      return;
    }
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    errors.push(`operation ${i + 1}: ${detail}`);
  });

  return { ok: errors.length === 0, ops, errors };
}
