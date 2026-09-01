import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { QdrantClient } from "@qdrant/js-client-rest";
import { db } from "@/db";
import { userMemories } from "@/db/schema";
import { embedTexts } from "@/lib/documents/providers/embeddings";

/* Phase 8 user memory — durable facts and preferences that outlive one
   conversation. Reuses the embedding provider built for documents, but
   keeps its own Qdrant collection so memory retrieval and document
   retrieval can never bleed into each other. */

const COLLECTION = "user_memories";
const VECTOR_SIZE = 1536; // must match embeddings.ts's output_dimensionality

/* Only inject memories that are actually relevant. Below this cosine
   score the match is noise, and injecting it wastes context and risks
   steering the answer with something unrelated. */
const MIN_SCORE = 0.55;
const MAX_RECALLED = 4;

let client: QdrantClient | null = null;
function getClient(): QdrantClient {
  if (client) return client;
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  if (!url || !apiKey) throw new Error("QDRANT_URL / QDRANT_API_KEY are not set — check .env");
  client = new QdrantClient({ url, apiKey });
  return client;
}

async function ensureCollection(): Promise<void> {
  const qc = getClient();
  const { exists } = await qc.collectionExists(COLLECTION);
  if (!exists) {
    await qc.createCollection(COLLECTION, { vectors: { size: VECTOR_SIZE, distance: "Cosine" } });
    // Filtering on a payload field requires an explicit index in Qdrant —
    // without it the filtered search 400s at query time, not write time.
    await qc.createPayloadIndex(COLLECTION, { field_name: "userId", field_schema: "keyword" });
  }
}

type MemoryPayload = { userId: string; memoryId: string; content: string };

/** Stores a durable fact for a user and indexes it for later recall. */
export async function rememberFact(userId: string, content: string): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  const [memory] = await db.insert(userMemories).values({ userId, content: trimmed }).returning();

  try {
    const [vector] = await embedTexts([trimmed]);
    const pointId = randomUUID();
    await ensureCollection();
    await getClient().upsert(COLLECTION, {
      points: [{ id: pointId, vector, payload: { userId, memoryId: memory.id, content: trimmed } }],
    });
    await db.update(userMemories).set({ qdrantPointId: pointId }).where(eq(userMemories.id, memory.id));
  } catch (err) {
    // The row still exists and is reviewable; only recall is degraded.
    console.error("[memory] failed to index memory for recall:", err);
  }
}

/**
 * Returns the memories most relevant to `query` for this user — scored,
 * thresholded, and capped, never the whole memory set.
 */
export async function recallRelevant(userId: string, query: string): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  try {
    await ensureCollection();
    const [vector] = await embedTexts([trimmed]);
    const result = await getClient().query(COLLECTION, {
      query: vector,
      limit: MAX_RECALLED,
      filter: { must: [{ key: "userId", match: { value: userId } }] },
      with_payload: true,
      score_threshold: MIN_SCORE,
    });
    return result.points
      .map((p) => (p.payload as unknown as MemoryPayload | null)?.content)
      .filter((c): c is string => Boolean(c));
  } catch (err) {
    // Recall is an enhancement, never a hard dependency of answering.
    console.error("[memory] recall failed:", err);
    return [];
  }
}

/** Everything stored for a user — for a future "review your memories" UI. */
export async function listMemories(userId: string) {
  return db.query.userMemories.findMany({ where: eq(userMemories.userId, userId) });
}
