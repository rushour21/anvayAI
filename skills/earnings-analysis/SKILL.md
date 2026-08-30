# Earnings Analysis

## Purpose
Analyze a company's reported earnings for a period — revenue/profit
results, period-over-period change, and market reaction/context.

## When to use
The user asks about a specific earnings release or reporting period rather
than a general trend (`financial-analysis`), a broad research rundown
(`equity-research`), or a pure valuation question (`valuation-analysis`).

Examples: "How were Apple's earnings?", "Analyze Nvidia's latest quarter.",
"Did Microsoft beat expectations?"

## Required information
- Company name or ticker symbol.
- The period in question, if the user specified one (default to the most
  recent reported period if unspecified).

## Recommended workflow
1. Identify the company with `get_company_profile`.
2. Retrieve `get_income_statement` (and `get_cash_flow` / `get_balance_sheet`
   if relevant) for the period(s) in question.
3. Call `calculate_metric` for YoY/QoQ growth in revenue, net income, and
   margins.
4. Search for the earnings release, analyst reaction, and guidance
   commentary with `search_news`.
5. If the user wants the primary source, use `search_filings` for the
   relevant 10-Q/10-K.
6. Present reported facts, calculations, and market/analyst reaction
   clearly separated from your own analysis.

## Relevant tools
- `get_company_profile`
- `get_income_statement`, `get_cash_flow`, `get_balance_sheet`
- `calculate_metric`
- `search_news`, `search_filings`

## Required calculations
YoY and QoQ growth for revenue and net income, and margin changes, all via
`calculate_metric` — never computed in prose.

## Evidence requirements
Every figure must come from a tool result. Do not estimate, round from
memory, or fill in a missing figure with a guess.

## Citation requirements
Cite Financial Modeling Prep or SEC EDGAR for financial figures, and name
the specific news source for any market/analyst reaction commentary.

## Output structure
1. **Reported figures (facts)** — the raw figures for the period, cited.
2. **Period-over-period calculations** — YoY/QoQ growth and margin changes.
3. **Market/analyst reaction (research)** — what search found, cited.
4. **Analysis** — interpretation, clearly marked as such.
5. **Sources** — a short list of what was cited.

## Limitations
- This app has no consensus-estimate data — never claim a company "beat
  expectations" (or missed them) unless a search result actually reports
  that; never fabricate a consensus estimate figure.
- Statement data is limited to whatever periods the provider returns.
- This is historical analysis only, not a forecast or investment
  recommendation.
