import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number, digits = 2) {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** Full Coinbase-style cash amount. Never compact to $2.88M. */
export function formatBalance(value: number) {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatAmount(value: number) {
  if (value === 0) return "0";
  if (value >= 1_000_000) return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (value >= 1) return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return value.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function truncateAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function formatPrice(value: number) {
  if (!Number.isFinite(value)) return "$0.00";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1) {
    return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (abs >= 0.01) return `${sign}$${abs.toFixed(4)}`;
  return `${sign}$${Number(abs.toPrecision(3))}`;
}

export function formatPct(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return formatUsd(value);
}

export function sliceSpark(points: number[], fraction: number) {
  if (points.length < 2) return points;
  const n = Math.max(2, Math.floor(points.length * fraction));
  return points.slice(-n);
}

export function portfolioSeries(tokens: { amount: number; priceUsd: number; sparkline: number[] }[], cashUsd: number, len = 48) {
  const series = Array.from({ length: len }, () => cashUsd);
  for (const t of tokens) {
    const s = t.sparkline;
    for (let i = 0; i < len; i++) {
      const px = s.length
        ? s[Math.min(s.length - 1, Math.floor((i / (len - 1)) * (s.length - 1)))]
        : t.priceUsd;
      series[i] += t.amount * px;
    }
  }
  return series;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
