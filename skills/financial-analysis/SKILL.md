# Financial Analysis

## Purpose
General-purpose analysis of a single company's financial performance over
time — revenue, profitability, and overall financial health trends.

## When to use
The user asks to "analyze" a company's financials, revenue, profitability,
or general performance, without specifically asking for a valuation
(`valuation-analysis`) or a specific earnings period (`earnings-analysis`).

Examples: "Analyze Apple's revenue growth.", "How healthy is Nvidia's
balance sheet?", "What's Microsoft's profitability trend looked like?"

## Required information
- Company name or ticker symbol.
- A year range or number of years, if the user cares about a trend
  (default to whatever years the data provider returns if unspecified).

## Recommended workflow
1. Identify the company with `get_company_profile`.
2. Retrieve `get_income_statement` (and `get_balance_sheet` / `get_cash_flow`
   if the question touches financial health or liquidity) for the relevant
   years.
3. For every trend or change you intend to describe, call `calculate_metric`
   for that exact year pair — never estimate it yourself.
4. If the user asks about recent developments behind a trend, use
   `search_news`.
5. Present findings with facts, calculations, and analysis clearly
   separated, each figure cited to its source.

## Relevant tools
- `get_company_profile`
- `get_income_statement`, `get_balance_sheet`, `get_cash_flow`, `get_financials`
- `calculate_metric`
- `search_news`, `search_web`

## Required calculations
- Year-over-year growth for revenue, net income, and operating income as
  relevant to the question.
- Multi-year CAGR when the user asks about a trend across 3+ years.
- Margin figures (gross/operating/net) when profitability is in question.

All calculations must go through `calculate_metric` — never compute them
in prose.

## Evidence requirements
Every figure in the answer must come from a tool result. Do not estimate,
round from memory, or fill in a missing year with a guess.

## Citation requirements
Name the data provider (e.g. Financial Modeling Prep, SEC EDGAR) backing
each reported figure. If a figure has no traceable source, say so instead
of citing one anyway.

## Output structure
1. **Facts** — the raw figures retrieved, with years and source.
2. **Calculations** — the deterministic results (growth rates, CAGR,
   margins) with the tool-computed values.
3. **Analysis** — your interpretation of what the trend means, clearly
   marked as interpretation rather than fact.
4. **Sources** — a short list of what was cited.

## Limitations
- Statement data is limited to whatever years the provider actually
  returns (the free tier typically caps at 5 most recent fiscal years) —
  do not claim data for years outside that range.
- No coverage for private companies or tickers the provider doesn't track.
- This is historical analysis only, not a forecast or investment
  recommendation.
