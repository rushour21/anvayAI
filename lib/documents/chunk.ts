/* Pure, page-preserving chunking (AGENTS.md Phase 6 §6.3) — every chunk
   keeps its page reference, required for citations. */
export interface Chunk {
  page: number;
  chunkIndex: number;
  text: string;
}

const TARGET_CHUNK_CHARS = 3000; // ~500-800 tokens
const OVERLAP_CHARS = 300;

export function chunkPages(pages: Array<{ pageNumber: number; markdown: string }>): Chunk[] {
  const chunks: Chunk[] = [];
  let globalIndex = 0;
  for (const page of pages) {
    const text = page.markdown.trim();
    if (!text) continue;
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + TARGET_CHUNK_CHARS, text.length);
      chunks.push({ page: page.pageNumber, chunkIndex: globalIndex++, text: text.slice(start, end) });
      if (end === text.length) break;
      start = end - OVERLAP_CHARS;
    }
  }
  return chunks;
}
