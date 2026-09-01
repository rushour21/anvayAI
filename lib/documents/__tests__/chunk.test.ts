import { describe, it, expect } from "vitest";
import { chunkPages } from "../chunk";

describe("chunkPages", () => {
  it("produces one chunk for a short page", () => {
    const chunks = chunkPages([{ pageNumber: 1, markdown: "Hello world." }]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].page).toBe(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].text).toBe("Hello world.");
  });

  it("splits a long page into multiple chunks, all tagged with that page", () => {
    const longText = "x".repeat(7000);
    const chunks = chunkPages([{ pageNumber: 5, markdown: longText }]);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) expect(c.page).toBe(5);
    expect(chunks.map((c) => c.chunkIndex)).toEqual(chunks.map((_, i) => i));
  });

  it("overlaps consecutive chunks by roughly OVERLAP_CHARS", () => {
    const longText = "x".repeat(7000);
    const chunks = chunkPages([{ pageNumber: 1, markdown: longText }]);
    const firstLen = chunks[0].text.length;
    const secondLen = chunks[1].text.length;
    expect(firstLen).toBe(3000);
    expect(secondLen).toBeGreaterThan(0);
    expect(chunks.length * 3000 - (chunks.length - 1) * 300).toBeGreaterThanOrEqual(longText.length);
  });

  it("produces zero chunks for an empty or whitespace-only page", () => {
    expect(chunkPages([{ pageNumber: 1, markdown: "   \n\t  " }])).toHaveLength(0);
    expect(chunkPages([{ pageNumber: 1, markdown: "" }])).toHaveLength(0);
  });

  it("keeps each chunk's page number correct across multiple pages", () => {
    const chunks = chunkPages([
      { pageNumber: 1, markdown: "page one text" },
      { pageNumber: 2, markdown: "page two text" },
      { pageNumber: 3, markdown: "page three text" },
    ]);
    expect(chunks).toHaveLength(3);
    expect(chunks[0].page).toBe(1);
    expect(chunks[1].page).toBe(2);
    expect(chunks[2].page).toBe(3);
    expect(chunks.map((c) => c.chunkIndex)).toEqual([0, 1, 2]);
  });

  it("skips an empty page in the middle without breaking page numbering", () => {
    const chunks = chunkPages([
      { pageNumber: 1, markdown: "real content" },
      { pageNumber: 2, markdown: "   " },
      { pageNumber: 3, markdown: "more content" },
    ]);
    expect(chunks).toHaveLength(2);
    expect(chunks[0].page).toBe(1);
    expect(chunks[1].page).toBe(3);
  });
});
