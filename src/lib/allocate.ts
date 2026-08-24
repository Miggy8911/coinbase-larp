import type { Token } from "./types";

/** Typical Coinbase-looking bag: heavy BTC/ETH, then SOL, then a long tail. */
const WEIGHTS: Record<string, number> = {
  btc: 0.41,
  eth: 0.22,
  sol: 0.085,
  bnb: 0.032,
  xrp: 0.026,
  ada: 0.016,
  doge: 0.014,
  avax: 0.015,
  link: 0.014,
  sui: 0.012,
  wif: 0.006,
  pepe: 0.005,
  usdc: 0.038,
  usdt: 0.018,
};

const CASH_WEIGHT = 0.079;

const FALLBACK_PX: Record<string, number> = {
  btc: 64000,
  eth: 3100,
  sol: 145,
  bnb: 580,
  xrp: 0.52,
  ada: 0.45,
  doge: 0.12,
  avax: 28,
  link: 14,
  sui: 2.1,
  wif: 1.4,
  pepe: 1.1e-7,
  usdc: 1,
  usdt: 1,
};

function jitter(id: string, total: number) {
  const seed = [...`${id}:${Math.round(total * 100)}`].reduce((n, c) => n + c.charCodeAt(0), 0);
  return 1 + ((seed % 17) - 8) / 220;
}

function toQty(usd: number, price: number, id: string) {
  if (price <= 0) return 0;
  const raw = usd / price;
  if (id === "pepe") return Math.round(raw);
  if (id === "doge" || id === "xrp" || id === "ada") return Number(raw.toFixed(2));
  if (id === "usdc" || id === "usdt") return Number(raw.toFixed(2));
  if (price >= 1000) return Number(raw.toFixed(8));
  if (price >= 1) return Number(raw.toFixed(6));
  return Number(raw.toFixed(4));
}

export function allocatePortfolio(
  totalUsd: number,
  tokens: Token[],
  priceOf: (token: Token) => number
): { cashUsd: number; tokens: Token[] } {
  const total = Math.max(0, totalUsd);
  if (total === 0) {
    return { cashUsd: 0, tokens: tokens.map((t) => ({ ...t, amount: 0 })) };
  }

  const weighted = tokens.map((t) => {
    const w = (WEIGHTS[t.id] ?? 0.008) * jitter(t.id, total);
    return { t, w };
  });
  const cryptoWeight = weighted.reduce((s, x) => s + x.w, 0);
  const cashW = CASH_WEIGHT * jitter("usd", total);
  const norm = cryptoWeight + cashW;
  let cashUsd = Number(((total * cashW) / norm).toFixed(2));
  let spent = cashUsd;

  const next = weighted.map(({ t, w }) => {
    const px = priceOf(t) || FALLBACK_PX[t.id] || t.priceUsd || 0;
    const usd = (total * w) / norm;
    const amount = toQty(usd, px, t.id);
    const used = amount * (px || 0);
    spent += used;
    return { ...t, amount };
  });

  cashUsd = Math.max(0, Number((cashUsd + (total - spent)).toFixed(2)));
  return { cashUsd, tokens: next };
}
