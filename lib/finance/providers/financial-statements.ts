/* Financial Modeling Prep — income statement, balance sheet, cash flow.
   Endpoint/field names verified live against
   https://site.financialmodelingprep.com/developer/docs/stable/{income-statement,
   balance-sheet-statement,cashflow-statement} (not from training-data
   memory). Requires FMP_API_KEY in .env. Free-tier plans cap `limit` at 5
   for all three statement endpoints (confirmed live: limit=6 returns a 402
   "Premium Query Parameter" error). */

import { cached } from "./cache";

const FMP_BASE = "https://financialmodelingprep.com/stable";
const CACHE_TTL_MS = 60_000;
const DEFAULT_LIMIT = 5;

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set — check .env");
  return key;
}

async function fetchStatement(endpoint: string, symbol: string, limit: number): Promise<Array<Record<string, unknown>>> {
  return cached(`${endpoint}:${symbol}:${limit}`, CACHE_TTL_MS, async () => {
    const url = `${FMP_BASE}/${endpoint}?symbol=${encodeURIComponent(symbol)}&period=annual&limit=${limit}&apikey=${getApiKey()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${endpoint} request failed (${res.status})`);
    const data = (await res.json()) as unknown;
    return Array.isArray(data) ? (data as Array<Record<string, unknown>>) : [];
  });
}

export type IncomeStatementYear = {
  year: number;
  period: string;
  currency: string;
  revenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  operatingIncome: number;
  netIncome: number;
  ebitda: number;
  eps: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  weightedAverageShsOut: number;
};

export async function getIncomeStatement(symbol: string, limit = DEFAULT_LIMIT): Promise<IncomeStatementYear[]> {
  const rows = await fetchStatement("income-statement", symbol, limit);
  return rows.map((row) => ({
    year: Number(row.fiscalYear),
    period: String(row.period ?? "FY"),
    currency: String(row.reportedCurrency ?? "USD"),
    revenue: Number(row.revenue ?? 0),
    grossProfit: Number(row.grossProfit ?? 0),
    researchAndDevelopmentExpenses: Number(row.researchAndDevelopmentExpenses ?? 0),
    operatingIncome: Number(row.operatingIncome ?? 0),
    netIncome: Number(row.netIncome ?? 0),
    ebitda: Number(row.ebitda ?? 0),
    eps: Number(row.eps ?? 0),
    incomeBeforeTax: Number(row.incomeBeforeTax ?? 0),
    incomeTaxExpense: Number(row.incomeTaxExpense ?? 0),
    weightedAverageShsOut: Number(row.weightedAverageShsOut ?? 0),
  }));
}

export type BalanceSheetYear = {
  year: number;
  period: string;
  currency: string;
  totalAssets: number;
  totalLiabilities: number;
  totalStockholdersEquity: number;
  totalDebt: number;
  cashAndCashEquivalents: number;
};

export async function getBalanceSheet(symbol: string, limit = DEFAULT_LIMIT): Promise<BalanceSheetYear[]> {
  const rows = await fetchStatement("balance-sheet-statement", symbol, limit);
  return rows.map((row) => ({
    year: Number(row.fiscalYear),
    period: String(row.period ?? "FY"),
    currency: String(row.reportedCurrency ?? "USD"),
    totalAssets: Number(row.totalAssets ?? 0),
    totalLiabilities: Number(row.totalLiabilities ?? 0),
    totalStockholdersEquity: Number(row.totalStockholdersEquity ?? 0),
    totalDebt: Number(row.totalDebt ?? 0),
    cashAndCashEquivalents: Number(row.cashAndCashEquivalents ?? 0),
  }));
}

export type CashFlowYear = {
  year: number;
  period: string;
  currency: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
};

export async function getCashFlowStatement(symbol: string, limit = DEFAULT_LIMIT): Promise<CashFlowYear[]> {
  const rows = await fetchStatement("cash-flow-statement", symbol, limit);
  return rows.map((row) => ({
    year: Number(row.fiscalYear),
    period: String(row.period ?? "FY"),
    currency: String(row.reportedCurrency ?? "USD"),
    operatingCashFlow: Number(row.operatingCashFlow ?? 0),
    capitalExpenditure: Number(row.capitalExpenditure ?? 0),
    freeCashFlow: Number(row.freeCashFlow ?? 0),
  }));
}

/* Kept for the existing get_financials tool (AGENTS.md Phase 3) — merges
   income statement + balance-sheet equity into one per-year record. */
export type YearFinancials = {
  year: number;
  period: string;
  currency: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  shareholderEquity: number | null;
};

export async function getAnnualFinancials(symbol: string, limit = DEFAULT_LIMIT): Promise<YearFinancials[]> {
  const [income, balance] = await Promise.all([getIncomeStatement(symbol, limit), getBalanceSheet(symbol, limit)]);
  const equityByYear = new Map<number, number>();
  for (const row of balance) equityByYear.set(row.year, row.totalStockholdersEquity);

  return income.map((row) => ({
    year: row.year,
    period: row.period,
    currency: row.currency,
    revenue: row.revenue,
    grossProfit: row.grossProfit,
    operatingIncome: row.operatingIncome,
    netIncome: row.netIncome,
    shareholderEquity: equityByYear.get(row.year) ?? null,
  }));
}
