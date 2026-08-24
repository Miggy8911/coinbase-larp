export type PriceMap = Record<string, { usd: number; usd_24h_change: number }>;

export async function fetchPrices(ids: string[]): Promise<PriceMap> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return {};
  const res = await fetch(`/api/prices?ids=${encodeURIComponent(unique.join(","))}`);
  if (!res.ok) throw new Error("Price fetch failed");
  return res.json();
}
