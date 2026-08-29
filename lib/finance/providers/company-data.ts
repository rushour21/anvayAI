/* Financial Modeling Prep — company profile. Endpoint/field names verified
   live against https://site.financialmodelingprep.com/developer/docs/stable/profile-symbol
   (not from training-data memory). Requires FMP_API_KEY in .env. */

import { cached } from "./cache";

const FMP_BASE = "https://financialmodelingprep.com/stable";
const CACHE_TTL_MS = 60_000;

function getApiKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key) throw new Error("FMP_API_KEY is not set — check .env");
  return key;
}

export type CompanyProfile = {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  website: string;
  ceo: string;
  country: string;
};

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  return cached(`profile:${symbol}`, CACHE_TTL_MS, async () => {
    const url = `${FMP_BASE}/profile?symbol=${encodeURIComponent(symbol)}&apikey=${getApiKey()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Company profile request failed (${res.status})`);
    const data = (await res.json()) as Array<Record<string, unknown>>;
    const row = Array.isArray(data) ? data[0] : null;
    if (!row) return null;
    return {
      symbol: String(row.symbol),
      name: String(row.companyName ?? row.symbol),
      sector: String(row.sector ?? ""),
      industry: String(row.industry ?? ""),
      description: String(row.description ?? ""),
      website: String(row.website ?? ""),
      ceo: String(row.ceo ?? ""),
      country: String(row.country ?? ""),
    };
  });
}
