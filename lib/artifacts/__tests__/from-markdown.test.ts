import { describe, it, expect } from "vitest";
import { extractFirstTable, deriveTitle } from "../from-markdown";

const answer = `## NVIDIA's revenue growth drivers

### Facts

NVIDIA's reported annual revenue (source: Financial Modeling Prep):

| Fiscal year | Revenue | YoY growth |
|---|---|---|
| FY2023 | $26.97B | — |
| FY2024 | $60.92B | +125.85% |
| FY2025 | $130.50B | +114.20% |

Two-year CAGR: **119.95%**.`;

describe("extractFirstTable", () => {
  it("recovers columns and rows from a markdown table", () => {
    const sheet = extractFirstTable(answer)!;
    expect(sheet.columns.map((c) => c.label)).toEqual(["Fiscal year", "Revenue", "YoY growth"]);
    expect(sheet.rows).toHaveLength(3);
    expect(sheet.rows[1]["Revenue"].value).toBe("$60.92B");
  });

  it("infers a format per cell", () => {
    const sheet = extractFirstTable(answer)!;
    expect(sheet.rows[1]["YoY growth"].format).toBe("percent");
    expect(sheet.rows[1]["Revenue"].format).toBe("currency");
    expect(sheet.rows[0]["Fiscal year"].format).toBe("text");
  });

  it("attaches no sources, because a rendered table has none", () => {
    const sheet = extractFirstTable(answer)!;
    expect(sheet.rows[0]["Revenue"].source).toBeUndefined();
    expect(sheet.notes?.[0]).toMatch(/Recovered from the assistant's answer/);
  });

  it("returns null when there is no table", () => {
    expect(extractFirstTable("Just a paragraph with a | pipe in it.")).toBeNull();
  });

  it("returns null for a header with no data rows", () => {
    expect(extractFirstTable("| A | B |\n|---|---|\n")).toBeNull();
  });

  it("ignores a single-column table", () => {
    expect(extractFirstTable("| A |\n|---|\n| 1 |")).toBeNull();
  });

  it("strips bold markers inside cells", () => {
    const sheet = extractFirstTable("| A | B |\n|---|---|\n| **9%** | x |")!;
    expect(sheet.rows[0]["A"].value).toBe("9%");
  });

  it("stops at a ragged row rather than producing a ragged sheet", () => {
    const sheet = extractFirstTable("| A | B |\n|---|---|\n| 1 | 2 |\n| 3 |")!;
    expect(sheet.rows).toHaveLength(1);
  });
});

describe("deriveTitle", () => {
  it("prefers the answer's first heading", () => {
    expect(deriveTitle(answer, "fallback")).toBe("NVIDIA's revenue growth drivers");
  });

  it("falls back to the user's question when there is no heading", () => {
    expect(deriveTitle("| A | B |\n|---|---|\n| 1 | 2 |", "Compare NVDA and AMD")).toBe(
      "Compare NVDA and AMD"
    );
  });
});
