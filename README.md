
# Anvay — Build Plan

**Updated:** 21 August 2026
**Status:** Part 0 complete. Nothing else started.

Companion docs: [`DATA-MODEL.md`](./DATA-MODEL.md) (tables),
[`CONTEXT-AND-MEMORY.md`](./CONTEXT-AND-MEMORY.md) (prompt assembly, memory).

---

## What we're building

A single-user research assistant in the shape of Perplexity: **chat, documents,
web search, cited answers.** No image generation.

Two levels of organisation: **chats** (one conversation, with a context ceiling)
and **projects** (a folder of related chats plus shared documents and standing
instructions).

**No teams, no workspaces.** Content is owned by a `user_id`.

### Decisions locked

| | |
|---|---|
| Orchestration | All TypeScript, inside Next.js route handlers |
| Database | Postgres + pgvector, Docker locally |
| Auth | Auth.js v5, Google first |
| Models | OpenAI, Gemini, DeepSeek, one free open-weight |
| Model access | **OpenRouter only** — one key, one bill, no direct provider SDKs |
| Streaming | Resumable, backed by an append-only event log |
| Memory | Short-term via compaction; long-term deferred to Part 10 |

---

## The parts

Twelve parts for v1, five deferred. Each is independently demoable and
each mostly depends only on the ones before it.

```
 0 ▸ Foundation          ✅ done
 1 ▸ Infrastructure      docker, drizzle, migrations
 2 ▸ Identity            google sign-in
 3 ▸ Conversation store  projects, chats, messages
 4 ▸ Run engine          streaming that survives a dropped connection
 5 ▸ Model gateway       four providers behind one interface
 6 ▸ Context assembly    caching, compaction, the new-chat nudge
 7 ▸ Web search          the core loop closes
 8 ▸ Grounding           citations and honest uncertainty
 9 ▸ Documents & RAG     upload, ask, cited by page
10 ▸ Memory              across chats
11 ▸ Cost & limits       quotas, rate limiting
12 ▸ Production          observability, backups, legal
```

---

### Part 0 — Foundation ✅

Next.js 16, Tailwind v4, design system, landing page, chat UI, auth screens,
light/dark. All runtime behaviour is still mocked in `stores/chatStore.ts`.

---

### Part 1 — Infrastructure

**Delivers:** `docker compose up` gives a working database; migrations run
forward and back.

- `pgvector/pgvector:pg17`, named volume, healthcheck
- Extensions: `vector`, `pg_trgm`, `unaccent`, `citext`
- Drizzle + `drizzle-kit`, pooled client that survives hot reload
- `.env.example` listing every key the app will ever read

**Risk:** low. **Blocks:** everything.

---

### Part 2 — Identity

**Delivers:** sign in with Google; session survives a restart; `/chat/*` is
protected.

- Google Cloud OAuth client — **the one step only you can do**
- Auth.js v5 with the Drizzle adapter
- `users`, `accounts`, `sessions`, `verification_tokens`
- Middleware on protected routes

**Open decision:** passwords or Google-only. Google-only removes reset emails,
hashing, and credential-stuffing defence — but excludes anyone without a Google
account. *The login UI currently shows password fields that the schema can't
support*, so this must be settled here.

**Risk:** OAuth redirect URIs differ per environment and are a classic
launch-day failure. Configure production URIs at the same time as local.

---

### Part 3 — Conversation store

**Delivers:** create a chat, send a message, refresh, it's still there. No
agents yet — the assistant just echoes.

- `projects`, `chats`, `messages`
- `/chat/[chatId]` actually loads that chat; `/chat/new` creates one
- Sidebar reads from the database; title generated from turn one
- Delete the seeded array and the `setTimeout` mock

**Risk:** low. This is the first part that feels like a product.

---

### Part 4 — Run engine

**Delivers:** ask a question, watch tokens stream, close the tab mid-answer,
reopen — the stream resumes and completes.

- `runs`, `run_events(run_id, seq, …)`, `run_steps`
- `POST /api/chat/[id]/messages` → persist, enqueue, return `runId`
- `GET /api/runs/[id]/stream` → SSE, replays from `Last-Event-ID`, then tails
- `context_snapshots` from day one — see Part 6

**Risk:** highest-leverage part in the plan. Get the event log right and every
later part is additive; get it wrong and everything after pays for it.

---

### Part 5 — Model gateway

**Delivers:** a test route completes against all four models, with usage rows
written for each.

- `ai` + `@openrouter/ai-sdk-provider` — two packages, one API key
- Model registry as config: id, pricing, context, capabilities
- Per-step routing — cheap model for triage, stronger for synthesis

OpenRouter charges **no markup on inference** (a flat ~5.5% fee applies when
buying credits), doesn't log prompts by default, and handles cross-vendor
fallback itself — so this part is much smaller than originally scoped.

**Risks:**
- **Pin the upstream provider on cache-sensitive routes.** Caches live with the
  upstream host, and OpenRouter may route the same model elsewhere. Get this
  wrong and the whole prefix-ordering design in Part 6 silently buys nothing.
- Model IDs in `constants/models.ts` are display placeholders and need verifying.
- List OpenRouter as a subprocessor in the privacy policy (Part 12).

---

### Part 6 — Context assembly

**Delivers:** long chats stay coherent and stop getting more expensive.

- Block builder enforcing **stable-first ordering** (system → project → memory →
  summary → recent turns → sources → question)
- Prompt caching with correct breakpoints
- Compaction at ~60% of window; last 6 turns verbatim, older ones summarised
- The "start a new chat" nudge on repeated compaction or topic drift

**Risk:** the ordering rule is easy to violate by accident and fails silently —
you just pay more. `context_snapshots` is how you catch it.

---

### Part 7 — Web search

**Delivers:** ask about something from this week and get a correct, cited
answer.

- Search provider — Exa or Tavily, both built for agent retrieval
- Query rewriting, fetch, extract, dedupe by canonical URL
- `sources`, `message_sources`; emit source events as they resolve
- Wire the existing `SourcesStrip` to live data

**Risk:** cost scales with result count. Cap depth per tier from day one.

---

### Part 8 — Grounding

**Delivers:** ask something the sources don't support and watch the claim get
flagged rather than asserted.

- Claim segmentation from the answer
- Per-claim entailment check against retrieved passages, parallel, cheap model
- `claims`, `claim_evidence`; verdicts surfaced in the UI

**Risk:** over-aggressive checking strips correct-but-paraphrased claims and
makes answers feel thin. Needs an eval set before tuning thresholds.

---

### Part 9 — Documents & RAG

**Delivers:** upload an 80-page PDF, ask a question, get an answer citing the
right page.

- Presigned upload; size, type, and scan limits
- Parsing via LlamaParse or Unstructured — **not** naive text extraction
- Structure-aware chunking that preserves page anchors
- Hybrid retrieval (vector + BM25, fused) then rerank
- Project-scoped vs chat-scoped documents
- Deletion removes chunks *and* embeddings

**Risk:** parsing quality is where RAG projects die. Tables, multi-column
layouts, and scans all degrade badly with naive extraction.

---

### Part 10 — Memory

**Delivers:** Anvay remembers what you told it three chats ago.

- `user_memories` — semantic, episodic, procedural
- Extraction after each run, **off the critical path**
- Retrieval capped at ~200 tokens, scored by relevance × recency × kind
- Conflict handling by supersession, not deletion

**Build vs buy:** Mem0's Node SDK handles this loop and can run in-process
against our Postgres. Evaluate when you get here, not before.

---

### Part 11 — Cost & limits

- `usage_events` per model call, costed at write time
- Monthly budget checked **before** a run is enqueued
- Rate limiting per user and per IP
- Free tier: which models, what allowance

---

### Part 12 — Production

Observability (per-step latency and cost), error states for every failure mode,
backups with a rehearsed restore, security pass, and the Privacy/Terms pages
that currently link to `#`.

**Delivers:** a stranger can sign up and use it without you watching.

---

## Deferred

| Part | Trigger | Notes |
|---|---|---|
| Connectors (Drive, Notion) | Users ask to point it at existing files | `connections` table with encrypted credentials; feeds the same chunk pipeline |
| Skills | Repeated workflows emerge | Standing instructions — belongs in the cacheable prefix |
| Image upload | Users want to ask about screenshots | `attachments` on messages; router must filter to vision-capable models |
| Browser + code sandbox | Users want computation, not explanation | E2B or Modal. **Never in-process** |
| Voice input | Mobile use grows | Transcribe before the message exists, so everything downstream sees ordinary text |

None of these reshape the core — each is a new block in prompt assembly or a new
kind of run step.

---

## Sequencing

```
1 Infra ─▶ 2 Identity ─▶ 3 Store ─▶ 4 Runs ─▶ 5 Gateway ─▶ 6 Context
                                                              │
                                    7 Search ─▶ 8 Grounding ◀─┘
                                        │
                                        ▼
                          9 RAG ─▶ 10 Memory ─▶ 11 Limits ─▶ 12 Production
```

- **Gateway before Context** — you can't tune assembly without something to send to.
- **Search before Grounding** — you can't check claims with no sources.
- **Grounding before RAG** — the differentiator is worth more than the surface area,
  and RAG is the single largest part here.

**Parts 1–4 are the spine.** Everything after is additive. If you only get four
parts done, those four are the right ones.

---

## Open questions

1. **Passwords or Google-only** — blocks Part 2, changes the login screens.
2. **Hosting** — Vercel + managed Postgres, or self-hosted Docker? Decides the
   connection-pooling strategy.
3. **Queue** — Inngest, QStash, or Postgres-backed? Affects Part 4.
4. **Embedding model** — pins the vector dimension into the schema; changing it
   later means re-embedding everything.
5. **Search provider** — Exa or Tavily. Worth an afternoon comparing on real queries.
6. **`ai` vs `openai` package** — both work against OpenRouter. `ai` gives
   schema-validated structured output, which Parts 7, 8, and 10 all need.
