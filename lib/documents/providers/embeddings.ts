/* Gemini embeddings, called directly — free of charge on Google AI
   Studio's free tier (no billing/credit card required), unlike OpenAI's
   embeddings endpoint which this originally used before the account ran
   out of credit. output_dimensionality must match vectorstore.ts's
   VECTOR_SIZE exactly. */
const EMBEDDING_MODEL = "gemini-embedding-2";
const OUTPUT_DIMENSIONALITY = 1536;

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set — check .env");
  return key;
}

async function embedOne(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": getApiKey() },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        output_dimensionality: OUTPUT_DIMENSIONALITY,
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini embeddings request failed (${res.status}): ${await res.text()}`);
  // Confirmed live: this single-content embedContent endpoint returns
  // { embedding: { values } } — singular, not the plural { embeddings: [...] }
  // shape docs described (that's batchEmbedContents' response shape).
  const data = (await res.json()) as { embedding: { values: number[] } };
  return data.embedding.values;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  // embedContent takes one text at a time (no documented batch endpoint for
  // this model) — sequential to keep it simple, batch size is already
  // capped small by process.ts's EMBED_BATCH_SIZE.
  const results: number[][] = [];
  for (const text of texts) results.push(await embedOne(text));
  return results;
}
