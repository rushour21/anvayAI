# Anvay — MVP Definition (v1 / v2 / v3)

**Last updated:** 26 August 2026
**Status:** Planning. See `PRD.md` for product rationale, `IMPLEMENTATION-PLAN.md` for
engineering phases and stages that build each version.

---

## Why three versions, in this order

Build the technical foundation before financial capability, and don't build financial
capability before proving the one thing the whole product depends on: that AI-driven
**investigation** ("why did X change") actually produces answers an analyst would
trust. Comparison dashboards, document generation, and polish are all worthless if that
core loop is broken — so v3 is gated on a manual validation step, not just calendar
time.

```
v1  Foundation        chat + memory + documents work, no financial data yet
 ↓
v2  Financial data     the same chat can now answer with real company financials
 ↓
v3  The differentiator investigation + generated documents — the reason to pay
```

---

## MVP v1 — Foundation

**Goal:** the technical spine works end to end with no financial logic yet. A user can
sign up, chat with any model via OpenRouter, upload a PDF and get cited answers from
it, and have the product remember things across sessions.

### In scope
- Chat: streaming responses, conversation history, model selection across OpenRouter
- Persistent messages (survive refresh, survive reconnect mid-stream)
- Memory: chat summaries + basic user memory + relevant-memory retrieval
- Documents: PDF upload, text extraction, chunking, document search, citations
- Auth: email + password (individual accounts only — see `PRD.md` §9)

### Explicitly deferred to later versions
- Anything company-specific (tickers, filings, financial metrics)
- Comparison, investigation, generated documents
- Team/company accounts
- Voice input (mic → speech-to-text) — parked, not core to the differentiator, revisit
  post-v3

### Exit criteria
Sign up → start a chat → pick a model → ask a question → get a streamed, cited answer →
upload a PDF → ask about it → get a page-cited answer → close the tab mid-stream →
reopen → it resumes → come back next session → the assistant remembers relevant prior
context.

---

## MVP v2 — Financial capabilities

**Goal:** the same chat interface can now answer with real company financials, not just
uploaded documents.

### In scope
- Company search / ticker resolution (e.g. "NVIDIA" → `NVDA`, CIK `0001045810`)
- SEC filing ingestion (10-K, 10-Q, 8-K) — auto-fetched, not user-uploaded
- Financial metric extraction into a structured store (revenue, margins, cash flow,
  debt, R&D, segments — see `PRD.md` §5.2 for the full list)
- Financial calculations (CAGR, YoY change, ratios)
- Company comparison — metric tables across 2–5 companies
- Basic charts (revenue, margin, growth, FCF trends)

### Explicitly deferred
- The investigation workflow itself (detecting *why* a metric changed) — v3
- Document generation (earnings notes, flash reports) — v3
- Alerts / watchlists — post-v3
- Earnings call transcript parsing — nice-to-have, only if time allows; text
  extraction from filings is the priority

### Exit criteria
"Analyze NVIDIA's financial performance over the last 3 years" returns real extracted
numbers with a chart, not a hallucinated summary. "Compare NVIDIA and AMD" returns a
correct side-by-side metric table. Every number in the answer is traceable to the
filing it came from.

---

## MVP v3 — The differentiator

**Goal:** ship investigation and document generation — the capabilities that make
Anvay something other than "chat with a company's financials."

### Pre-build gate (do this before writing any v3 code)
Manually run 5–20 real analyst questions ("Why did NVIDIA's gross margin fall in Q3?")
through the retrieval + LLM pipeline built in v2. Grade each answer:
- Does it cite a real, correct section of the filing?
- Is the stated explanation actually accurate (not a plausible-sounding hallucination)?
- Would a working analyst trust it enough to act on it?

If this fails on most questions, **stop and fix retrieval/extraction quality before
building UI around it.** A confident wrong answer is worse than a slow right one for
this audience.

### In scope (once the gate passes)
- Investigation workflow: find the metric → detect the change → find relevant filing
  sections → find management's explanation → cross-check other sources → explain →
  cite (`PRD.md` §5.3)
- Document generation: turn a chat's findings into a formatted **earnings note**,
  **flash report**, or **comp sheet** — the exact deliverable shape analysts are
  evaluated on at work
- Export formats: PDF (to share) and Excel (for their own modeling), not just on-screen
- Combining user-uploaded documents with public data: "Compare the analyst's revenue
  forecast with NVIDIA's latest 10-K" (uploaded PDF + SEC filing + conclusion +
  citations)

### Explicitly deferred beyond v3
- Team/company accounts and shared research
- Valuation tooling (DCF, multiples, scenarios)
- Watchlists and alerts ("NVIDIA released its latest 10-Q")
- Research workspace (saved companies/analyses/sources as a first-class object)
- Voice input
- Investment memo (IC memo) template — PE/VC is a secondary persona; revisit if that
  segment shows real demand

### Exit criteria
"Why did Apple's operating margin decline?" produces an answer with a correct causal
explanation, citing the specific MD&A section, that passes the same bar as the
pre-build gate. A user can click "generate earnings note" on that investigation and get
a formatted, exportable document with the finding, supporting table, and citations
already in place.

---

## Beyond v3 (parking lot, not scheduled)

- Company/team accounts, shared research and collaboration
- Paid tier ladder: Individual → Pro → Team → Enterprise
- Watchlists and alerts
- Valuation workbench (DCF, comps multiples, scenario modeling)
- Voice input via speech-to-text (Whisper/Deepgram)
- Research reports as a standalone generated artifact (beyond earnings note/flash report)
- Investment memo template for PE/VC segment, if demand shows up

Nothing in this list gets scheduled into an implementation phase until v3's gate has
passed and there's a specific user signal pulling it forward.
