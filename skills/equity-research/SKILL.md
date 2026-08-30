# Equity Research

## Purpose
Broad equity research on a single company — combining fundamentals, market
data, valuation context, and recent news into one investor-facing rundown.

## When to use
The user asks for a general research rundown on a company rather than a
narrower financial-health trend (`financial-analysis`), a valuation-specific
question (`valuation-analysis`), or a specific earnings period
(`earnings-analysis`).

Examples: "Research Apple.", "Give me a rundown on Nvidia.", "What's the
investment case for Microsoft?"

## Required information
- Company name or ticker symbol.

## Recommended workflow
1. Identify the company with `get_company_profile`.
2. Retrieve current market data with `get_stock_price` and `get_market_cap`.
3. Retrieve recent financial trend with `get_financials` or
   `get_income_statement`.
4. Retrieve valuation context with `get_pe` and `get_margins`.
5. Search for recent catalysts and developments with `search_news`.
6. If the user wants filing-specific detail, use `search_filings`.
7. Synthesize a business overview, financial snapshot, valuation snapshot,
   and recent news, each figure cited to its source.

## Relevant tools
- `get_company_profile`
- `get_stock_price`, `get_market_cap`
- `get_financials`, `get_pe`, `get_margins`
- `search_news`, `search_filings`, `search_web`

## Required calculations
Use `calculate_metric` for any derived figure not already returned directly
by a ratio tool (e.g. a growth rate or margin change you want to describe).

## Evidence requirements
Every figure in the answer must come from a tool result. Do not estimate,
round from memory, or fill in a missing figure with a guess.

## Citation requirements
Name the data provider (e.g. Financial Modeling Prep, SEC EDGAR) or news
source backing each figure. If a figure has no traceable source, say so
instead of citing one anyway.

## Output structure
1. **Company overview** — what the business does, sector/industry.
2. **Financial snapshot** — recent revenue/profitability figures, cited.
3. **Valuation snapshot** — current multiples and market data, cited.
4. **Recent developments** — news/catalysts found via search, cited.
5. **Sources** — a short list of what was cited.

## Limitations
- Not investment advice; this is a factual rundown, not a recommendation.
- Data reflects the moment of retrieval only, not a forecast.
- No proprietary analyst estimates or ratings.
- No automated peer/comparable-company screening — any peer comparison
  must use companies the user explicitly names.
