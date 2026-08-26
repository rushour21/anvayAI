# Anvay — Implementation Plan

**Last updated:** 26 August 2026
**Status:** Phase 0 complete (frontend design system, per original `ROADMAP.md`).
Phase 1 not started under this plan.

This plan replaces the phase sequencing in `ROADMAP.md` with the financial-copilot
direction from `PRD.md` and `MVP.md`. It keeps Phase 0's completed frontend work and
the streaming-architecture pattern from the original plan, and changes: auth (email/
password, not Google-first), the AI stack (OpenRouter only, no direct provider SDKs),
the vector store (Qdrant, not pgvector), and adds the financial-data and investigation
phases that are the actual product.

---

## Locked decisions (current)

| Decision | Choice | Why |
|---|---|---|
| Scope | Real product with users | Auth, persistence, and cost accounting belong in v1 |
| Orchestration | All TypeScript, inside Next.js route handlers | One repo, one deploy; orchestrator stays behind one interface |
| Relational + auth store | Supabase (Postgres) | Managed, includes auth and storage |
| Vector store | Qdrant | Dedicated vector DB; decoupled from the relational store |
| Graph DB | **None** | Not needed until relationship queries (board members, supply chains) become core — Postgres handles the MVP's relational needs |
| Model access | OpenRouter only | One key, one bill, cross-vendor fallback — no direct provider SDKs |
| Auth | Email + password | No Google OAuth — see `PRD.md` §9 |
| Pricing | Individual subscription first | Enterprise tier only after 50+ paying individuals validate the product |
| v1–v3 agents | None initially | Phase 8 (Investigation) introduces the first structured multi-step workflow; not framed as "agents" until it needs to be |

---

## Architecture in one page

### The streaming contract
Kept from the original plan — this is infrastructure, not product, and doesn't change
with the financial pivot.

```ts
type StreamEvent =
  | { type: "trace";  step: string; status: "pending" | "running" | "done" | "error" }
  | { type: "token";  delta: string }
  | { type: "source"; source: Source }
  | { type: "table";  table: TableBlock }
  | { type: "chart";  chart: ChartBlock }
  | { type: "usage";  inTok: number; outTok: number }
  | { type: "done";   messageId: string }
  | { type: "error";  code: string; recoverable: boolean }
```

`table` and `chart` event types are new relative to the original plan — Anvay's answers
are not prose-only (`PRD.md` §7).

### The run/event log
Unchanged rationale: a run can take 30–90s, serverless functions time out inside that,
and users close tabs mid-run.

```
POST /api/chat/[chatId]/messages   → write message + run row, enqueue, return runId
        ↓
    worker executes the pipeline, appending each StreamEvent to run_events
        ↓
GET  /api/runs/[runId]/stream      → replay from Last-Event-ID, then tail
```

### Data model (high level — full schema is a Phase 1/6 deliverable, not fixed here)
```
users · sessions                          (Supabase Auth, email/password)
chats → messages → message_sources
runs → run_events(seq, type, payload)
documents → chunks(→ Qdrant embedding)
companies → financial_metrics(company_id, fiscal_year, metric_name, value, source)
research_memory(user_id, company_id, summary, saved_sources, last_updated)
usage_ledger                              (per-run cost, enforced pre-enqueue)
```

---

## Phase 0 — Foundation & design system ✅ complete
Carried over from the original `ROADMAP.md`: design tokens, typography, landing page,
chat workspace UI, auth screens (UI only). No changes needed here — the pivot is about
what the product *does*, not how the shell looks.

---

## Phase 1 — Identity & persistence

**Goal:** sign up with email/password, create a chat, refresh, and it's still there.

### Stage 1.1 — Supabase project & local dev
- Provision Supabase project (Postgres + Auth + Storage)
- `.env.example` with every key the app will read
- **Deliverable:** local dev connects to a working Supabase instance

### Stage 1.2 — ORM & migrations
- Drizzle + `drizzle-kit` against the Supabase Postgres connection string
- **Deliverable:** migrations run forward and back

### Stage 1.3 — Auth (email + password, no Google)
- Supabase Auth email/password flow, or Auth.js credentials provider against the same
  Postgres — pick one and commit (open question, see below)
- Email verification on signup
- Password reset flow
- Route protection middleware on `/chat/*`
- **Deliverable:** a stranger can sign up with email, verify, sign in, and stay signed
  in across a restart

### Stage 1.4 — Individual accounts (no team tier yet)
- `users` table with one personal workspace implicitly scoped per user — **do not**
  build multi-tenant workspace/membership tables yet; that's Phase 2 material for the
  Beyond-v3 tier and premature complexity now (see `PRD.md` §9 on why individual-first)
- **Deliverable:** two accounts cannot see each other's data

### Stage 1.5 — Chats & messages
- `chats`, `messages` tables; CRUD route handlers
- `/chat/[chatId]` loads that chat; `/chat/new` creates and redirects
- Replace the seeded array in `chatStore` with server data
- **Deliverable:** history sidebar reflects the database

**Exit criteria:** sign up → verify email → create a chat → send a message (echoed, no
model yet) → hard refresh → everything persists.

**Risk:** picking Supabase Auth vs. Auth.js credentials provider affects the session
model everywhere downstream — decide before Stage 1.3, don't half-build both.

---

## Phase 2 — Model gateway (OpenRouter only)

**Goal:** call any model in the OpenRouter catalogue through one interface.

### Stage 2.1 — OpenRouter client
- Single client wrapping OpenRouter's API — **no** `@ai-sdk/anthropic`,
  `@ai-sdk/openai`, or `@ai-sdk/google` direct SDKs; this is a locked decision, not a
  placeholder (see Locked decisions table)
- **Deliverable:** one `generate()` call streams tokens from any OpenRouter model id

### Stage 2.2 — Catalogue as config
- Runtime registry: model id, context window, price per million in/out, capabilities
  (tools, vision, JSON mode)
- **Deliverable:** adding a model is a config change in `constants/models.ts`, not a
  code change

### Stage 2.3 — Cost accounting
- `usage_ledger` written on every model call
- Per-user monthly budget, checked before a run is enqueued
- **Deliverable:** spend is attributable per user, per run

**Exit criteria:** a test route completes against at least three different OpenRouter
model ids, with usage rows written for each.

**Risk:** OpenRouter itself becomes a single point of failure/latency. Acceptable
trade-off per the locked decision (one key, one bill) — revisit only if it becomes a
measured problem, not preemptively.

---

## Phase 3 — Streaming spine

**Goal:** real token streaming that survives a dropped connection.

| Stage | Work |
|---|---|
| 3.1 | `runs`, `run_events(run_id, seq, type, payload, ts)` tables |
| 3.2 | Implement the `StreamEvent` union as the single serialization format |
| 3.3 | Producer: `POST /api/chat/[chatId]/messages` → persist, enqueue, return `runId` |
| 3.4 | Consumer: `GET /api/runs/[runId]/stream` — SSE, replay from `Last-Event-ID`, then tail |
| 3.5 | Wire `chatStore.sendMessage` to the real API; delete all `setTimeout` theatre |

**Exit criteria:** ask a question, watch tokens stream, close the tab mid-run, reopen,
and the stream resumes and completes.

**Risk:** highest-leverage phase — every later phase is additive if this is right, and
pays a tax on every phase after if it's wrong.

---

## Phase 4 — Documents & RAG

**Goal:** upload a PDF, ask about it, get a page-cited answer. This is MVP v1 scope —
general document RAG, not yet financial-filing-specific.

| Stage | Work |
|---|---|
| 4.1 | Upload — presigned Supabase Storage URL, size/type limits |
| 4.2 | Parsing — a real parser (LlamaParse/Unstructured), not naive text extraction |
| 4.3 | Structure-aware chunking, preserving page/section anchors |
| 4.4 | Embed chunks into **Qdrant**; async ingestion job with visible status |
| 4.5 | Retrieval — Qdrant vector search, optionally hybrid with Postgres full-text |
| 4.6 | Citations in the UI, page-level |
| 4.7 | Deletion — document, chunks, and Qdrant vectors together |

**Exit criteria:** upload an 80-page PDF, ask a question, get an answer citing the
correct page.

**Risk:** parsing quality is where RAG projects die — tables and multi-column layouts
degrade badly with naive extraction. Budget real time for the parser, not a stub.

---

## Phase 5 — Memory

**Goal:** the assistant remembers relevant context across sessions. MVP v1 scope.

| Stage | Work |
|---|---|
| 5.1 | Chat summarization — compact older turns once a chat crosses a length threshold |
| 5.2 | User memory — durable preferences/context, retrieved and injected per-request |
| 5.3 | Relevant-memory retrieval — only pull memory that's relevant to the current question, not everything |

**Exit criteria:** a fact mentioned in one chat is correctly recalled in a later,
separate chat, without the user restating it.

**Note:** this is general-purpose memory. **Research memory** (per-company research
history — `PRD.md` §8) is a separate, financial-specific concept built in Phase 6+,
not here.

---

## Phase 6 — Financial data foundation

**Goal:** the app knows what a company is and can fetch its filings. MVP v2 begins
here.

| Stage | Work |
|---|---|
| 6.1 | Ticker/company resolution — name or ticker → CIK, via SEC's company-tickers mapping |
| 6.2 | SEC EDGAR client — fetch latest 10-K/10-Q/8-K for a given CIK |
| 6.3 | Filing ingestion into the Phase 4 document pipeline (parse, chunk, embed into Qdrant) |
| 6.4 | Structured metric extraction — pull ~40–50 named metrics (revenue, margins, cash flow, debt, R&D, segments) into `financial_metrics` |
| 6.5 | Extraction validation — spot-check extracted numbers against a known-correct source per test company, across a diverse sample of filing structures (not just mega-caps) |

**Exit criteria:** "NVIDIA" resolves to the correct company, its latest 10-K is
fetched and parsed, and at least 30 of the ~40–50 target metrics are extracted
correctly on a validation sample of 5 companies across different sectors.

**Risk:** SEC filing structure varies significantly across companies and industries —
this is the phase most likely to take longer than estimated. Don't let mega-cap tech
filings (which are unusually clean) set false confidence.

---

## Phase 7 — Financial analysis & comparison

**Goal:** turn extracted metrics into the calculations and comparisons analysts
actually ask for. MVP v2.

| Stage | Work |
|---|---|
| 7.1 | Derived calculations — CAGR, YoY change, margin ratios, computed from stored raw metrics |
| 7.2 | Comparison — select 2–5 companies, produce a correct side-by-side metric table |
| 7.3 | Charts — revenue/margin/growth/FCF trend charts from the same stored data |
| 7.4 | Chat integration — "analyze X" / "compare X and Y" route to this pipeline instead of a plain LLM answer |

**Exit criteria:** "Compare NVIDIA and AMD" returns a correct table (verified against
the filings) plus a written explanation of the key differences, not a hallucinated
approximation.

---

## Phase 8 — Investigation workflows

**Goal:** the actual differentiator. MVP v3 — **gated**, see `MVP.md`'s pre-build gate.

Do not start this phase until the gate (5–20 hand-graded real questions against the
Phase 6/7 pipeline) has passed.

| Stage | Work |
|---|---|
| 8.1 | Metric-change detection — given a question like "why did margin fall", identify the specific metric and period |
| 8.2 | Filing section retrieval — find the MD&A / relevant section discussing that metric, via Qdrant search scoped to the right filing |
| 8.3 | Explanation extraction — pull management's stated explanation from that section |
| 8.4 | Cross-check — compare against transcript commentary or other filings if available; flag contradictions |
| 8.5 | Citation-backed synthesis — compose the final answer with every claim traceable to a real source |

**Exit criteria:** "Why did Apple's operating margin decline?" produces a causally
correct explanation citing the specific MD&A section, passing the same bar as the
pre-build gate — now for a broader set of held-out questions.

**Risk:** this is the highest-risk phase in the entire plan. If retrieval or extraction
from Phase 4/6 is weak, this phase will produce confident-sounding wrong answers — the
worst failure mode for this audience. Do not relax the citation requirement to ship
faster.

---

## Phase 9 — Document generation

**Goal:** turn a chat's investigation/comparison into the actual deliverable an analyst
needs for their job. MVP v3.

| Stage | Work |
|---|---|
| 9.1 | Template engine — map existing output blocks (text, tables, charts, findings, risks, citations) into a document shape |
| 9.2 | Earnings note template |
| 9.3 | Flash report template (shorter, same-day) |
| 9.4 | Comp sheet template |
| 9.5 | Export — PDF and Excel |

**Exit criteria:** from a completed investigation or comparison chat, clicking
"generate earnings note" produces a formatted, exportable document with the finding,
supporting table, and citations already populated — no manual re-entry.

---

## Phase 10 — Hardening & launch

| Stage | Work |
|---|---|
| 10.1 | Rate limiting per user and per IP |
| 10.2 | Budget enforcement — soft warning, then hard stop |
| 10.3 | Error states — every `error` event maps to a real UI state |
| 10.4 | Observability — traces, latency, cost dashboards |
| 10.5 | Backups, migration rehearsal, restore drill |
| 10.6 | Security pass — CSP, secrets audit, row-level security or enforced query scoping |
| 10.7 | Legal — Privacy and Terms pages (currently link to `#`) |

**Exit criteria:** a stranger can sign up and use the product without you watching.

---

## Sequencing rationale

```
0 Foundation ─▶ 1 Identity ─▶ 2 Gateway ─▶ 3 Streaming ─▶ 4 Documents ─▶ 5 Memory
                                                                              │
        ┌─────────────────────────────────────────────────────────────────┘
        ▼
6 Financial data ─▶ 7 Analysis/Comparison ─▶ [GATE] ─▶ 8 Investigation ─▶ 9 Document gen ─▶ 10 Launch
   (MVP v2 starts)                                      (MVP v3 starts)
```

- **Documents (4) before Financial data (6)** — filing ingestion reuses the same
  parse/chunk/embed pipeline as user PDF uploads; build it once, generically, first.
- **Analysis/Comparison (7) before Investigation (8)** — investigation needs correct
  extracted metrics and a working retrieval pipeline to reason over; comparison is a
  cheaper way to validate both before betting on the harder workflow.
- **The gate between 7 and 8 is not a formality** — it's the point where the product
  either has a real moat or is a wrapper around SEC EDGAR. Treat it as a real stop.

---

## Open questions

1. **Hosting** — Vercel + Supabase managed, or self-hosted end-to-end?
2. **Queue** — Inngest, QStash, or a Postgres-backed queue for the run/event log?
3. **Auth implementation** — Supabase Auth directly, or Auth.js credentials provider
   against Supabase Postgres? Decide before Phase 1, Stage 1.3.
4. **Financial-data gap-filler API** — what covers data SEC filings don't disclose
   cleanly (consensus estimates, intraday price)? Not needed until post-v3.
5. **Earnings call transcripts** — build a dedicated parser in v2, or defer to v3/later?
   Currently deferred per `MVP.md`.
