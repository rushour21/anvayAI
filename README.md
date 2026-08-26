# Anvay — Financial Research Copilot

A chat-first AI research platform for financial analysts, built with **Next.js**,
**TypeScript**, **Supabase**, and **Qdrant**. Research companies, analyze financials,
investigate what changed and why, compare businesses, and produce cited investment
research — through conversation.

**Status:** Foundation (design system) complete. Planning docs finalized 26 August
2026. Implementation not started.

---

## What this is

Anvay combines public financial data (SEC filings, earnings transcripts) and
user-uploaded documents to answer questions like:

```
"Analyze NVIDIA's financial performance over the last 3 years."
"Compare NVIDIA and AMD."
"What caused Apple's margin decline?"
"What are the biggest risks in Microsoft's latest 10-K?"
"Compare this analyst report with the company's latest filing."
```

It's built for equity research analysts, investment/portfolio analysts, PE/VC
analysts, corporate strategy teams, and serious individual investors. It is **not**
accounting software, trading software, portfolio management, or a Bloomberg
replacement. Full product definition: [docs/PRD.md](./docs/PRD.md).

---

## Why this exists

Financial analysts currently jump between SEC filings, earnings transcripts, company
websites, news, Excel, and PDFs — then manually find information, extract numbers,
compare periods, calculate metrics, figure out *why* something changed, validate it,
and write it up. Anvay's bet is that most of that chain can happen inside one
conversation. The differentiator isn't "chat with financials" — it's **investigation**:
tracing a metric change back to management's actual stated explanation, with a real
citation. See [docs/PRD.md §5.3](./docs/PRD.md#53-investigation--the-differentiator)
for why this is treated as the product's actual moat, and gated before being built.

---

## Core stack

| Component | Choice | Why |
|-----------|--------|-----|
| Orchestration | Next.js (TypeScript route handlers) | All logic in one place; no separate Python service |
| Frontend | React + Tailwind | Fast, minimal dependencies |
| Relational + auth + storage | Supabase (Postgres) | Managed, includes auth and file storage |
| Vector store | Qdrant | Dedicated vector DB for document/filing search |
| Auth | Email + password | No Google OAuth — see [docs/PRD.md §9](./docs/PRD.md#9-business-model--auth) |
| AI Gateway | OpenRouter only | One API key, one bill, cross-vendor fallback |
| State | Zustand | Lightweight; persists chat UI state |

No graph database. Postgres handles the MVP's relational needs; see
[docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md) for the reasoning.

---

## Project structure

```
├── app/                    # Next.js routes and API handlers
│   ├── (auth)/            # Login, signup (email + password)
│   ├── (chat)/            # Protected chat routes
│   └── api/               # Backend: messages, runs, financial data
├── components/            # React components (chat, sidebar, auth)
├── stores/                # Zustand stores (mock, will be replaced by API)
├── types/                 # TypeScript definitions
├── constants/             # Model registry, feature flags
├── docs/
│   ├── PRD.md             # Product definition, personas, capabilities
│   ├── MVP.md              # v1 / v2 / v3 scope and exit criteria
│   ├── IMPLEMENTATION-PLAN.md  # Engineering phases and stages
│   └── archive/            # Pre-pivot docs, historical reference only
├── package.json
├── tsconfig.json
├── next.config.ts
└── AGENTS.md               # Warnings for Claude (Next.js breaking changes)
```

---

## Getting started

### Prerequisites
- **Node.js** 18+
- A Supabase project (Postgres + Auth + Storage)
- A Qdrant instance (local via Docker, or managed)
- **Git**

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables (see env.example once Phase 1 lands)

# 3. Run the dev server
npm run dev

# 4. Open http://localhost:3000
```

The app currently shows a **design-complete UI with mocked data**
(see `stores/chatStore.ts`). No real chat, financial data, or auth yet — that's
[Phase 1](./docs/IMPLEMENTATION-PLAN.md#phase-1--identity--persistence) onward.

---

## What's built

- **Landing page** — value prop, social proof, call-to-action
- **Chat workspace** — message list, input, sidebar with recent chats
- **Auth screens** — login, signup, password reset (UI only; backend not wired)
- **Theme system** — light/dark modes, persistent preference
- **Design system** — typography, spacing, components
- **Responsive layout** — desktop and mobile
- **Mocked chat** — type a message, get an echo (no real AI yet)

---

## What's next

The build plan is [10 phases](./docs/IMPLEMENTATION-PLAN.md), mapped to three MVP
versions ([docs/MVP.md](./docs/MVP.md)):

| Version | Focus | Phases |
|---|---|---|
| **v1 — Foundation** | Chat, memory, PDF upload/RAG, auth | 0–5 |
| **v2 — Financial data** | SEC filings, metric extraction, comparison | 6–7 |
| **v3 — The differentiator** | Investigation workflows, generated documents | 8–9 (gated — see MVP.md) |
| **Launch** | Hardening, security, legal | 10 |

v3 does not start until a manual validation gate passes: 5–20 real analyst questions
must get answers an analyst would actually trust, citations included. If that gate
fails, the plan stops and the retrieval/extraction pipeline gets fixed before any UI
is built on top of it.

---

## Key decisions (locked)

- **Orchestration**: all TypeScript, all in Next.js route handlers — no separate backend
- **Data stores**: Supabase (Postgres) for relational/auth/storage, Qdrant for vectors, no graph DB
- **Auth**: email + password only — no Google OAuth
- **Pricing**: individual subscription first; company/team tier only after 50+ paying individuals
- **Model access**: OpenRouter only — single API key, single bill, no direct provider SDKs
- **Streaming**: event log–backed, resumable mid-stream

Full rationale for each: [docs/PRD.md](./docs/PRD.md) and
[docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md).

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

- **[docs/PRD.md](./docs/PRD.md)** — product definition: problem, personas, capabilities, business model
- **[docs/MVP.md](./docs/MVP.md)** — v1/v2/v3 scope, exit criteria, and the v3 validation gate
- **[docs/IMPLEMENTATION-PLAN.md](./docs/IMPLEMENTATION-PLAN.md)** — 10-phase engineering plan with stages, deliverables, and risks
- **[docs/archive/](./docs/archive/)** — pre-pivot docs, historical reference only

---

## Deployment

**Not yet.** Phase 10 covers security pass, observability, backups/restore testing,
privacy/terms pages, and rate limiting.

---

## Contributing

Single-developer project. If you're using Claude Code, see
[AGENTS.md](./AGENTS.md) for Next.js breaking-change warnings.

---

## License

Proprietary. See [LICENSE](./LICENSE) (to be created).
