"use client";

import { useMemo, useState } from "react";
import { Bell, QrCode, Search } from "lucide-react";
import { CoinbaseMark } from "../CoinbaseMark";
import { AreaChart, Sparkline } from "../Sparkline";
import { TokenGlyph } from "../TokenGlyph";
import { useApp } from "@/lib/app-context";
import { cn, formatPct, formatUsd, portfolioSeries, sliceSpark } from "@/lib/utils";

const PERIODS = [
  { id: "1H", frac: 1 / 168, change: "change1h" as const },
  { id: "1D", frac: 24 / 168, change: "change24h" as const },
  { id: "1W", frac: 1, change: "change7d" as const },
  { id: "1M", frac: 1, change: "change30d" as const },
  { id: "1Y", frac: 1, change: "change1y" as const },
  { id: "ALL", frac: 1, change: "change1y" as const },
];

export function HomeTab() {
  const {
    state,
    totalUsd,
    dayChangePct,
    dayChangeUsd,
    setOverlay,
    setTab,
    openAsset,
    pricesLive,
    marketSource,
  } = useApp();
  const [period, setPeriod] = useState("1D");
  const name = state.account?.firstName ?? "there";
  const meta = PERIODS.find((p) => p.id === period) ?? PERIODS[1];
  const series = useMemo(() => {
    const full = portfolioSeries(state.tokens, state.cashUsd, 64);
    return sliceSpark(full, meta.id === "1H" ? 0.08 : meta.id === "1D" ? 0.2 : 1);
  }, [state.tokens, state.cashUsd, meta.id]);
  const periodChange =
    meta.change === "change24h"
      ? dayChangePct
      : state.tokens.reduce((s, t) => {
          const w = t.amount * t.priceUsd;
          return s + w * ((t[meta.change] ?? 0) / 100);
        }, 0) / Math.max(1, totalUsd - state.cashUsd) * 100;
  const down = periodChange < 0;
  const line = down ? "#F0616D" : "#3DDC97";
  const movers = [...state.tokens].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 5);

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-5">
      <header className="flex items-center justify-between px-4 pt-2">
        <CoinbaseMark size={32} />
        <div className="flex items-center gap-3">
          {state.showDisclaimers && (
            <span className="text-[11px] text-white/40">{pricesLive ? marketSource : "offline"}</span>
          )}
          <button type="button" className="text-white/80" aria-label="Search">
            <Search size={20} />
          </button>
          <button type="button" onClick={() => setOverlay("receive")} className="text-white/80">
            <QrCode size={20} />
          </button>
          <button type="button" onClick={() => setOverlay("profile")} className="text-white/80">
            <Bell size={20} />
          </button>
          <button
            type="button"
            onClick={() => setOverlay("profile")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052FF] text-[13px] font-semibold"
          >
            {name.slice(0, 1)}
          </button>
        </div>
      </header>

      <p className="mt-4 px-4 text-[13px] text-white/50">Your balance</p>
      <p className="px-4 text-[40px] font-semibold leading-none tracking-tight">{formatUsd(totalUsd)}</p>
      <p className={cn("mt-2 px-4 text-[15px] font-medium", down ? "text-[#F0616D]" : "text-[#3DDC97]")}>
        {formatUsd(meta.id === "1D" ? dayChangeUsd : (totalUsd * periodChange) / 100)} ({formatPct(periodChange)})
      </p>

      <div className="mt-3">
        <AreaChart points={series} color={line} height={152} />
      </div>
      <div className="mt-1 flex justify-between px-3 text-[12px] font-medium text-white/45">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn("rounded-full px-2 py-1", period === p.id && "bg-white/10 text-white")}
          >
            {p.id}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-5 gap-1 px-2">
        <Round label="Buy" onClick={() => setOverlay("buy")} />
        <Round label="Sell" onClick={() => setOverlay("sell")} />
        <Round label="Convert" onClick={() => setOverlay("convert")} />
        <Round label="Send" onClick={() => setOverlay("send")} />
        <Round label="Receive" onClick={() => setOverlay("receive")} />
      </div>

      <section className="mt-7 px-4">
        <p className="text-[16px] font-semibold">Today&apos;s movers</p>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {movers.map((t) => {
            const neg = t.change24h < 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => openAsset(t.id)}
                className="min-w-[132px] rounded-2xl bg-[#16181D] p-3 text-left"
              >
                <TokenGlyph symbol={t.symbol} color={t.color} size={28} />
                <p className="mt-2 text-[13px] font-medium">{t.symbol}</p>
                <p className={cn("text-[13px] font-semibold", neg ? "text-[#F0616D]" : "text-[#3DDC97]")}>
                  {formatPct(t.change24h)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-6 flex items-center justify-between px-4">
        <p className="text-[16px] font-semibold">Watchlist</p>
        <button type="button" onClick={() => setTab("markets")} className="text-[13px] text-[#6B9CFF]">
          See all
        </button>
      </div>
      <ul>
        {state.tokens.slice(0, 8).map((t) => {
          const usd = t.amount * t.priceUsd;
          const neg = t.change24h < 0;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => openAsset(t.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <TokenGlyph symbol={t.symbol} color={t.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between text-[15px] font-medium">
                    <span>{t.name}</span>
                    <span>{formatUsd(usd)}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-[13px] text-white/45">
                    <span>
                      {t.symbol}
                      {t.rank ? ` · #${t.rank}` : ""}
                    </span>
                    <span className={neg ? "text-[#F0616D]" : "text-[#3DDC97]"}>{formatPct(t.change24h)}</span>
                  </div>
                </div>
                <Sparkline points={sliceSpark(t.sparkline, 0.3)} color={neg ? "#F0616D" : "#3DDC97"} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Round({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1C1F26] text-[11px] font-semibold">
        {label.slice(0, 1)}
      </span>
      <span className="text-[11px] text-white/80">{label}</span>
    </button>
  );
}
