import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db";
import { documents as documentsTable, documentChunks } from "@/db/schema";
import { embedTexts } from "@/lib/documents/providers/embeddings";
import { searchChunks } from "@/lib/documents/providers/vectorstore";

/* Bound to the real conversationId server-side (never an LLM-supplied
   argument) — the model can search documents but can never pass a
   different conversation's ID and read someone else's files. Created
   fresh per agent run in lib/ai/agent.ts, not registered as a static tool
   in lib/ai/tools/index.ts like the rest. */
export function createDocumentTools(conversationId: string) {
  const searchDocumentsTool = tool({
    name: "search_documents",
    description:
      "Searches the documents the user has uploaded to THIS conversation for passages " +
      "relevant to a query. Input: { query }. Returns up to 5 results, each " +
      "{ documentId, filename, page, text }. Cite results as 'Filename, Page N' — never " +
      "invent a page number. If nothing relevant is found (or nothing has been uploaded), " +
      "say so instead of guessing.",
    inputSchema: z.object({ query: z.string().describe("What to search for in the uploaded documents") }),
    execute: async ({ query }) => {
      try {
        const [vector] = await embedTexts([query]);
        const results = await searchChunks(vector, conversationId, 5);
        if (results.length === 0) {
          return { ok: false as const, error: "No uploaded documents found relevant to this query." };
        }
        const docIds = [...new Set(results.map((r) => r.payload.documentId))];
        const docs = await db.query.documents.findMany({ where: inArray(documentsTable.id, docIds) });
        const filenameById = new Map(docs.map((d) => [d.id, d.filename]));
        return {
          ok: true as const,
          results: results.map((r) => ({
            documentId: r.payload.documentId,
            filename: filenameById.get(r.payload.documentId) ?? "document",
            page: r.payload.page,
            text: r.payload.text,
          })),
        };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Document search failed." };
      }
    },
  });

  const getDocumentPageTool = tool({
    name: "get_document_page",
    description:
      "Retrieves the full text of a specific page from a document already uploaded to " +
      "THIS conversation. Input: { documentId, page }. Use this after search_documents to " +
      "quote something precisely.",
    inputSchema: z.object({
      documentId: z.string().describe("The document ID, from a prior search_documents result"),
      page: z.number().describe("The page number to retrieve"),
    }),
    execute: async ({ documentId, page }) => {
      try {
        const doc = await db.query.documents.findFirst({
          where: and(eq(documentsTable.id, documentId), eq(documentsTable.conversationId, conversationId)),
        });
        if (!doc) return { ok: false as const, error: "Document not found in this conversation." };
        const chunks = await db.query.documentChunks.findMany({
          where: and(eq(documentChunks.documentId, documentId), eq(documentChunks.page, page)),
        });
        if (chunks.length === 0) return { ok: false as const, error: `No content found for page ${page}.` };
        return {
          ok: true as const,
          documentId,
          filename: doc.filename,
          page,
          text: chunks
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map((c) => c.text)
            .join("\n\n"),
        };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Failed to retrieve document page." };
      }
    },
  });

  return [searchDocumentsTool, getDocumentPageTool] as const;
}
