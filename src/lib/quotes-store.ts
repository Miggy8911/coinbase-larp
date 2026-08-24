"use client";

import { useMemo, useSyncExternalStore } from "react";
import { emptyQuote, type Quote } from "./market";
import type { Token } from "./types";

export type Tick = { usd: number; usd_24h_change?: number };

type Snapshot = {
  byId: Record<string, Quote>;
  liveAt: Record<string, number>;
  live: boolean;
  source: string;
  sparkGen: number;
  version: number;
};

let snap: Snapshot = {
  byId: {},
  liveAt: {},
  live: false,
  source: "connecting",
  sparkGen: 0,
  version: 0,
};

const listeners = new Set<() => void>();

function emit(next: Snapshot) {
  snap = next;
  listeners.forEach((fn) => fn());
}

export function subscribeQuotes(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getQuotes() {
  return snap;
}

export function seedQuotesFromTokens(tokens: Token[]) {
  const byId: Record<string, Quote> = { ...snap.byId };
  for (const t of tokens) {
    if (!t.coingeckoId) continue;
    const prev = byId[t.coingeckoId] ?? emptyQuote();
    byId[t.coingeckoId] = {
      ...prev,
      usd: t.priceUsd || prev.usd,
      usd_24h_change: t.change24h || prev.usd_24h_change,
      change1h: t.change1h || prev.change1h,
      change7d: t.change7d || prev.change7d,
      change30d: t.change30d || prev.change30d,
      change1y: t.change1y || prev.change1y,
      marketCap: t.marketCap || prev.marketCap,
      volume24h: t.volume24h || prev.volume24h,
      high24h: t.high24h || prev.high24h,
      low24h: t.low24h || prev.low24h,
      ath: t.ath || prev.ath,
      atl: t.atl || prev.atl,
      rank: t.rank || prev.rank,
      circSupply: t.circSupply || prev.circSupply,
      sparkline: t.sparkline.length ? t.sparkline : prev.sparkline,
    };
  }
  emit({ ...snap, byId, version: snap.version + 1, sparkGen: snap.sparkGen + 1 });
}

let lastSparkAt = 0;

export function applyTicks(ticks: Record<string, Tick>) {
  const now = Date.now();
  const doSpark = now - lastSparkAt >= 180;
  let changed = false;
  const byId = snap.byId;
  const liveAt = snap.liveAt;
  let nextBy = byId;
  let nextLive = liveAt;
  for (const [id, tick] of Object.entries(ticks)) {
    if (!Number.isFinite(tick.usd) || tick.usd <= 0) continue;
    const prev = (nextBy === byId ? byId[id] : nextBy[id]) ?? emptyQuote();
    if (prev.usd === tick.usd && (tick.usd_24h_change === undefined || tick.usd_24h_change === prev.usd_24h_change)) {
      continue;
    }
    if (nextBy === byId) nextBy = { ...byId };
    if (nextLive === liveAt) nextLive = { ...liveAt };
    const spark = !doSpark
      ? prev.sparkline
      : prev.sparkline.length
        ? [...prev.sparkline.slice(-159), tick.usd]
        : [tick.usd];
    nextBy[id] = {
      ...prev,
      usd: tick.usd,
      usd_24h_change: tick.usd_24h_change ?? prev.usd_24h_change,
      sparkline: spark,
    };
    nextLive[id] = now;
    changed = true;
  }
  if (!changed) return;
  if (doSpark) lastSparkAt = now;
  emit({ ...snap, byId: nextBy, liveAt: nextLive, version: snap.version + 1 });
}

export function applyRest(quotes: Record<string, Quote>, mode: "fast" | "deep") {
  const now = Date.now();
  let changed = false;
  let sparkChanged = false;
  const byId = { ...snap.byId };
  for (const [id, q] of Object.entries(quotes)) {
    const prev = byId[id] ?? emptyQuote();
    const recent = (snap.liveAt[id] ?? 0) > now - 10_000;
    const next: Quote = { ...prev };
    if (!recent && q.usd > 0) next.usd = q.usd;
    if (!recent && q.usd_24h_change) next.usd_24h_change = q.usd_24h_change;
    if (mode === "deep") {
      if (q.change1h) next.change1h = q.change1h;
      if (q.change7d) next.change7d = q.change7d;
      if (q.change30d) next.change30d = q.change30d;
      if (q.change1y) next.change1y = q.change1y;
      if (q.marketCap) next.marketCap = q.marketCap;
      if (q.volume24h) next.volume24h = q.volume24h;
      if (q.high24h) next.high24h = q.high24h;
      if (q.low24h) next.low24h = q.low24h;
      if (q.ath) next.ath = q.ath;
      if (q.atl) next.atl = q.atl;
      if (q.rank) next.rank = q.rank;
      if (q.circSupply) next.circSupply = q.circSupply;
      if (q.sparkline.length) {
        next.sparkline = q.sparkline;
        sparkChanged = true;
      }
    }
    if (
      next.usd === prev.usd &&
      next.usd_24h_change === prev.usd_24h_change &&
      next.change1h === prev.change1h &&
      next.sparkline === prev.sparkline &&
      next.marketCap === prev.marketCap &&
      next.rank === prev.rank
    ) {
      continue;
    }
    byId[id] = next;
    changed = true;
  }
  if (!changed) return;
  emit({
    ...snap,
    byId,
    sparkGen: sparkChanged ? snap.sparkGen + 1 : snap.sparkGen,
    version: snap.version + 1,
  });
}

export function setFeedStatus(live: boolean, source: string) {
  if (snap.live === live && snap.source === source) return;
  emit({ ...snap, live, source, version: snap.version + 1 });
}

export function useQuotes() {
  return useSyncExternalStore(subscribeQuotes, getQuotes, getQuotes);
}

export function mergeToken(token: Token, quote?: Quote): Token {
  if (!quote) return token;
  return {
    ...token,
    priceUsd: quote.usd || token.priceUsd,
    change24h: quote.usd_24h_change || token.change24h,
    change1h: quote.change1h || token.change1h,
    change7d: quote.change7d || token.change7d,
    change30d: quote.change30d || token.change30d,
    change1y: quote.change1y || token.change1y,
    marketCap: quote.marketCap || token.marketCap,
    volume24h: quote.volume24h || token.volume24h,
    high24h: quote.high24h || token.high24h,
    low24h: quote.low24h || token.low24h,
    ath: quote.ath || token.ath,
    atl: quote.atl || token.atl,
    rank: quote.rank || token.rank,
    circSupply: quote.circSupply || token.circSupply,
    sparkline: quote.sparkline.length ? quote.sparkline : token.sparkline,
  };
}

export function livePrice(token: Token) {
  return getQuotes().byId[token.coingeckoId]?.usd || token.priceUsd;
}

export function useHoldings(tokens: Token[], cashUsd: number) {
  const quotes = useQuotes();
  return useMemo(() => {
    const live = tokens.map((t) => mergeToken(t, quotes.byId[t.coingeckoId]));
    const tokenUsd = live.reduce((sum, t) => sum + t.amount * t.priceUsd, 0);
    const dayChangeUsd = live.reduce((sum, t) => sum + t.amount * t.priceUsd * (t.change24h / 100), 0);
    return {
      tokens: live,
      tokenUsd,
      totalUsd: tokenUsd + cashUsd,
      dayChangeUsd,
      dayChangePct: tokenUsd > 0 ? (dayChangeUsd / tokenUsd) * 100 : 0,
      pricesLive: quotes.live,
      marketSource: quotes.source,
      sparkGen: quotes.sparkGen,
    };
  }, [tokens, cashUsd, quotes]);
}
