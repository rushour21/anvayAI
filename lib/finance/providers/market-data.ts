/* Financial Modeling Prep — market data (quote, historical prices, market
   cap). Endpoint/field names verified live against
   https://site.financialmodelingprep.com/developer/docs/stable/{quote,
   historical-price-eod-full,market-cap} (not from training-data memory).
   Requires FMP_API_KEY in .env. */

import { cached } from "./cache";

const FMP_BASE = "https://financialmodelingprep.com/stable";
const CACHE_TTL_MS = 60_000;

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set — check .env");
  return key;
}

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  marketCap: number;
  exchange: string;
};

export async function getQuote(symbol: string): Promise<Quote | null> {
  return cached(`quote:${symbol}`, CACHE_TTL_MS, async () => {
    const url = `${FMP_BASE}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${getApiKey()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Market data request failed (${res.status})`);
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return null;
    return {
      symbol: String(row.symbol),
      name: String(row.name ?? row.symbol),
      price: Number(row.price),
      currency: "USD",
      change: Number(row.change ?? 0),
      changePercent: Number(row.changePercentage ?? 0),
      marketCap: Number(row.marketCap ?? 0),
      exchange: String(row.exchange ?? ""),
    };
  });
}

export type HistoricalPricePoint = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent: number;
};

/** `from`/`to` as YYYY-MM-DD; omit for FMP's default recent-history window. */
export async function getHistoricalPrices(
  symbol: string,
  from?: string,
  to?: string
): Promise<HistoricalPricePoint[]> {
  return cached(`history:${symbol}:${from ?? ""}:${to ?? ""}`, CACHE_TTL_MS, async () => {
    const params = new URLSearchParams({ symbol, apikey: getApiKey() });
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const res = await fetch(`${FMP_BASE}/historical-price-eod/full?${params.toString()}`);
    if (!res.ok) throw new Error(`Historical price request failed (${res.status})`);
    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data)) return [];
    return data.map((row) => ({
      date: String(row.date),
      open: Number(row.open ?? 0),
      high: Number(row.high ?? 0),
      low: Number(row.low ?? 0),
      close: Number(row.close ?? 0),
      volume: Number(row.volume ?? 0),
      changePercent: Number(row.changePercent ?? 0),
    }));
  });
}

export type MarketCap = {
  symbol: string;
  date: string;
  marketCap: number;
};

export async function getMarketCap(symbol: string): Promise<MarketCap | null> {
  return cached(`marketcap:${symbol}`, CACHE_TTL_MS, async () => {
    const url = `${FMP_BASE}/market-capitalization?symbol=${encodeURIComponent(symbol)}&apikey=${getApiKey()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Market cap request failed (${res.status})`);
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return null;
    return {
      symbol: String(row.symbol),
      date: String(row.date),
      marketCap: Number(row.marketCap ?? 0),
    };
  });
}
