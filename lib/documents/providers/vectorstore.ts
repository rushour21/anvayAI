/* Qdrant vector store for document chunk embeddings (AGENTS.md Phase 6
   §6.2/§6.4). Uses .query() rather than the deprecated .search() — the
   installed @qdrant/js-client-rest version's QdrantClient has no .search()
   method (checked its actual .d.ts before writing this, not assumed). */
import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION = "document_chunks";
const VECTOR_SIZE = 1536; // text-embedding-3-small

let client: QdrantClient | null = null;
function getClient(): QdrantClient {
  if (client) return client;
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;
  if (!url || !apiKey) throw new Error("QDRANT_URL / QDRANT_API_KEY are not set — check .env");
  client = new QdrantClient({ url, apiKey });
  return client;
}

export async function ensureCollection(): Promise<void> {
  const qc = getClient();
  const { exists } = await qc.collectionExists(COLLECTION);
  if (!exists) {
    await qc.createCollection(COLLECTION, { vectors: { size: VECTOR_SIZE, distance: "Cosine" } });
    // Qdrant requires an explicit payload index on any field used in a
    // filter — confirmed live: searchChunks's conversationId filter 400s
    // ("Index required but not found") without this.
    await qc.createPayloadIndex(COLLECTION, { field_name: "conversationId", field_schema: "keyword" });
    await qc.createPayloadIndex(COLLECTION, { field_name: "documentId", field_schema: "keyword" });
  }
}

export type ChunkPayload = {
  documentId: string;
  conversationId: string;
  page: number;
  chunkIndex: number;
  text: string;
};

export async function upsertChunks(
  points: Array<{ id: string; vector: number[]; payload: ChunkPayload }>
): Promise<void> {
  await ensureCollection();
  await getClient().upsert(COLLECTION, { points });
}

export async function searchChunks(
  vector: number[],
  conversationId: string,
  limit = 5,
  /* Restricts the search to specific documents. Without this the top-k is a
     free-for-all across every document ever uploaded, so a question about a
     just-attached PDF gets answered from an older, longer one that happened
     to score higher — silently, and about the wrong file.

     When these ids are given they REPLACE the conversation filter rather than
     narrowing it: a project-scoped search deliberately reaches documents
     uploaded in sibling conversations, which an AND on conversationId would
     exclude. Safe because the ids are always resolved server-side from an
     ownership-checked Postgres query (lib/documents/scope.ts) and are never
     supplied by the model. `documentId` already has a payload index (see
     ensureCollection), which Qdrant requires for any filtered field. */
  documentIds?: string[]
): Promise<Array<{ score: number; payload: ChunkPayload }>> {
  await ensureCollection();
  const must: Array<Record<string, unknown>> =
    documentIds && documentIds.length > 0
      ? [{ key: "documentId", match: { any: documentIds } }]
      : [{ key: "conversationId", match: { value: conversationId } }];
  const result = await getClient().query(COLLECTION, {
    query: vector,
    limit,
    filter: { must },
    with_payload: true,
  });
  return result.points.map((r) => ({ score: r.score, payload: r.payload as unknown as ChunkPayload }));
}

export async function deleteDocumentVectors(documentId: string): Promise<void> {
  const qc = getClient();
  const { exists } = await qc.collectionExists(COLLECTION);
  if (!exists) return;
  await qc.delete(COLLECTION, { filter: { must: [{ key: "documentId", match: { value: documentId } }] } });
}
