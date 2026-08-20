# Anvay AI — Build Roadmap

**Last updated:** 21 August 2026
**Status:** Phase 0 complete. Phase 1 not started.

---

## 1. What Anvay is

A multi-agent research workspace. You ask a question; a team of specialised agents
searches the live web, reads your documents, cross-checks each other, and returns a
**cited** answer — with the pipeline visible while it runs.

The differentiator is not "chat with an LLM". It is that **every claim is grounded in a
retrieved source, and claims that can't be grounded are dropped rather than shipped.**
The visible agent trace is the proof of that work.

### Locked decisions

| Decision | Choice | Why |
|---|---|---|
| Scope | Real product with users | Auth, tenancy, quotas and cost accounting belong in v1, not bolted on later |
| Orchestration | All TypeScript, inside Next.js | One repo, one deploy, one language. No Python service |
| v1 agents | Search, Synthesizer, Validator, RAG | Memory and Code Runner deferred |
| Database | Postgres + pgvector, Docker locally | One datastore for both relational data and embeddings |
| Auth | Auth.js v5, Google OAuth first | Google removes signup friction; password is the fallback |
| Models | Multi-provider incl. free tiers | Anthropic / OpenAI / Google direct, open weights via router, Ollama local |

### Deferred, with reasons

- **Memory agent (Mem0)** — not in the v1 agent set. When built, use the `mem0ai` Node
  library in-process pointed at our existing Postgres, *not* the Docker server. The
  self-hosted server ships with no auth and `allow_origins=["*"]`, and would reintroduce
  a Python service we deliberately avoided.
- **Code Runner** — needs real isolation (E2B / Modal / Daytona). Never `eval`, never a
  child process. Highest risk, most cuttable.

---

## 2. Architecture in one page

### The streaming contract

Everything hangs off one discriminated union. Keeping this stable is what lets the
orchestrator be rewritten or moved without touching the client.

```ts
type StreamEvent =
  | { type: "trace";  agent: AgentRole; status: TraceStatus }
  | { type: "token";  delta: string }
  | { type: "source"; source: Source }
  | { type: "usage";  agent: AgentRole; inTok: number; outTok: number }
  | { type: "done";   messageId: string }
  | { type: "error";  code: string; recoverable: boolean }
```

### The run/event log

A full agent run takes 30–90 seconds. Serverless functions time out well inside that,
and real users close tabs mid-run. So **the SSE connection does not run the agents.**

```
POST /api/chat/[chatId]/messages   → write message + run row, enqueue, return runId
        ↓
    worker executes the DAG, appending each StreamEvent to run_events
        ↓
GET  /api/runs/[runId]/stream      → replay from Last-Event-ID, then tail
```

`run_events.seq` doubles as the SSE `Last-Event-ID`. Reconnect-after-drop and
replay-on-refresh both come free, and run duration is decoupled from connection
duration. This stays entirely in TypeScript — a queue (Inngest / QStash) just triggers
back into a route handler.

### Data model

```
users · accounts · sessions          (Auth.js)
workspaces · workspace_members       (tenancy from migration #1)
chats → messages → message_sources
runs → run_events(seq, type, payload)
documents → chunks(embedding vector)
usage_ledger                         (per-run cost, enforced pre-enqueue)
```

**Workspaces exist from the first migration.** Retrofitting tenancy onto user-scoped
rows is one of the ugliest migrations there is, and we've committed to a real product.

---

## Phase 0 — Foundation & Design System ✅ COMPLETE

**Goal:** a high-fidelity frontend that fully specifies the backend.

| Stage | Work | Status |
|---|---|---|
| 0.1 | Design tokens — blue/ink/paper scales, elevation, motion | ✅ |
| 0.2 | Typography — Instrument Sans + Instrument Serif italic accents | ✅ |
| 0.3 | Typographic wordmark, PNG logo removed | ✅ |
| 0.4 | Icon system — 35 stroke icons, all emoji removed | ✅ |
| 0.5 | Landing page — hero, bento, agents, models, use cases, CTA, FAQ, footer | ✅ |
| 0.6 | Chat workspace — sidebar, topbar, trace, bubbles, sources, composer | ✅ |
| 0.7 | Auth screens incl. Google button (UI only, no handler) | ✅ |

**Exit criteria met:** clean `tsc`, clean `eslint`, clean `next build`.

**Known state:** all runtime behaviour is `setTimeout` theatre in `stores/chatStore.ts`.
`chatId` is in the URL and never read. `updateLastAssistantMessage` exists and is never
called — it's waiting for Phase 3.

---

## Phase 1 — Identity & Persistence

**Goal:** sign in with Google, create a chat, refresh, and it's still there. No agents.

### Stage 1.1 — Local infrastructure
- `docker-compose.yml` — `pgvector/pgvector:pg17`, named volume, healthcheck
- `db/init/01-extensions.sql` — `vector`, `pg_trgm`, `unaccent`
- `.env.example` with every key the app will ever read
- **Deliverable:** `docker compose up` gives a working database

### Stage 1.2 — ORM & migrations
- Drizzle + `drizzle-kit`, `db/schema.ts`, migration scripts in `package.json`
- Connection helper that reuses a pooled client across hot reloads
- **Deliverable:** migrations run forward and back

### Stage 1.3 — Auth.js v5 with Google
- Google Cloud project → OAuth 2.0 client → redirect URIs for local and prod
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` / `AUTH_SECRET`
- Drizzle adapter; `users`, `accounts`, `sessions`, `verificationTokens`
- Wire the existing disabled button in `components/auth/OAuthButtons.tsx` to a server
  action calling `signIn("google")`
- Email + password as the secondary path, with verification
- Route protection via middleware on `/chat/*`
- **Deliverable:** Google sign-in works end to end; session survives restart

### Stage 1.4 — Workspaces
- `workspaces`, `workspace_members` with roles (`owner` / `member`)
- A personal workspace is created on first sign-in
- Every subsequent query is scoped by `workspace_id`
- **Deliverable:** two accounts cannot see each other's data

### Stage 1.5 — Chats & messages
- `chats`, `messages` tables; CRUD route handlers
- `/chat/[chatId]` actually loads that chat
- `/chat/new` creates a row and redirects to its id
- Replace the seeded array in `chatStore` with server data
- Title generation from the first message
- **Deliverable:** history sidebar reflects the database

**Exit criteria:** Sign in with Google → create a chat → send a message (echoed, no
agents) → hard refresh → everything is still there. Second account sees nothing of the
first.

**Risks:** OAuth redirect URIs differ per environment and are a common launch-day
failure — configure prod URIs at the same time as local.

---

## Phase 2 — Model Gateway

**Goal:** call any model in the catalogue through one interface, including free ones.

### Stage 2.1 — Provider abstraction
- Vercel AI SDK (`ai`) as the common interface
- Providers: `@ai-sdk/anthropic`, `@ai-sdk/openai`, `@ai-sdk/google`
- **Deliverable:** one `generate()` signature across three vendors

### Stage 2.2 — Router & free tier
- OpenRouter provider for open-weight models — one key covers Llama, DeepSeek, Qwen,
  Mistral, including their `:free` variants
- Ollama provider for local/self-hosted, added to `docker-compose.yml`
- **Deliverable:** every model in `constants/models.ts` resolves to a live client

### Stage 2.3 — Catalogue as config
- Move the display catalogue into a runtime registry: id, provider, access mode,
  context window, price per million in/out, capabilities (tools, vision, JSON)
- Verify every model id against current provider docs — the values currently in
  `constants/models.ts` are **display placeholders and must be checked**
- **Deliverable:** adding a model is a config change, not a code change

### Stage 2.4 — Routing policy
- The Gateway agent picks a model per *step*, not per conversation:
  cheap/fast for routing, extraction and validation; frontier for synthesis
- Per-workspace allow-list (a free-tier workspace only gets free models)
- Fallback chain on provider error or rate limit
- **Deliverable:** one provider outage does not take the product down

### Stage 2.5 — Cost accounting
- `usage_ledger` written on every model call
- Per-workspace monthly budget, checked *before* a run is enqueued
- **Deliverable:** spend is attributable per user, per run, per agent

**Exit criteria:** a test route completes against Claude, GPT-4o, Gemini, a free
OpenRouter model, and local Ollama — with usage rows written for each.

**Risks:** free tiers rate-limit aggressively and change terms without notice. Treat
them as best-effort with a paid fallback, never as the only path.

---

## Phase 3 — The Streaming Spine

**Goal:** real token streaming that survives a dropped connection.

### Stage 3.1 — Run & event tables
- `runs`, `run_events(run_id, seq, type, payload, ts)`
- Monotonic `seq` per run

### Stage 3.2 — Event contract
- Implement `StreamEvent` as the single serialisation format
- Extend the existing `TraceEvent` in `types/agent.ts` rather than replacing it

### Stage 3.3 — Producer
- `POST /api/chat/[chatId]/messages` → persist, enqueue, return `runId` immediately
- Worker appends events as it goes

### Stage 3.4 — Consumer
- `GET /api/runs/[runId]/stream` — SSE, replays from `Last-Event-ID`, then tails
- Client `EventSource` with reconnect and backoff

### Stage 3.5 — Synthesizer, streaming for real
- One agent, no retrieval — just a model answering
- `chatStore.sendMessage` calls the API; **all `setTimeout` theatre is deleted**
- `updateLastAssistantMessage` finally gets called, per token delta

**Exit criteria:** ask a question, watch tokens stream in, close the tab mid-run,
reopen it, and the stream resumes and completes.

**Risks:** this is the highest-leverage phase. If the event log is right, every later
agent is additive. If it's wrong, every later phase pays for it.

---

## Phase 4 — Web Search

**Goal:** the core loop closes — real answers from the live web, with real citations.

| Stage | Work |
|---|---|
| 4.1 | Search provider — Exa or Tavily, both built for agent retrieval |
| 4.2 | Search agent — query rewriting, fetch, extract, dedupe by canonical URL |
| 4.3 | Gateway agent — decide *whether* search is needed at all |
| 4.4 | Persist `message_sources`; emit `source` events as they resolve |
| 4.5 | Wire the existing `SourcesStrip` to live data |

**Exit criteria:** ask about something that happened this week and get a correct,
cited answer. Sources appear progressively as they're found.

**Risks:** search cost scales with result count. Cap depth per tier from day one.

---

## Phase 5 — Validator

**Goal:** the differentiator. Nothing ungrounded reaches the user unmarked.

| Stage | Work |
|---|---|
| 5.1 | Claim segmentation — Synthesizer emits sentences with claim markers |
| 5.2 | Entailment check per claim against retrieved chunks, in parallel, on a fast model |
| 5.3 | Grounding states — `grounded` / `partial` / `ungrounded` persisted per claim |
| 5.4 | UI treatment — ungrounded claims dropped or visibly flagged |
| 5.5 | Trace integration — the Validator step reports counts, not just "done" |

**Exit criteria:** deliberately ask something the sources don't support, and watch the
unsupported claim get flagged rather than asserted.

**Risks:** over-aggressive validation strips correct-but-paraphrased claims and makes
answers feel thin. Needs a real eval set before the thresholds are tuned.

---

## Phase 6 — Documents & RAG

**Goal:** upload a PDF, ask about it, get a page-cited answer.

| Stage | Work |
|---|---|
| 6.1 | Upload — presigned S3/R2, size and type limits, virus scan |
| 6.2 | Parsing — LlamaParse or Unstructured. **Not** naive text extraction |
| 6.3 | Chunking — structure-aware, preserving page and section anchors |
| 6.4 | Embedding + async ingestion job with visible status |
| 6.5 | Hybrid retrieval — `tsvector` BM25 + pgvector, then rerank |
| 6.6 | RAG agent + page-level citations in the UI |
| 6.7 | Deletion — document, chunks, and embeddings together |

**Exit criteria:** upload an 80-page PDF, ask a question, and get an answer citing the
correct page.

**Risks:** **parsing quality is where RAG projects die.** Tables, multi-column layouts
and scanned pages all degrade badly with naive extraction. Budget for a real parser.
GDPR deletion must remove embeddings, not just the file row.

---

## Phase 7 — Hardening & Launch

| Stage | Work |
|---|---|
| 7.1 | Rate limiting per workspace and per IP |
| 7.2 | Budget enforcement — soft warning, then hard stop |
| 7.3 | Error states — every `error` event maps to a real UI state, not a spinner |
| 7.4 | Observability — traces, per-agent latency, cost dashboards |
| 7.5 | Backups, migration rehearsal, restore drill |
| 7.6 | Security pass — CSP, secrets audit, RLS or enforced query scoping |
| 7.7 | Legal — the Privacy and Terms links in the footer currently go to `#` |

**Exit criteria:** a stranger can sign up and use it without you watching.

---

## Phase 8 — Deferred

| Item | Trigger to build | Approach |
|---|---|---|
| Memory agent | Users repeat context across sessions | `mem0ai` **Node library**, in-process, against existing Postgres. Not the Docker server |
| Code Runner | Users ask for computation, not explanation | E2B or Modal. Isolated, network-restricted, time-capped |
| Team workspaces | Someone asks to invite a colleague | Membership tables already exist from Phase 1.4 |
| Graph memory | Entity relationships start mattering | Neo4j alongside pgvector — only if flat retrieval measurably fails |

---

## 3. Sequencing rationale

Each phase is independently demoable, and each is a prerequisite for the next:

```
0 Foundation ──▶ 1 Identity ──▶ 2 Gateway ──▶ 3 Streaming ──▶ 4 Search ──▶ 5 Validator ──▶ 6 RAG ──▶ 7 Launch
   (done)         auth+data      models        the spine       core loop     the moat        depth
```

- **Gateway before Streaming** — streaming needs something to stream from.
- **Search before Validator** — you can't ground claims with no sources.
- **Validator before RAG** — the moat is worth more than the surface area, and RAG is
  the largest single chunk of work in the plan.

## 4. Open questions

1. **Hosting** — Vercel + Neon/Supabase, or self-hosted Docker end-to-end? Changes the
   pooling strategy (managed pooler vs. a PgBouncer container).
2. **Queue** — Inngest, QStash, or a Postgres-backed queue? Affects Phase 3.3.
3. **Search provider** — Exa or Tavily. Worth spending an afternoon comparing on real
   research queries before committing.
4. **Free-tier policy** — which models does an unpaid workspace get, and what is the
   monthly token allowance?
