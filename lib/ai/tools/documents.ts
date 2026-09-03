import { z } from "zod";
import { tool } from "@openrouter/sdk/lib/tool.js";
import { eq, and, inArray, asc } from "drizzle-orm";
import { db } from "@/db";
import { documents as documentsTable, documentChunks } from "@/db/schema";
import { embedTexts } from "@/lib/documents/providers/embeddings";
import { searchChunks } from "@/lib/documents/providers/vectorstore";
import { chooseScope, resolveDocumentScope, type DocumentScope } from "@/lib/documents/scope";

/* Bound to the real conversationId server-side (never an LLM-supplied
   argument) — the model can search documents but can never pass a
   different conversation's ID and read someone else's files. Created
   fresh per agent run in lib/ai/agent.ts, not registered as a static tool
   in lib/ai/tools/index.ts like the rest.

   `attachedDocumentIds` are the ready documents attached to the message
   being answered right now. They are the default search scope: when a user
   uploads a second PDF and asks about it, an unscoped conversation-wide
   search will happily return chunks from the first PDF and answer about the
   wrong file. Older documents stay reachable through scope: "all", for
   genuine follow-ups ("compare this with the report I sent earlier"). */
export function createDocumentTools(
  conversationId: string,
  attachedDocumentIds: string[] = [],
  projectId: string | null = null
) {
  const hasAttached = attachedDocumentIds.length > 0;
  const hasProject = projectId !== null;

  const searchDocumentsTool = tool({
    name: "search_documents",
    description:
      "Searches the documents the user uploaded to THIS conversation for passages relevant " +
      "to a query. Input: { query, scope? }. " +
      (hasAttached
        ? 'scope defaults to "attached" — the document(s) the user attached to the message ' +
          "you are answering right now, which is what they mean by \"this document\", " +
          '"the pdf", or "summarize this". Widen the scope ONLY when the user explicitly ' +
          "refers to something uploaded earlier, or asks you to compare across documents. "
        : hasProject
          ? 'scope defaults to "project" — every document in this research project, ' +
            "including ones uploaded in other conversations about the same companies. "
          : 'scope defaults to "conversation" — every document uploaded to this ' +
            "conversation. ") +
      (hasProject
        ? 'Available scopes: "attached", "project" (everything in this research project), ' +
          '"conversation" (this conversation only). '
        : 'Available scopes: "attached", "conversation". This conversation is not in a ' +
          "project, so \"project\" behaves the same as \"conversation\". ") +
      "Returns up to 5 results, each { documentId, filename, page, text }. Cite results as " +
      "'Filename, Page N' — never invent a page number. If nothing relevant is found, say " +
      "so instead of guessing.",
    inputSchema: z.object({
      query: z.string().describe("What to search for in the uploaded documents"),
      scope: z
        .enum(["attached", "project", "conversation"])
        .optional()
        .describe(
          '"attached" searches only the document(s) attached to the current message; ' +
            '"project" searches every document in this research project; "conversation" ' +
            "searches this conversation only. Omit it to use the sensible default."
        ),
    }),
    execute: async ({ query, scope }) => {
      try {
        /* Narrowest meaningful scope wins by default, so a vague question can
           never drift onto an older upload by accident. Resolution happens in
           Postgres and feeds Qdrant's documentId filter — no vector-side
           project field, index, or backfill needed. */
        const effectiveScope = chooseScope({
          hasAttached,
          hasProject,
          requested: scope as DocumentScope | undefined,
        });
        const documentIds = await resolveDocumentScope(
          conversationId,
          effectiveScope,
          attachedDocumentIds
        );
        if (documentIds.length === 0) {
          return {
            ok: false as const,
            error: "No documents are ready to search yet in this scope.",
          };
        }
        const [vector] = await embedTexts([query]);
        const results = await searchChunks(vector, conversationId, 5, documentIds);
        if (results.length === 0) {
          return {
            ok: false as const,
            error:
              effectiveScope === "attached"
                ? "Nothing relevant found in the document(s) attached to this message. Do not " +
                  "answer from a different document — say the attached document doesn't cover it."
                : "No uploaded documents found relevant to this query.",
          };
        }
        const docIds = [...new Set(results.map((r) => r.payload.documentId))];
        const docs = await db.query.documents.findMany({ where: inArray(documentsTable.id, docIds) });
        const filenameById = new Map(docs.map((d) => [d.id, d.filename]));
        return {
          ok: true as const,
          scope: effectiveScope,
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

  /* Lets the model resolve "the pdf" when several exist, and see that a
     document is still processing rather than assuming it isn't there. */
  const listDocumentsTool = tool({
    name: "list_documents",
    description:
      "Lists the documents available here: { filename, status, pageCount, " +
      "attachedToCurrentMessage }. " +
      (hasProject
        ? "Covers every document in this research project, including ones uploaded in " +
          "other conversations. "
        : "Covers every document uploaded to this conversation. ") +
      "Use it when the user refers to a document ambiguously and more than one exists, " +
      "or to check whether a document is ready to search. A document whose status is not " +
      "'ready' cannot be searched yet.",
    inputSchema: z.object({}),
    execute: async () => {
      try {
        const docs = await db.query.documents.findMany({
          where: projectId
            ? eq(documentsTable.projectId, projectId)
            : eq(documentsTable.conversationId, conversationId),
          orderBy: asc(documentsTable.createdAt),
        });
        return {
          ok: true as const,
          documents: docs.map((d) => ({
            documentId: d.id,
            filename: d.filename,
            status: d.status,
            pageCount: d.pageCount,
            attachedToCurrentMessage: attachedDocumentIds.includes(d.id),
          })),
        };
      } catch (err) {
        return { ok: false as const, error: err instanceof Error ? err.message : "Failed to list documents." };
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
        /* Ownership check stays server-side. Inside a project the readable set
           is the project's documents; otherwise it is this conversation's. */
        const doc = await db.query.documents.findFirst({
          where: projectId
            ? and(eq(documentsTable.id, documentId), eq(documentsTable.projectId, projectId))
            : and(eq(documentsTable.id, documentId), eq(documentsTable.conversationId, conversationId)),
        });
        if (!doc) return { ok: false as const, error: "Document not found here." };
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

  return [searchDocumentsTool, listDocumentsTool, getDocumentPageTool] as const;
}
