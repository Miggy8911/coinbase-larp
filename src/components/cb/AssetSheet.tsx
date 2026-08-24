"use client";

import { AreaChart } from "../Sparkline";
import { SmoothUsd } from "../SmoothUsd";
import { TokenGlyph } from "../TokenGlyph";
import { mixChart, useLiveTrail } from "@/lib/chart-trail";
import { useApp } from "@/lib/app-context";
import { useHoldings } from "@/lib/quotes-store";
import { cn, formatCompact, formatPct, formatPrice, sliceSpark } from "@/lib/utils";

export function AssetSheet() {
  const { state, assetId, setOverlay } = useApp();
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const t = tokens.find((x) => x.id === assetId);
  const pxTrail = useLiveTrail(t?.priceUsd ?? 0, assetId ?? "none", t?.change24h ?? 0);
  if (!t) return null;
  const neg = t.change24h < 0;
  const color = neg ? "#F0616D" : "#3DDC97";
  const held = t.amount * t.priceUsd;
  const chart = mixChart(sliceSpark(t.sparkline, 1), pxTrail, t.sparkline.length > 8 ? 0.38 : 1);
  const stats: [string, string][] = [
    ["Market cap", t.marketCap ? formatCompact(t.marketCap) : "—"],
    ["Volume (24h)", t.volume24h ? formatCompact(t.volume24h) : "—"],
    ["Circulating", t.circSupply ? t.circSupply.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—"],
    ["Popularity", t.rank ? `#${t.rank}` : "—"],
    ["24h high", t.high24h ? formatPrice(t.high24h) : "—"],
    ["24h low", t.low24h ? formatPrice(t.low24h) : "—"],
    ["All-time high", t.ath ? formatPrice(t.ath) : "—"],
    ["All-time low", t.atl ? formatPrice(t.atl) : "—"],
  ];
  return (
    <div className="scroll flex-1 px-4 pb-8">
      <div className="flex items-center gap-3">
        <TokenGlyph symbol={t.symbol} color={t.color} size={44} />
        <div>
          <p className="text-[13px] text-white/50">{t.name}</p>
          <p className="text-[22px] font-semibold">{t.symbol}</p>
        </div>
      </div>
      <p className="mt-5 text-[36px] font-semibold tracking-tight">
        <SmoothUsd value={t.priceUsd} compact={false} />
      </p>
      <p className={cn("text-[15px] font-medium tabular-nums", neg ? "text-[#F0616D]" : "text-[#3DDC97]")}>
        {formatPct(t.change24h)} · 24h
      </p>
      <div className="mt-3">
        <AreaChart points={chart} color={color} height={140} />
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-white/40 tabular-nums">
        <span>1H {formatPct(t.change1h)}</span>
        <span>1W {formatPct(t.change7d)}</span>
        <span>1M {formatPct(t.change30d)}</span>
        <span>1Y {formatPct(t.change1y)}</span>
      </div>

      <div className="mt-5 rounded-2xl bg-[#16181D] p-4">
        <p className="text-[12px] text-white/45">Your balance</p>
        <p className="text-[22px] font-semibold">
          <SmoothUsd value={held} />
        </p>
        <p className="text-[13px] text-white/45 tabular-nums">
          {t.amount.toLocaleString("en-US", { maximumFractionDigits: 6 })} {t.symbol}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setOverlay("buy")}
          className="tap h-12 rounded-full bg-[#0052FF] text-[14px] font-semibold"
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setOverlay("sell")}
          className="tap h-12 rounded-full bg-[#1C1F26] text-[14px] font-semibold"
        >
          Sell
        </button>
      </div>

      <p className="mt-6 text-[16px] font-semibold">Market stats</p>
      <ul className="mt-2 divide-y divide-white/5">
        {stats.map(([k, v]) => (
          <li key={k} className="flex items-center justify-between py-3 text-[14px]">
            <span className="text-white/50">{k}</span>
            <span className="font-medium tabular-nums">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
