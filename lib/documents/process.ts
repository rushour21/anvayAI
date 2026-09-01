import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { documents, documentChunks } from "@/db/schema";
import { downloadDocument } from "./providers/storage";
import { parseDocument } from "./providers/parser";
import { embedTexts } from "./providers/embeddings";
import { upsertChunks } from "./providers/vectorstore";
import { chunkPages } from "./chunk";

const EMBED_BATCH_SIZE = 50;

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
