# Anvay — Research Assistant

A single-user research assistant inspired by Perplexity, built with **Next.js 16**, **TypeScript**, and **Postgres**. Chat with cited web search, document upload, and cross-chat memory.

**Status:** Part 0 (Foundation) complete. Part 1 (Infrastructure) in progress.

---

## What This Is

A full-stack research app:
- **Chat interface** with light/dark theme
- **Web search** with cited answers
- **Document upload & RAG** (upload PDFs, ask questions with page citations)
- **Cross-chat memory** — remember facts from previous conversations
- **Multi-model support** via OpenRouter (OpenAI, Gemini, DeepSeek, open-weight)
- **Resumable streaming** — close the tab mid-answer, reopen to resume
- **Single-user** — no teams, no workspaces. All content is private.

---

## Core Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Orchestration | Next.js 16 (TypeScript route handlers) | All logic in one place; tight feedback loop |
| Frontend | React 19 + Tailwind v4 | Fast, minimal dependencies |
| Database | Postgres 17 + pgvector | Reliable; vector search built-in |
| Auth | Auth.js v5 (Google first) | Industry-standard, Drizzle adapter included |
| AI Gateway | OpenRouter only | One API key, one bill; cross-vendor fallback |
| State | Zustand | Lightweight; persists chat UI state |

---

## Project Structure

```
├── app/                    # Next.js routes and API handlers
│   ├── (auth)/            # Login, signup (Google OAuth)
│   ├── (chat)/            # Protected chat routes
│   └── api/               # Backend: messages, runs, search, RAG
├── components/            # React components (chat, sidebar, auth)
├── stores/                # Zustand stores (mock, will be replaced by API)
├── types/                 # TypeScript definitions
├── constants/             # Model registry, feature flags
├── docs/                  # Build plan and data model
│   ├── ROADMAP.md        # 12-part build plan for v1
│   ├── DATA-MODEL.md     # Database schema (Postgres tables)
│   └── CONTEXT-AND-MEMORY.md  # Prompt assembly strategy
├── package.json          # Dependencies (Next, React, Tailwind, Zustand)
├── tsconfig.json         # TypeScript config
├── next.config.ts        # Next.js config
└── AGENTS.md             # Warnings for Claude (Next.js 16 breaking changes)
```

---

## Getting Started

### Prerequisites
- **Node.js** 18+
- **Docker** (for Postgres + pgvector)
- **Git**

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the database
docker compose up

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:3000
```

The app currently shows a **design-complete UI with mocked data** (see `stores/chatStore.ts`). No real chat, search, or auth yet.

---

## What's Built (Part 0 ✅)

- **Landing page** — value prop, social proof, call-to-action
- **Chat workspace** — message list, input, sidebar with recent chats
- **Auth screens** — login, signup, password reset (UI only; backend TBD)
- **Theme system** — light/dark modes, persistent preference
- **Design system** — typography, spacing, components (button, input, icon)
- **Responsive layout** — desktop and mobile
- **Mocked chat** — type a message, get an echo (no real AI yet)

---


## Key Decisions (Locked)

These choices are finalized and will not change before v1:

- **Orchestration**: All TypeScript, all in Next.js route handlers (no separate Python backend)
- **Database**: Postgres 17 + pgvector in Docker locally; managed Postgres on production
- **Auth**: Auth.js v5 with Drizzle adapter; Google OAuth by default
- **Models**: OpenAI, Gemini, DeepSeek, and one free open-weight model
- **Model Access**: OpenRouter only — single API key, single bill
- **Streaming**: Event log–backed, resumable mid-stream
- **Memory**: Short-term via compaction; long-term in Part 10

---

## Open Questions

These decisions block upcoming parts:

1. **Passwords or Google-only?** — Affects login UI and auth schema (Part 2)
2. **Hosting strategy** — Vercel + managed Postgres, or self-hosted? (affects connection pooling)
3. **Queue service** — Inngest, QStash, or Postgres-backed? (Part 4)
4. **Embedding model** — Pins vector dimension; changing later means re-embedding (Part 9)
5. **Search provider** — Exa or Tavily? (Part 7)

---

## Environment Variables

Not yet wired up, but these will be needed:

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/anvay

# Auth (Auth.js v5)
NEXTAUTH_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...

# AI models (OpenRouter)
OPENROUTER_API_KEY=...

# Web search (Part 7)
EXA_API_KEY=...  # or TAVILY_API_KEY=...

# Observability (Part 12)
SENTRY_DSN=...
```

See `env.example` (to be created in Part 1).

---

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Run production server
npm run lint     # Run ESLint
```

---

## Documentation

- **[ROADMAP.md](./docs/ROADMAP.md)** — The 12-part build plan with risk assessment
- **[DATA-MODEL.md](./docs/DATA-MODEL.md)** — Complete Postgres schema
- **[CONTEXT-AND-MEMORY.md](./docs/CONTEXT-AND-MEMORY.md)** — Prompt assembly & memory strategy

---

## Architecture Notes

### Event Log (Part 4)

All inference runs are backed by an append-only event log (`run_events` table). This enables:
- **Resumable streaming** — close the browser, reopen, resume mid-stream
- **Observability** — inspect every token and latency
- **Replay** — rebuild state from events if needed

### Context Assembly (Part 6)

Long chats stay coherent by:
1. Enforcing **stable-first ordering** (system → project → memory → summary → recent turns → sources → question)
2. Using **prompt caching** with correct breakpoints
3. **Compacting** at ~60% of the context window (older turns → summaries)
4. Suggesting a **new chat** if compaction happens repeatedly

### Web Search (Part 7)

Answers are grounded in live sources:
1. Query rewriting (often the user's question isn't the best search query)
2. Fetch & extract via Exa or Tavily
3. Deduplicate by canonical URL
4. Emit sources as they resolve (for streaming UI)

### Citation Grounding (Part 8)

Claims are checked automatically:
1. Segment the answer into atomic claims
2. Check each claim against retrieved passages (parallel, cheap model)
3. Surface verdicts in the UI (supported, unsupported, partially supported)

---

## Deployment

**Not yet.**  Part 12 will cover:
- Security pass
- Observability setup (Sentry, analytics)
- Backup & restore testing
- Privacy & Terms pages
- Rate limiting by user and IP

---

## Contributing

This is a single-developer project. PRs welcome, but check the [ROADMAP](./docs/ROADMAP.md) for context. If you're using Claude Code, see [AGENTS.md](./AGENTS.md) for Next.js 16 breaking changes.

---

## License

Proprietary. See [LICENSE](./LICENSE) (to be created).

---

## Questions?

See [ROADMAP.md](./docs/ROADMAP.md) for architecture details, risk assessment, and sequencing rationale.
