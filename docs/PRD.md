# Anvay — Product Requirements Document

**Last updated:** 26 August 2026
**Status:** Pre-build. Supersedes the "generic research workspace" framing in the
original `ROADMAP.md` — Anvay is now a financial research copilot, not a
general-purpose Perplexity clone. `ROADMAP.md` and `DATA-MODEL.md` still describe the
earlier generic direction and need reconciling against this document before Phase 1
work resumes.

---

## 1. One-sentence summary

Anvay is a chat-first financial research copilot that combines public financial data
(SEC filings, earnings transcripts) and user-provided documents to research companies,
analyze financials, investigate changes, compare businesses, and produce cited
investment research.

---

## 2. The problem

Financial analysts currently stitch together a research answer by hand, jumping across
sources that don't talk to each other:

```
SEC filings · earnings transcripts · company websites · industry research ·
news · financial databases · Excel · PDF reports
        ↓
Find information → Extract numbers → Compare periods/companies →
Calculate metrics → Understand why something changed → Validate → Write conclusions →
Build tables/charts
```

That whole chain currently happens manually: **search → read → copy → Excel →
calculate → search again → write report.** Anvay's bet is that most of this chain can
happen inside one conversation:

> "Why did NVIDIA's operating margin decline?"

---

## 3. Who it's for

Initial focus is **equity and company research**, not accounting, trading, portfolio
management, or a full Bloomberg replacement.

| Persona | What their job actually is | Where Anvay fits |
|---|---|---|
| **Equity research analyst** | Cover a sector; read filings, build models, set price targets, write research notes, present to clients | Investigation + comparison + earnings-note generation |
| **Investment / portfolio research analyst** | Give buy-side recommendations to PMs; monitor holdings for news, risk, performance | Watchlists (later) + investigation + flash reports |
| **PE / VC analyst** | Source deals, run due diligence, build models, write IC memos | Public-company comps and market context only — private data-room diligence is out of scope for MVP |
| **Corporate strategy team** | Track competitors, market position, M&A targets | Comparison + research |
| **Serious individual investor** | Research a stock before buying; no institutional tooling | Full product, individual-tier pricing |

All five personas share the same four verbs from their actual job descriptions:
**research, analyze, investigate, communicate.** That mapping is deliberate — see
Section 5.

---

## 4. Scope

**In scope for v1 of the product vision:**
- Public-company research (US SEC filers to start)
- Chat as the primary interface
- Financial analysis (metrics, ratios, comparisons)
- Investigation ("why did X change") grounded in filings and transcripts
- User-uploaded documents combined with public data
- Individual subscriptions

**Explicitly out of scope, for now:**
- Accounting software, bookkeeping, or any private-books integration (QuickBooks/Xero) —
  accountants will not upload sensitive data to a third-party cloud; revisit only as a
  separate product line if ever
- Trading execution or portfolio management
- Private company due diligence (data rooms, cap tables) — PE/VC users get the
  public-comps slice only
- Team/company accounts — see Section 8
- A full Bloomberg-style terminal (charts, options chains, real-time tick data)

---

## 5. Core capabilities

Four capabilities, matched directly to the verbs in real analyst job postings.

### 5.1 Research
*"What changed in NVIDIA's business?"*
Find relevant information across filings, earnings material, and public sources.

### 5.2 Financial analysis
Calculate and analyze: revenue growth, CAGR, gross/operating/net margin, free cash
flow, debt, capex, R&D, segment growth, financial ratios, YoY changes.

### 5.3 Investigation — the differentiator
*"Why did operating margin fall?"*
```
Find the metric → Detect the change → Find relevant filing sections →
Find management's explanation → Cross-check other sources →
Explain the cause → Cite evidence
```
This is not retrieval — it's a structured multi-step workflow that requires knowing
the shape of a 10-K (MD&A vs. Risk Factors vs. financial statements), picking the
*right* explanation out of noise, and citing the exact section. Generic web search and
plain PDF chat cannot do this reliably. **If this workflow doesn't hold up under real
use, the rest of the product is commoditized chat — validate this before investing in
comparison dashboards or document generation (see `MVP.md`, v3 gate).**

### 5.4 Comparison
*"Compare NVIDIA vs AMD."*
Produces a metric table (revenue growth, gross margin, operating margin, FCF, R&D,
debt) plus a written explanation of what the differences mean.

---

## 6. Data sources

| Source | Type | Notes |
|---|---|---|
| SEC 10-K / 10-Q / 8-K | Public, structured-ish | Primary source of truth for financials |
| Earnings releases & transcripts | Public | Management's own explanation of results |
| Investor presentations | Public | Often PDF/PPTX |
| Company websites, reliable web sources | Public | Supplementary context |
| Financial data APIs | Public/paid | For metrics not disclosed cleanly in filings |
| User-uploaded PDF/Excel | Private, per-user | Analyst reports, models, presentations |

No web-search-only strategy — the moat is reasoning over structured/semi-structured
financial documents, not finding pages Google already finds.

---

## 7. Output types

Anvay does not only return paragraphs. Every answer can carry:

| Output | Example |
|---|---|
| Text | Clear explanation of a metric or event |
| Tables | Financial comparisons across companies/periods |
| Charts | Revenue, margin, growth, FCF trends |
| Calculations | CAGR, ratios, deltas, scenarios |
| Key findings | "Revenue accelerated while opex grew slower than revenue" |
| Risks | "Customer concentration increased..." |
| Sources | Specific filing/document/section citations |
| Generated documents (v3) | Earnings note, flash report, comp sheet — see Section 9 |

---

## 8. Memory model

Three distinct memory types, not one blob:

1. **Conversation history** — everything said in a chat.
2. **User memory** — long-term preferences/context (e.g. "I usually care about FCF over
   GAAP net income").
3. **Research memory** — what the user has previously investigated, per company:
   ```
   Research: NVIDIA
   Previously analyzed: Revenue growth · Data Center segment · Gross margin · AMD comparison
   Saved sources: 10-K · Q1 earnings · Q2 earnings
   Previous conclusions: ...
   ```
   Enables: *"What's changed since our previous NVIDIA analysis?"*

---

## 9. Business model & auth

**Decision (26 Aug 2026): individual-first, no Google OAuth.**

- Auth is **email + password** (Supabase Auth or Auth.js credentials provider), not
  Google — financial professionals are often on locked-down corporate machines/browser
  policies where Google OAuth via a third-party research tool is a harder sell than a
  plain email signup, and it removes a dependency on Google Cloud console config per
  environment.
- **Phase 1 pricing: individual subscription only.** One researcher, one workspace,
  self-serve signup, no admin approval loop.
- **Phase 2 (post-traction, 50+ paying individuals): company/team tier.** Admin invites
  employees, shared research and watchlists, usage limits per seat, $500+/mo.

**Why individual-first, not enterprise-first:**
1. Enterprise sales cycles (6–12 months) are too slow to validate whether the
   investigation workflow (Section 5.3) actually works.
2. Individual users give feedback in days; companies take months to decide.
3. Financial software buyers want case studies/references you don't have yet.
4. Once 50+ individuals validate the product, teams pay 10–17x more for shared
   research — the upsell path is natural (see Slack/Notion/Figma precedent).

This reverses the "Google OAuth first" and generic-user framing in the original
`README.md` / `ROADMAP.md`, which predate the financial-copilot pivot.

---

## 10. Document types Anvay's output should be able to generate

Every document a target persona is actually evaluated on at work shares one skeleton:
summary/thesis → business overview → financial analysis → what changed and why →
risks → valuation/recommendation → sources. Concretely:

| Document | Who produces it | Frequency |
|---|---|---|
| Earnings note | Equity research analyst | Every quarter, right after earnings |
| Flash report (1–2 pages) | Equity research analyst | Same-day, breaking news |
| Initiation/coverage report | Equity research analyst | Once per company covered |
| Comparison/comps sheet | All personas | As-needed |
| Investment memo (IC memo) | PE/VC analyst | Per deal — lower priority, PE/VC is a secondary persona |

MVP v3 targets earnings note, flash report, and comps sheet generation — see `MVP.md`.

---

## 11. Success metrics

- **Investigation accuracy** (pre-launch gate): on a hand-graded set of 20+ real
  "why did X change" questions, does the answer cite the correct filing section and
  give an explanation an analyst would trust? This gates whether v3 gets built at all.
- **Time-to-first-insight**: time from question to a cited answer, vs. the manual
  baseline (analyst self-reported).
- **Retention**: does a signed-up analyst come back within 7 days for a second
  company/question?
- **Conversion to paid**: free → individual paid tier.
- **Upsell signal**: individual users asking to share research with a colleague (the
  trigger for building the team tier).

---

## 12. Key risks & open questions

| Risk | Why it matters | Mitigation |
|---|---|---|
| Investigation workflow doesn't hold up | Whole product collapses to "chat with financials" — commodity | Manually test 5–20 real questions before building comparison/generation UI (MVP v3 gate) |
| Financial metric extraction is wrong | Wrong numbers destroy trust instantly, worse than no answer | Validate extraction against a known-correct source per company before shipping |
| SEC filing structure varies across companies | MD&A location, segment reporting, and tables aren't standardized | Build extraction against a diverse sample (tech, industrials, financials), not just mega-caps |
| Individual pricing doesn't cover CAC | Financial-professional acquisition may be expensive | Track CAC vs. $29–100/mo LTV early; be ready to adjust price or channel |
| Citation hallucination | An analyst-facing product that fabricates a citation is worse than useless | Every claim in an investigation answer must resolve to a real, checkable source — no exceptions |

**Open questions carried over from `ROADMAP.md`:**
- Hosting (Vercel + Supabase managed, or self-hosted?)
- Queue service for the run/event log (Inngest, QStash, Postgres-backed?)
- Which financial-data API fills gaps SEC filings don't disclose cleanly (e.g. consensus
  estimates, real-time price)?

---

## Appendix — example prompts by capability

```
Research      "Analyze NVIDIA's financial performance over the last 3 years."
Comparison    "Compare NVIDIA and AMD."
Investigation "What caused Apple's margin decline?"
Filing        "What are the biggest risks mentioned in Microsoft's latest 10-K?"
Mixed source  "Compare this analyst report with the company's latest filing."
              (user-uploaded PDF + SEC filing)
```
