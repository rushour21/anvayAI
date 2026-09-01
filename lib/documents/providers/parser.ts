/* LlamaParse REST API — async job: upload file -> start parse job -> poll for
   markdown result with page_number preserved per page (needed for
   citations, AGENTS.md Phase 6 §6.3/§6.5). */
const LLAMA_BASE = "https://api.cloud.llamaindex.ai";

function getApiKey(): string {
  const key = process.env.LLAMA_CLOUD_API_KEY;
  if (!key) throw new Error("LLAMA_CLOUD_API_KEY is not set — check .env");
  return key;
}

export type ParsedPage = { pageNumber: number; markdown: string };

async function uploadFile(file: Buffer, filename: string): Promise<string> {
  const form = new FormData();
  form.append("purpose", "parse");
  form.append("file", new Blob([new Uint8Array(file)]), filename);
  const res = await fetch(`${LLAMA_BASE}/api/v1/beta/files`, {
    method: "POST",
    headers: { Accept: "application/json", Authorization: `Bearer ${getApiKey()}` },
    body: form,
  });
  if (!res.ok) throw new Error(`LlamaParse file upload failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}

async function startParseJob(fileId: string): Promise<string> {
  const res = await fetch(`${LLAMA_BASE}/api/v2/parse`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    // tier/version are required — confirmed live (422 without them).
    // "cost_effective" balances quality (still real layout/table parsing,
    // unlike naive extraction) against cost for financial-filing PDFs.
    body: JSON.stringify({ file_id: fileId, tier: "cost_effective", version: "latest" }),
  });
  if (!res.ok) throw new Error(`LlamaParse job start failed (${res.status}): ${await res.text()}`);
  const data = (await res.json()) as { id: string };
  return data.id;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 45; // ~90s

async function pollForResult(jobId: string): Promise<ParsedPage[]> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const res = await fetch(`${LLAMA_BASE}/api/v2/parse/${jobId}?expand=markdown`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${getApiKey()}` },
    });
    if (!res.ok) throw new Error(`LlamaParse poll failed (${res.status}): ${await res.text()}`);
    const data = (await res.json()) as {
      job: { status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" };
      markdown?: { pages: Array<{ page_number: number; markdown: string }> };
    };
    if (data.job.status === "COMPLETED") {
      if (!data.markdown) throw new Error("LlamaParse completed but returned no markdown");
      return data.markdown.pages.map((p) => ({ pageNumber: p.page_number, markdown: p.markdown }));
    }
    if (data.job.status === "FAILED" || data.job.status === "CANCELLED") {
      throw new Error(`LlamaParse job ${data.job.status.toLowerCase()}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error("LlamaParse job timed out waiting for completion");
}

export async function parseDocument(file: Buffer, filename: string): Promise<ParsedPage[]> {
  const fileId = await uploadFile(file, filename);
  const jobId = await startParseJob(fileId);
  return pollForResult(jobId);
}
