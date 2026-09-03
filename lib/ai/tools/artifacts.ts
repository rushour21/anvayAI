import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { artifacts, artifactVersions } from "@/db/schema";
import { applySheetOps } from "@/lib/artifacts/ops";
import { sheetOpSchema, parseSheetOps } from "@/lib/artifacts/op-schema";
import { isSheetContent, type Cell, type SheetContent, type NoteContent } from "@/types/artifact";

/* Lets the agent turn an answer into something the analyst keeps.

   Like createDocumentTools, the conversation and project are bound
   server-side and are never LLM-supplied — the model chooses WHAT to save,
   never WHERE it lands. */

const cellSchema = z.object({
  value: z.union([z.string(), z.number(), z.null()]),
  formula: z
    .string()
    .optional()
    .describe(
      "Formula for any cell an analyst expects to recalculate (growth, margin, median). " +
        "Reference other cells SYMBOLICALLY as [[row label|column key]] — never as A1 " +
        'refs like C5/B3. Example: "[[Operating income|nvda_fy25]]/[[Revenue|nvda_fy25]]". ' +
        "You cannot know where a cell lands in the finished grid, and a guessed A1 ref " +
        "silently divides by the wrong year. The real address is computed on export. " +
        "A computed number written as a plain value is a hardcoded plug."
    ),
  format: z.enum(["number", "percent", "currency", "text"]).optional(),
  source: z
    .object({
      label: z.string().describe('e.g. "NVDA 10-K, Page 41" or "Financial Modeling Prep"'),
      url: z.string().optional(),
      page: z.number().optional(),
      documentId: z.string().optional(),
      tool: z.string().optional(),
    })
    .optional(),
});

export function createArtifactTools(
  conversationId: string,
  projectId: string | null,
  userId: string
) {
  const createArtifactTool = tool({
    name: "create_artifact",
    description:
      "Saves a result the analyst will keep and reuse — a comparison/comp sheet, a metric " +
      "table, an earnings or flash note — into their project, where it can be exported to " +
      "Excel and refreshed later. Call this IN ADDITION to answering in chat whenever your " +
      "answer contains a table of figures the analyst would otherwise copy into Excel, or " +
      "a written note they would send on. Attach a `source` to EVERY numeric cell, and use " +
      "`formula` for any cell that is computed from other cells rather than read from a " +
      "source. Do not call it for a single fact, a definition, or a one-off calculation.",
    inputSchema: z.object({
      kind: z.enum(["sheet", "note"]),
      title: z.string().describe('Short and specific, e.g. "NVDA vs AMD — Margin Comps"'),
      columns: z
        .array(z.object({ key: z.string(), label: z.string() }))
        .optional()
        .describe("Required for kind 'sheet'. Column order is preserved."),
      rows: z
        .array(z.record(z.string(), cellSchema))
        .optional()
        .describe("Required for kind 'sheet'. Each row maps a column key to a cell."),
      notes: z.array(z.string()).optional().describe("Caveats or normalizations applied."),
      sections: z
        .array(z.object({ heading: z.string(), body: z.string() }))
        .optional()
        .describe("Required for kind 'note'. Body is markdown."),
      tickers: z.array(z.string()).optional().describe("Companies this covers, for refresh."),
      periods: z.array(z.string()).optional().describe("Periods covered, for refresh."),
    }),
    execute: async ({ kind, title, columns, rows, notes, sections, tickers, periods }) => {
      try {
        if (kind === "sheet" && (!columns?.length || !rows?.length)) {
          return { ok: false as const, error: "A sheet artifact needs both columns and rows." };
        }
        if (kind === "note" && !sections?.length) {
          return { ok: false as const, error: "A note artifact needs at least one section." };
        }

        const content: SheetContent | NoteContent =
          kind === "sheet"
            ? {
                columns: columns!,
                rows: rows! as Array<Record<string, Cell>>,
                ...(notes?.length ? { notes } : {}),
              }
            : { sections: sections! };

        const [created] = await db
          .insert(artifacts)
          .values({
            userId,
            projectId,
            conversationId,
            kind,
            title: title.slice(0, 120),
            /* The recipe, so this can be rebuilt next quarter rather than
               retyped — the property a one-shot file export doesn't have. */
            spec: { tickers: tickers ?? [], periods: periods ?? [] },
          })
          .returning();

        await db.insert(artifactVersions).values({
          artifactId: created.id,
          version: 1,
          content,
          author: "agent",
          summary: "Created from conversation",
        });

        return {
          ok: true as const,
          artifactId: created.id,
          title: created.title,
          kind: created.kind,
          savedToProject: projectId !== null,
          message:
            "Saved to the workspace panel. Mention to the user that it's saved and can be " +
            "exported to Excel — do not repeat the whole table again in your answer.",
        };
      } catch (err) {
        return {
          ok: false as const,
          error: err instanceof Error ? err.message : "Failed to create artifact.",
        };
      }
    },
  });

  /* Without this the agent has no idea a sheet already exists and starts a new
     one every answer — the analyst ends up with five near-identical comp
     sheets instead of one they've been building on. */
  const listArtifactsTool = tool({
    name: "list_artifacts",
    description:
      "Lists the saved sheets and notes available here, newest first: " +
      "{ artifactId, kind, title, columns, rowCount }. Call this BEFORE " +
      "create_artifact whenever the user's request could plausibly relate to something " +
      "already saved — 'add Intel to that', 'update it', 'now do FY26'. If a relevant " +
      "sheet exists, call update_artifact instead of creating a second one.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const rows = await db.query.artifacts.findMany({
          where: projectId
            ? eq(artifacts.projectId, projectId)
            : eq(artifacts.conversationId, conversationId),
          orderBy: desc(artifacts.updatedAt),
          limit: 20,
        });
        const summaries = await Promise.all(
          rows.map(async (a) => {
            const version = await db.query.artifactVersions.findFirst({
              where: and(
                eq(artifactVersions.artifactId, a.id),
                eq(artifactVersions.version, a.currentVersion)
              ),
            });
            const content = version?.content as SheetContent | NoteContent | undefined;
            const sheet = content && isSheetContent(content) ? content : null;
            return {
              artifactId: a.id,
              kind: a.kind,
              title: a.title,
              version: a.currentVersion,
              columns: sheet?.columns.map((c) => ({ key: c.key, label: c.label })) ?? null,
              rowCount: sheet?.rows.length ?? null,
            };
          })
        );
        return { ok: true as const, artifacts: summaries };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Failed to list." };
      }
    },
  });

  const readArtifactTool = tool({
    name: "read_artifact",
    description:
      "Returns a saved sheet's full current contents — every column, and every row with " +
      "its values, formulas and sources. Call this before update_artifact so your edits " +
      "target real rows and columns, and so you don't overwrite a figure that is already " +
      "correct.",
    inputSchema: z.object({ artifactId: z.string() }),
    execute: async ({ artifactId }) => {
      try {
        const artifact = await db.query.artifacts.findFirst({
          where: and(eq(artifacts.id, artifactId), eq(artifacts.userId, userId)),
        });
        if (!artifact) return { ok: false as const, error: "Artifact not found." };
        const version = await db.query.artifactVersions.findFirst({
          where: and(
            eq(artifactVersions.artifactId, artifactId),
            eq(artifactVersions.version, artifact.currentVersion)
          ),
        });
        return {
          ok: true as const,
          artifactId,
          title: artifact.title,
          kind: artifact.kind,
          version: artifact.currentVersion,
          content: version?.content ?? null,
        };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Failed to read." };
      }
    },
  });

  const updateArtifactTool = tool({
    name: "update_artifact",
    description:
      "Edits an existing sheet IN PLACE by sending only what changes — never the whole " +
      "sheet. This is how you add a company, add a period, correct a figure, or extend a " +
      "model without disturbing anything else. Operations: " +
      "set_cell (change one value; the cell keeps its existing source and format unless " +
      "you pass new ones), add_column (a new period or company), add_row (a new metric), " +
      "delete_row, delete_column, rename_column, set_notes. " +
      "Address rows by { column, equals } matching a value — e.g. the row where 'metric' " +
      "equals 'Revenue' — not by index, which shifts as rows are added. " +
      "All operations apply together or none do: if any is invalid the sheet is left " +
      "untouched and you get the errors back to correct and retry. " +
      "Always call read_artifact first so you know the real column keys.",
    inputSchema: z.object({
      artifactId: z.string(),
      /* A real discriminated union, not a free-form record: the JSON schema
         the model receives now spells out each operation's exact shape.
         Without it the model guessed key names ("where" for "row", "value"
         for "cell") and every call failed. */
      operations: z
        .array(sheetOpSchema)
        .describe(
          'Operations to apply. Examples: ' +
            '{"op":"set_cell","row":{"column":"metric","equals":"Revenue"},' +
            '"column":"nvda_fy26","cell":{"value":215938000000,"format":"currency",' +
            '"source":{"label":"FMP income statement"}}} · ' +
            '{"op":"add_column","key":"nvda_fy26","label":"NVDA FY2026"} · ' +
            '{"op":"add_row","cells":{"metric":{"value":"Operating margin"}}} · ' +
            '{"op":"delete_row","row":{"column":"metric","equals":"Operating income (USD)"}}'
        ),
      summary: z.string().optional().describe("One line on what this edit does."),
    }),
    execute: async ({ artifactId, operations, summary }) => {
      try {
        const artifact = await db.query.artifacts.findFirst({
          where: and(eq(artifacts.id, artifactId), eq(artifacts.userId, userId)),
        });
        if (!artifact) return { ok: false as const, error: "Artifact not found." };

        const current = await db.query.artifactVersions.findFirst({
          where: and(
            eq(artifactVersions.artifactId, artifactId),
            eq(artifactVersions.version, artifact.currentVersion)
          ),
        });
        const content = current?.content as SheetContent | NoteContent | undefined;
        if (!content || !isSheetContent(content)) {
          return { ok: false as const, error: "Only sheet artifacts can be edited this way." };
        }

        /* Re-parsed at runtime even though the SDK validated against the
           schema: providers vary in how strictly they enforce it, and this
           layer also normalises the aliases a model reaches for. */
        const parsed = parseSheetOps(operations);
        if (!parsed.ok) {
          return {
            ok: false as const,
            error: "Some operations were malformed — nothing was changed.",
            problems: parsed.errors,
            hint:
              'Each operation is an object with an "op" field. Address rows as ' +
              '{"column": "<first column key>", "equals": "<row label>"} under the key ' +
              '"row", and put cell contents under "cell".',
          };
        }

        const result = applySheetOps(content, parsed.ops);
        if (!result.ok) {
          /* Handed back rather than swallowed: the model can correct the
             operations and retry, and the sheet is unchanged meanwhile. */
          return {
            ok: false as const,
            error: "No changes applied — every operation must be valid.",
            problems: result.errors,
          };
        }

        const nextVersion = artifact.currentVersion + 1;
        await db.insert(artifactVersions).values({
          artifactId,
          version: nextVersion,
          content: result.content,
          author: "agent",
          summary: summary?.slice(0, 200) ?? result.changes.join("; ").slice(0, 200),
        });
        await db
          .update(artifacts)
          .set({ currentVersion: nextVersion, updatedAt: new Date() })
          .where(eq(artifacts.id, artifactId));

        return {
          ok: true as const,
          artifactId,
          version: nextVersion,
          changes: result.changes,
          message:
            "Sheet updated in place. Tell the user what changed and what it means — " +
            "do not just say it was saved.",
        };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Update failed." };
      }
    },
  });

  return [createArtifactTool, listArtifactsTool, readArtifactTool, updateArtifactTool] as const;
}
