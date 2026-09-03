"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import type { Cell, SheetContent } from "@/types/artifact";

function formatValue(cell: Cell): string {
  if (cell.value === null || cell.value === undefined) return "";
  if (typeof cell.value === "number") {
    if (cell.format === "percent") return `${(cell.value * 100).toFixed(1)}%`;
    if (cell.format === "currency") return `$${cell.value.toLocaleString()}`;
    return cell.value.toLocaleString();
  }
  return String(cell.value);
}

/* Clicking a cell reveals where its number came from. This is the difference
   between a table and a defensible one — an analyst who can't trace a figure
   has to re-verify it by hand, which is the work being removed. */
export default function SheetTable({ content }: { content: SheetContent }) {
  const [openCell, setOpenCell] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr>
              {content.columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left font-medium px-2.5 py-2 whitespace-nowrap"
                  style={{
                    color: "var(--ink-600)",
                    borderBottom: "1px solid var(--line)",
                    background: "var(--paper-sunk)",
                  }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {content.columns.map((col) => {
                  const cell = row[col.key];
                  const cellId = `${rowIndex}:${col.key}`;
                  const hasSource = Boolean(cell?.source);
                  return (
                    <td
                      key={col.key}
                      onClick={() => hasSource && setOpenCell(openCell === cellId ? null : cellId)}
                      className="px-2.5 py-1.5 align-top relative"
                      style={{
                        borderBottom: "1px solid var(--line)",
                        color: "var(--ink-700)",
                        cursor: hasSource ? "pointer" : "default",
                        whiteSpace: "nowrap",
                      }}
                      title={cell?.formula ? `= ${cell.formula}` : undefined}
                    >
                      <span className="inline-flex items-center gap-1">
                        {cell ? formatValue(cell) : ""}
                        {cell?.formula && (
                          <span
                            className="text-[9px] font-medium px-1 rounded"
                            style={{ background: "var(--paper-sunk)", color: "var(--ink-400)" }}
                            title={`= ${cell.formula}`}
                          >
                            fx
                          </span>
                        )}
                        {hasSource && (
                          <Icon name="document" size={9} style={{ color: "var(--ink-300)" }} />
                        )}
                      </span>

                      {openCell === cellId && cell?.source && (
                        <div
                          className="absolute z-20 left-2 top-full mt-1 rounded-lg p-2.5 text-[11px] shadow-lg"
                          style={{
                            background: "var(--surface)",
                            border: "1px solid var(--line)",
                            minWidth: 200,
                            maxWidth: 280,
                            whiteSpace: "normal",
                          }}
                        >
                          <p className="font-medium" style={{ color: "var(--ink-700)" }}>
                            {cell.source.label}
                          </p>
                          {cell.source.url && (
                            <a
                              href={cell.source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 block truncate"
                              style={{ color: "var(--blue-500)" }}
                            >
                              {cell.source.url}
                            </a>
                          )}
                          {cell.formula && (
                            <p className="mt-1.5 font-mono" style={{ color: "var(--ink-400)" }}>
                              = {cell.formula}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {content.notes && content.notes.length > 0 && (
        <div className="px-1">
          {content.notes.map((note, i) => (
            <p key={i} className="text-[11px]" style={{ color: "var(--ink-400)" }}>
              {note}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
