/* SEC EDGAR full-text search — free, public, no API key. Endpoint/response
   shape verified live against https://efts.sec.gov/LATEST/search-index
   during this session (not from training-data memory; this endpoint is
   unversioned and undocumented in an official sense, so verifying live
   mattered more than usual). SEC's access policy requires a descriptive
   User-Agent identifying the app, not a personal contact. */

const EFTS_BASE = "https://efts.sec.gov/LATEST/search-index";
const USER_AGENT = "AnvayAI-financial-research-agent (contact: support@anvay.app)";

export type FilingResult = {
  title: string;
  formType: string;
  companyName: string;
  cik: string;
  filedAt: string;
  periodEnding: string | null;
  url: string;
};

export async function searchFilings(
  query: string,
  opts?: { forms?: string; startdt?: string; enddt?: string }
): Promise<FilingResult[]> {
  const params = new URLSearchParams({ q: query });
  if (opts?.forms) params.set("forms", opts.forms);
  if (opts?.startdt && opts?.enddt) {
    params.set("dateRange", "custom");
    params.set("startdt", opts.startdt);
    params.set("enddt", opts.enddt);
  }

  const res = await fetch(`${EFTS_BASE}?${params.toString()}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error(`SEC EDGAR search failed (${res.status})`);

  const data = (await res.json()) as {
    hits?: { hits?: Array<{ _id: string; _source: Record<string, unknown> }> };
  };
  const hits = data.hits?.hits ?? [];

  return hits.map((hit) => {
    const source = hit._source;
    const [, filename] = hit._id.split(":");
    const adsh = String(source.adsh ?? "");
    const cik = String((source.ciks as string[] | undefined)?.[0] ?? "");
    const accessionNoDashes = adsh.replace(/-/g, "");
    const cikNoLeadingZeros = cik.replace(/^0+/, "") || cik;
    const url =
      adsh && cik && filename
        ? `https://www.sec.gov/Archives/edgar/data/${cikNoLeadingZeros}/${accessionNoDashes}/${filename}`
        : "";
    return {
      title: `${String(source.form ?? "Filing")} — ${String((source.display_names as string[] | undefined)?.[0] ?? "")}`,
      formType: String(source.form ?? ""),
      companyName: String((source.display_names as string[] | undefined)?.[0] ?? ""),
      cik,
      filedAt: String(source.file_date ?? ""),
      periodEnding: source.period_ending ? String(source.period_ending) : null,
      url,
    };
  });
}
