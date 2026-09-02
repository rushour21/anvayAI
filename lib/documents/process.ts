import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentChunks } from "@/db/schema";
import { downloadDocument } from "./providers/storage";
import { parseDocument } from "./providers/parser";
import { embedTexts } from "./providers/embeddings";
import { upsertChunks } from "./providers/vectorstore";
import { chunkPages } from "./chunk";

const EMBED_BATCH_SIZE = 50;

/* A document attached to a message is often still parsing when that message
   is sent — processing runs in after() on the upload request and takes
   seconds, while a user can attach a PDF and hit send immediately. Without
   this wait the agent sees the new document as not-ready, falls back to
   whatever was uploaded earlier in the conversation, and answers about the
   wrong PDF without ever saying so. Bounded well inside the message route's
   60s maxDuration, so a genuinely stuck document degrades into an honest
   "not ready yet" instead of hanging the request. */
export const ATTACHED_DOCUMENT_WAIT_MS = 20_000;
const POLL_INTERVAL_MS = 1000;

export async function waitForDocuments(
  documentIds: string[],
  timeoutMs: number = ATTACHED_DOCUMENT_WAIT_MS
): Promise<Array<{ id: string; filename: string; status: string }>> {
  if (documentIds.length === 0) return [];
  const deadline = Date.now() + timeoutMs;
  const load = () =>
    db.query.documents.findMany({ where: inArray(documents.id, documentIds) });

  let rows = await load();
  while (
    rows.some((r) => r.status === "uploaded" || r.status === "processing") &&
    Date.now() < deadline
  ) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    rows = await load();
  }
  return rows.map((r) => ({ id: r.id, filename: r.filename, status: r.status }));
}

export async function processDocument(documentId: string): Promise<void> {
  const doc = await db.query.documents.findFirst({ where: eq(documents.id, documentId) });
  if (!doc) throw new Error(`Document ${documentId} not found`);

  await db.update(documents).set({ status: "processing" }).where(eq(documents.id, documentId));

  try {
    const file = await downloadDocument(doc.storageKey);
    const pages = await parseDocument(file, doc.filename);
    const chunks = chunkPages(pages);

    for (let i = 0; i < chunks.length; i += EMBED_BATCH_SIZE) {
      const batch = chunks.slice(i, i + EMBED_BATCH_SIZE);
      const vectors = await embedTexts(batch.map((c) => c.text));
      const points = batch.map((c, idx) => ({
        id: randomUUID(),
        vector: vectors[idx],
        payload: {
          documentId,
          conversationId: doc.conversationId,
          page: c.page,
          chunkIndex: c.chunkIndex,
          text: c.text,
        },
      }));
      await upsertChunks(points);
      await db.insert(documentChunks).values(
        batch.map((c, idx) => ({
          documentId,
          page: c.page,
          chunkIndex: c.chunkIndex,
          text: c.text,
          qdrantPointId: points[idx].id,
        }))
      );
    }

    await db
      .update(documents)
      .set({ status: "ready", pageCount: pages.length, updatedAt: new Date() })
      .where(eq(documents.id, documentId));
  } catch (err) {
    await db
      .update(documents)
      .set({ status: "error", error: err instanceof Error ? err.message : "Processing failed", updatedAt: new Date() })
      .where(eq(documents.id, documentId));
    throw err;
  }
}
