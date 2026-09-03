import type { Cell, SheetContent } from "@/types/artifact";

/* Recovers a table from an assistant answer.

   The agent is told to call create_artifact when its answer contains a table
   worth keeping, but weaker models routinely don't — the instruction competes
   with "only call the tools you need", and free models follow it poorly. That
   left the analyst looking at a table they still had to copy into Excel by
   hand, which is the exact work this product removes. So the table is also
   recovered deterministically here.

   A recovered table has no per-cell provenance: the numbers were rendered as
   text, and inventing sources for them would be worse than admitting there
   are none. Artifacts the agent creates itself DO carry sources per cell. */

const SEPARATOR = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

function splitRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return trimmed.split("|").map((c) => c.trim());
}

/** Strips the markdown emphasis the model puts inside cells. */
function clean(text: string): string {
  return text.replace(/\*\*/g, "").replace(/`/g, "").trim();
}

function inferFormat(value: string): Cell["format"] {
  if (/%$/.test(value)) return "percent";
  if (/^[-+]?\$/.test(value)) return "currency";
  if (/^[-+]?[\d,.]+$/.test(value)) return "number";
  return "text";
}

/** Extracts the first GitHub-flavoured markdown table with at least one data
    row. Returns null when the answer has no table worth saving. */
export function extractFirstTable(markdown: string): SheetContent | null {
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length - 1; i++) {
    const headerLine = lines[i];
    if (!headerLine.includes("|")) continue;
    if (!SEPARATOR.test(lines[i + 1])) continue;

    const headers = splitRow(headerLine).map(clean);
    if (headers.length < 2) continue;

    const rows: Array<Record<string, Cell>> = [];
    for (let j = i + 2; j < lines.length; j++) {
      const line = lines[j];
      if (!line.includes("|") || !line.trim()) break;
      const values = splitRow(line).map(clean);
      // A row that doesn't match the header width is malformed — stop rather
      // than silently producing a ragged sheet.
      if (values.length !== headers.length) break;

      const row: Record<string, Cell> = {};
      headers.forEach((header, index) => {
        const value = values[index];
        row[header] = { value, format: inferFormat(value) };
      });
      rows.push(row);
    }

    if (rows.length === 0) continue;

    return {
      columns: headers.map((h) => ({ key: h, label: h })),
      rows,
      notes: [
        "Recovered from the assistant's answer. Values are as displayed — " +
          "check them against the cited sources in the conversation before use.",
      ],
    };
  }

  return null;
}

/** A title for the recovered sheet: the answer's first heading, else its
    first sentence, trimmed. */
export function deriveTitle(markdown: string, fallback: string): string {
  const heading = markdown.match(/^#{1,4}\s+(.+)$/m);
  if (heading) return clean(heading[1]).slice(0, 120);

  const bold = markdown.match(/^\*\*(.+?)\*\*/m);
  if (bold) return clean(bold[1]).slice(0, 120);

  return fallback.slice(0, 120);
}
