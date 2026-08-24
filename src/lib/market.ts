import type { Token } from "./types";

export type Quote = {
  usd: number;
  usd_24h_change: number;
  sparkline: number[];
};

export type MarketSnapshot = {
  quotes: Record<string, Quote>;
  source: string;
  chainHint: string;
};

const SOL_MINT = "So11111111111111111111111111111111111111112";

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
  const rows = (await res.json()) as {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
  }[];
  const bySym = Object.fromEntries(tokens.filter((t) => t.binanceSymbol).map((t) => [t.binanceSymbol, t]));
  const out: Record<string, Quote> = {};
  for (const row of rows) {
    const token = bySym[row.symbol];
    if (!token) continue;
    out[token.coingeckoId] = {
      usd: Number(row.lastPrice),
      usd_24h_change: Number(row.priceChangePercent),
      sparkline: [],
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
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids.join(","))}&sparkline=true&price_change_percentage=24h`
  );
  if (!res.ok) throw new Error("gecko");
  const rows = (await res.json()) as {
    id: string;
    current_price: number;
    price_change_percentage_24h: number;
    sparkline_in_7d?: { price: number[] };
  }[];
  const out: Record<string, Quote> = {};
  for (const row of rows) {
    const spark = row.sparkline_in_7d?.price ?? [];
    out[row.id] = {
      usd: row.current_price,
      usd_24h_change: row.price_change_percentage_24h ?? 0,
      sparkline: spark.slice(-24),
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
    Object.assign(quotes, await fetchBinance(tokens));
    if (Object.keys(quotes).length) sources.push("Binance");
  } catch {
    /* next */
  }

  try {
    const gecko = await fetchGecko(tokens);
    for (const [id, q] of Object.entries(gecko)) {
        const prev = quotes[id];
        quotes[id] = {
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
    quotes.tether = { usd: 1, usd_24h_change: 0, sparkline: [] };
  }
  if (!quotes["usd-coin"]) {
    quotes["usd-coin"] = { usd: 1, usd_24h_change: 0, sparkline: [] };
  }

  const chainHint = await fetchChainHint();
  return {
    quotes,
    source: sources.join(" + ") || "offline",
    chainHint,
  };
}
