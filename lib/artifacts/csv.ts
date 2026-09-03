import { isSheetContent, type ArtifactContent } from "@/types/artifact";

/* RFC 4180 quoting: wrap in quotes when the field contains a quote, comma or
   newline, and double any embedded quotes. */
function escapeCsv(value: string): string {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

export function artifactToCsv(content: ArtifactContent): string {
  if (!isSheetContent(content)) {
    /* A note has no columns — emit heading/body pairs so the export is still
       useful rather than failing. */
    const lines = [["Section", "Body"].join(",")];
    for (const section of content.sections) {
      lines.push([escapeCsv(section.heading), escapeCsv(section.body)].join(","));
    }
    return lines.join("\n");
  }

  const hasAnySource = content.rows.some((row) =>
    content.columns.some((col) => row[col.key]?.source)
  );

  const header = content.columns.map((c) => escapeCsv(c.label));
  if (hasAnySource) header.push("Source");
  const lines = [header.join(",")];

  for (const row of content.rows) {
    const cells = content.columns.map((col) => {
      const cell = row[col.key];
      if (!cell) return "";
      /* CSV has no formulas — emit the computed value, which is what the
         formula last evaluated to. */
      return escapeCsv(cell.value === null || cell.value === undefined ? "" : String(cell.value));
    });
    if (hasAnySource) {
      const rowSource = content.columns
        .map((col) => row[col.key]?.source?.label)
        .find((label): label is string => Boolean(label));
      cells.push(escapeCsv(rowSource ?? ""));
    }
    lines.push(cells.join(","));
  }

  return lines.join("\n");
}
