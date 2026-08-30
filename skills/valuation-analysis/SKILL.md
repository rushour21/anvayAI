# Valuation Analysis

## Purpose
Analyze a company's current valuation using standard multiples, optionally
against its own history.

## When to use
The user asks specifically about valuation — whether a company looks
over/undervalued, or a comparison of valuation between companies or across
time — rather than a general financial-health trend (`financial-analysis`)
or a broad research rundown (`equity-research`).

Examples: "Do a valuation analysis on Apple.", "Is Nvidia overvalued?",
"Compare Microsoft's valuation to Google's."

## Required information
- Company name or ticker symbol (and a second company/ticker if a
  comparison is requested).

## Recommended workflow
1. Identify the company with `get_company_profile`.
2. Retrieve financial data with `get_income_statement` / `get_financials`.
3. Retrieve valuation metrics with `get_pe`, `get_pb`, and `get_ev_ebitda`.
4. Compare historical or current valuation where data exists (e.g. against
   prior periods, or against a second company if the user named one).
5. Calculate any required derived metrics with `calculate_metric`.
6. Research relevant context with `search_news` / `search_web` (e.g. why a
   multiple has moved, recent guidance).
7. Identify and state any assumptions the analysis relies on.
8. Produce the analysis, clearly separating facts from interpretation.
9. Cite sources for every figure used.

## Relevant tools
- `get_company_profile`
- `get_income_statement`, `get_financials`
- `get_pe`, `get_pb`, `get_ev_ebitda`, `get_roe`, `get_roic`
- `calculate_metric`
- `search_news`, `search_web`

## Required calculations
Any derived comparison (e.g. percentage difference vs. a historical period
or a peer) must go through `calculate_metric` — never compute it in prose.

## Evidence requirements
Valuation multiples must come directly from `get_pe`, `get_pb`, or
`get_ev_ebitda` — never estimated or computed manually from other figures.

## Citation requirements
Name the data provider (e.g. Financial Modeling Prep) backing each market
or valuation figure, and name any research source used for context.

## Output structure
1. **Company snapshot** — brief identification, cited.
2. **Valuation multiples (facts)** — the raw multiples retrieved, cited.
3. **Historical/peer comparison** — comparison figures and calculations.
4. **Assumptions** — anything the analysis relies on that isn't a direct
   fact (e.g. what "expensive" is being measured against).
5. **Analysis** — interpretation, clearly marked as such.
6. **Sources** — a short list of what was cited.

## Limitations
- Valuation tools return trailing/most-recent reported figures from FMP,
  not forward-looking or analyst-estimate multiples.
- No automated peer/comparable-company screening — any peer comparison
  must use companies the user explicitly names.
- Not investment advice.
