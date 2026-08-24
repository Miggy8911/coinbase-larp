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

function emptyQuote(): Quote {
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

export type MarketSnapshot = {
  quotes: Record<string, Quote>;
  source: string;
  chainHint: string;
};

const SOL_MINT = "So11111111111111111111111111111111111111112";

async function fetchCoinbase(tokens: Token[]): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  await Promise.all(
    tokens.map(async (t) => {
      if (!t.coingeckoId || t.coingeckoId === "tether") return;
      const product = `${t.symbol}-USD`;
      try {
        const res = await fetch(`https://api.exchange.coinbase.com/products/${product}/stats`);
        if (!res.ok) return;
        const row = (await res.json()) as { last?: string; open?: string };
        const last = Number(row.last);
        const open = Number(row.open);
        if (!Number.isFinite(last)) return;
        const change = Number.isFinite(open) && open > 0 ? ((last - open) / open) * 100 : 0;
        out[t.coingeckoId] = { ...emptyQuote(), usd: last, usd_24h_change: change };
      } catch {
        /* skip */
      }
    })
  );
  return out;
}

async function fetchBinance(tokens: Token[]): Promise<Record<string, Quote>> {
  const symbols = tokens
    .map((t) => t.binanceSymbol)
    .filter((s): s is string => Boolean(s) && s !== "USDTTRY");
  if (symbols.length === 0) return {};
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(
    JSON.stringify(symbols)
  )}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("binance");
  const rows = (await res.json()) as
    | { symbol: string; lastPrice: string; priceChangePercent: string }[]
    | { code?: number };
  if (!Array.isArray(rows)) throw new Error("binance");
  const bySym = Object.fromEntries(tokens.filter((t) => t.binanceSymbol).map((t) => [t.binanceSymbol, t]));
  const out: Record<string, Quote> = {};
  for (const row of rows) {
    const token = bySym[row.symbol];
    if (!token) continue;
    out[token.coingeckoId] = {
      ...emptyQuote(),
      usd: Number(row.lastPrice),
      usd_24h_change: Number(row.priceChangePercent),
    };
  }
  return out;
}

async function fetchSparklines(tokens: Token[]): Promise<Record<string, number[]>> {
  const majors = tokens.filter((t) => t.binanceSymbol && ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT", "ADAUSDT", "LINKUSDT"].includes(t.binanceSymbol));
  const entries = await Promise.all(
    majors.map(async (t) => {
      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${t.binanceSymbol}&interval=1h&limit=24`
        );
        if (!res.ok) return [t.coingeckoId, []] as const;
        const klines = (await res.json()) as [number, string, string, string, string][];
        return [t.coingeckoId, klines.map((k) => Number(k[4]))] as const;
      } catch {
        return [t.coingeckoId, []] as const;
      }
    })
  );
  return Object.fromEntries(entries);
}

async function fetchGecko(tokens: Token[]): Promise<Record<string, Quote>> {
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
    const spark = row.sparkline_in_7d?.price ?? [];
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
      sparkline: spark,
    };
  }
  return out;
}

async function fetchJupiterSol(): Promise<number | null> {
  try {
    const res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${SOL_MINT}`);
    if (!res.ok) return null;
    const data = await res.json();
    const px = Number(data?.data?.[SOL_MINT]?.price);
    return Number.isFinite(px) ? px : null;
  } catch {
    return null;
  }
}

async function fetchChainHint(): Promise<string> {
  try {
    const res = await fetch("https://solana-rpc.publicnode.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    if (typeof data.result === "number") return `Solana slot ${data.result.toLocaleString()}`;
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch("https://eth.llamarpc.com", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber" }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const n = parseInt(data.result, 16);
    if (Number.isFinite(n)) return `ETH block ${n.toLocaleString()}`;
  } catch {
    /* ignore */
  }
  return "";
}

export async function fetchMarket(tokens: Token[]): Promise<MarketSnapshot> {
  const quotes: Record<string, Quote> = {};
  const sources: string[] = [];

  try {
    Object.assign(quotes, await fetchCoinbase(tokens));
    if (Object.keys(quotes).length) sources.push("Coinbase");
  } catch {
    /* next */
  }

  try {
    Object.assign(quotes, await fetchBinance(tokens));
    if (Object.keys(quotes).length && !sources.includes("Binance")) sources.push("Binance");
  } catch {
    /* next */
  }

  try {
    const gecko = await fetchGecko(tokens);
    for (const [id, q] of Object.entries(gecko)) {
        const prev = quotes[id];
        quotes[id] = {
          ...(prev ?? emptyQuote()),
          ...q,
          usd: prev?.usd || q.usd,
          usd_24h_change: prev?.usd_24h_change ?? q.usd_24h_change ?? 0,
          sparkline: q.sparkline.length ? q.sparkline : prev?.sparkline ?? [],
        };
    }
    sources.push("CoinGecko");
  } catch {
    /* next */
  }

  const sol = await fetchJupiterSol();
  if (sol) {
    const prev = quotes.solana;
    quotes.solana = {
      ...(prev ?? emptyQuote()),
      usd: sol,
      usd_24h_change: prev?.usd_24h_change ?? 0,
      sparkline: prev?.sparkline ?? [],
    };
    sources.push("Jupiter");
  }

  if (!Object.values(quotes).some((q) => q.sparkline.length)) {
    try {
      const sparks = await fetchSparklines(tokens);
      for (const [id, spark] of Object.entries(sparks)) {
        if (!quotes[id]) continue;
        quotes[id] = { ...quotes[id], sparkline: spark };
      }
    } catch {
      /* ignore */
    }
  }

  // USDT ~ $1 if missing
  if (!quotes.tether) {
    quotes.tether = { ...emptyQuote(), usd: 1 };
  }
  if (!quotes["usd-coin"]) {
    quotes["usd-coin"] = { ...emptyQuote(), usd: 1 };
  }

  const chainHint = await fetchChainHint();
  return {
    quotes,
    source: sources.join(" + ") || "offline",
    chainHint,
  };
}
