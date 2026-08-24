import type { Token } from "./types";

export type Quote = {
  usd: number;
  usd_24h_change: number;
  change1h: number;
  change7d: number;
  change30d: number;
  change1y: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  ath: number;
  atl: number;
  rank: number;
  circSupply: number;
  sparkline: number[];
};

export function emptyQuote(): Quote {
  return {
    usd: 0,
    usd_24h_change: 0,
    change1h: 0,
    change7d: 0,
    change30d: 0,
    change1y: 0,
    marketCap: 0,
    volume24h: 0,
    high24h: 0,
    low24h: 0,
    ath: 0,
    atl: 0,
    rank: 0,
    circSupply: 0,
    sparkline: [],
  };
}

function productId(token: Token) {
  return `${token.symbol}-USD`;
}

async function fetchCoinbase(tokens: Token[]): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  await Promise.all(
    tokens.map(async (t) => {
      if (!t.coingeckoId) return;
      try {
        const res = await fetch(`https://api.exchange.coinbase.com/products/${productId(t)}/stats`);
        if (!res.ok) return;
        const row = (await res.json()) as { last?: string; open?: string };
        const last = Number(row.last);
        const open = Number(row.open);
        if (!Number.isFinite(last) || last <= 0) return;
        const change = open > 0 ? ((last - open) / open) * 100 : 0;
        out[t.coingeckoId] = { ...emptyQuote(), usd: last, usd_24h_change: change };
      } catch {
        /* skip */
      }
    })
  );
  return out;
}

async function fetchGeckoSimple(tokens: Token[]): Promise<Record<string, Quote>> {
  const ids = [...new Set(tokens.map((t) => t.coingeckoId).filter(Boolean))];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}&vs_currencies=usd&include_24hr_change=true`
  );
  if (!res.ok) throw new Error("gecko");
  const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
  const out: Record<string, Quote> = {};
  for (const [id, row] of Object.entries(data)) {
    out[id] = { ...emptyQuote(), usd: row.usd ?? 0, usd_24h_change: row.usd_24h_change ?? 0 };
  }
  return out;
}

async function fetchGeckoDeep(tokens: Token[]): Promise<Record<string, Quote>> {
  const ids = [...new Set(tokens.map((t) => t.coingeckoId).filter(Boolean))];
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(","))}&sparkline=true&price_change_percentage=1h,24h,7d,30d,1y`
  );
  if (!res.ok) throw new Error("gecko");
  const rows = (await res.json()) as {
    id: string;
    current_price: number;
    price_change_percentage_24h: number;
    price_change_percentage_1h_in_currency?: number;
    price_change_percentage_7d_in_currency?: number;
    price_change_percentage_30d_in_currency?: number;
    price_change_percentage_1y_in_currency?: number;
    market_cap?: number;
    total_volume?: number;
    high_24h?: number;
    low_24h?: number;
    ath?: number;
    atl?: number;
    market_cap_rank?: number;
    circulating_supply?: number;
    sparkline_in_7d?: { price: number[] };
  }[];
  const out: Record<string, Quote> = {};
  for (const row of rows) {
    out[row.id] = {
      usd: row.current_price,
      usd_24h_change: row.price_change_percentage_24h ?? 0,
      change1h: row.price_change_percentage_1h_in_currency ?? 0,
      change7d: row.price_change_percentage_7d_in_currency ?? 0,
      change30d: row.price_change_percentage_30d_in_currency ?? 0,
      change1y: row.price_change_percentage_1y_in_currency ?? 0,
      marketCap: row.market_cap ?? 0,
      volume24h: row.total_volume ?? 0,
      high24h: row.high_24h ?? 0,
      low24h: row.low_24h ?? 0,
      ath: row.ath ?? 0,
      atl: row.atl ?? 0,
      rank: row.market_cap_rank ?? 0,
      circSupply: row.circulating_supply ?? 0,
      sparkline: row.sparkline_in_7d?.price ?? [],
    };
  }
  return out;
}

function withStables(quotes: Record<string, Quote>) {
  if (!quotes.tether?.usd) quotes.tether = { ...emptyQuote(), usd: 1, usd_24h_change: 0 };
  if (!quotes["usd-coin"]?.usd) quotes["usd-coin"] = { ...(quotes["usd-coin"] ?? emptyQuote()), usd: 1 };
  return quotes;
}

export async function fetchFastQuotes(tokens: Token[]): Promise<{ quotes: Record<string, Quote>; source: string }> {
  let quotes: Record<string, Quote> = {};
  let source = "offline";
  try {
    quotes = await fetchCoinbase(tokens);
    if (Object.keys(quotes).length) source = "Coinbase";
  } catch {
    /* next */
  }
  if (Object.keys(quotes).length < 3) {
    try {
      quotes = { ...quotes, ...(await fetchGeckoSimple(tokens)) };
      source = source === "offline" ? "CoinGecko" : `${source} + CoinGecko`;
    } catch {
      /* offline */
    }
  }
  return { quotes: withStables(quotes), source };
}

export async function fetchDeepMarket(tokens: Token[]): Promise<{ quotes: Record<string, Quote>; source: string }> {
  try {
    return { quotes: withStables(await fetchGeckoDeep(tokens)), source: "CoinGecko" };
  } catch {
    return { quotes: {}, source: "offline" };
  }
}
