export type PriceMap = Record<string, { usd: number; usd_24h_change: number }>;

export async function fetchPrices(ids: string[]): Promise<PriceMap> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const qs = encodeURIComponent(unique.join(","));
  const gecko = `https://api.coingecko.com/api/v3/simple/price?ids=${qs}&vs_currencies=usd&include_24hr_change=true`;
  try {
    const res = await fetch(gecko);
    if (res.ok) return res.json();
  } catch {
    /* native / CORS fallback */
  }
  try {
    const res = await fetch(`/api/prices?ids=${qs}`);
    if (res.ok) return res.json();
  } catch {
    /* ignore */
  }
  return {};
}
