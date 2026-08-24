"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, Minus, Plus, QrCode, Repeat2, Search } from "lucide-react";
import { CoinbaseMark } from "../CoinbaseMark";
import { AreaChart, Sparkline } from "../Sparkline";
import { SmoothUsd } from "../SmoothUsd";
import { TokenGlyph } from "../TokenGlyph";
import { mixChart, useLiveTrail } from "@/lib/chart-trail";
import { useApp } from "@/lib/app-context";
import { useHoldings } from "@/lib/quotes-store";
import { cn, formatPct, formatPrice, formatUsd, portfolioSeries, sliceSpark } from "@/lib/utils";

const PERIODS = [
  { id: "1H", frac: 1 / 168, change: "change1h" as const },
  { id: "1D", frac: 24 / 168, change: "change24h" as const },
  { id: "1W", frac: 1, change: "change7d" as const },
  { id: "1M", frac: 1, change: "change30d" as const },
  { id: "1Y", frac: 1, change: "change1y" as const },
  { id: "ALL", frac: 1, change: "change1y" as const },
];

export function HomeTab() {
  const { state, setOverlay, setTab, openAsset } = useApp();
  const { tokens, totalUsd, dayChangePct, dayChangeUsd, pricesLive, marketSource, sparkGen } = useHoldings(
    state.tokens,
    state.cashUsd
  );
  const [period, setPeriod] = useState("1D");
  const name = state.account?.firstName ?? "there";
  const meta = PERIODS.find((p) => p.id === period) ?? PERIODS[1];
  const amountsKey = `${state.cashUsd}|${state.tokens.map((t) => `${t.id}:${t.amount}`).join("|")}`;
  const trail = useLiveTrail(totalUsd, amountsKey, dayChangePct);
  const seriesBase = useMemo(
    () => portfolioSeries(tokens, state.cashUsd, 64),
    // historical shape from sparklines; live trail draws the moving right edge
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sparkGen, amountsKey]
  );
  const liveWeight = meta.id === "1H" ? 1 : meta.id === "1D" ? 0.42 : meta.id === "1W" ? 0.14 : 0.06;
  const series = mixChart(sliceSpark(seriesBase, meta.id === "1H" ? 0.08 : meta.id === "1D" ? 0.2 : 1), trail, liveWeight);
  const periodChange =
    meta.change === "change24h"
      ? dayChangePct
      : (tokens.reduce((s, t) => {
          const w = t.amount * t.priceUsd;
          return s + w * ((t[meta.change] ?? 0) / 100);
        }, 0) /
          Math.max(1, totalUsd - state.cashUsd)) *
        100;
  const down = periodChange < 0;
  const line = down ? "#F0616D" : "#3DDC97";
  const movers = [...tokens].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 5);
  const deltaUsd = meta.id === "1D" ? dayChangeUsd : (totalUsd * periodChange) / 100;

  return (
    <div className="scroll flex h-full flex-col pb-5">
      <header className="flex items-center justify-between px-4 pt-3">
        <CoinbaseMark size={28} />
        <div className="flex items-center gap-4">
          {state.showDisclaimers && (
            <span className="text-[11px] text-white/40">{pricesLive ? marketSource : "offline"}</span>
          )}
          <button type="button" className="tap text-white" aria-label="Search">
            <Search size={22} strokeWidth={2} />
          </button>
          <button type="button" onClick={() => setOverlay("receive")} className="tap text-white" aria-label="Scan">
            <QrCode size={22} strokeWidth={2} />
          </button>
          <button type="button" onClick={() => setOverlay("profile")} className="tap text-white" aria-label="Alerts">
            <Bell size={22} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setOverlay("profile")}
            className="tap flex h-8 w-8 items-center justify-center rounded-full bg-[#0052FF] text-[13px] font-semibold"
          >
            {name.slice(0, 1).toUpperCase()}
          </button>
        </div>
      </header>

      <p className="mt-5 px-4 text-[14px] text-white/55">Your balance</p>
      <p className="px-4 text-[42px] font-semibold leading-none tracking-[-0.04em]">
        <SmoothUsd value={totalUsd} />
      </p>
      <p className={cn("mt-2 px-4 text-[16px] font-medium tabular-nums", down ? "text-[#F0616D]" : "text-[#3DDC97]")}>
        {deltaUsd > 0 ? "+" : ""}
        {formatUsd(deltaUsd)} ({formatPct(periodChange)})
      </p>

      <div className="mt-4">
        <AreaChart points={series} color={line} height={148} />
      </div>
      <div className="mt-1 flex justify-between px-4 text-[13px] font-medium text-white/45">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPeriod(p.id)}
            className={cn("tap min-w-[36px] rounded-full px-2.5 py-1", period === p.id && "bg-white/10 text-white")}
          >
            {p.id}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-5 gap-1 px-3">
        <Round label="Buy" onClick={() => setOverlay("buy")} icon={<Plus size={20} strokeWidth={2.3} />} />
        <Round label="Sell" onClick={() => setOverlay("sell")} icon={<Minus size={20} strokeWidth={2.3} />} />
        <Round label="Convert" onClick={() => setOverlay("convert")} icon={<Repeat2 size={19} strokeWidth={2.2} />} />
        <Round label="Send" onClick={() => setOverlay("send")} icon={<ArrowUpRight size={20} strokeWidth={2.2} />} />
        <Round
          label="Receive"
          onClick={() => setOverlay("receive")}
          icon={<ArrowDownLeft size={20} strokeWidth={2.2} />}
        />
      </div>

      <section className="mt-8">
        <p className="px-4 text-[18px] font-semibold">Today&apos;s movers</p>
        <div className="rail mt-3 px-4 pb-1">
          {movers.map((t) => {
            const neg = t.change24h < 0;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => openAsset(t.id)}
                className="tap w-[138px] shrink-0 rounded-2xl bg-[#16181D] p-3 text-left"
              >
                <TokenGlyph id={t.id} symbol={t.symbol} color={t.color} size={32} />
                <p className="mt-2 text-[15px] font-medium">{t.symbol}</p>
                <p className={cn("text-[15px] font-semibold tabular-nums", neg ? "text-[#F0616D]" : "text-[#3DDC97]")}>
                  {formatPct(t.change24h)}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-7 flex items-center justify-between px-4">
        <p className="text-[18px] font-semibold">Watchlist</p>
        <button type="button" onClick={() => setTab("markets")} className="tap text-[14px] font-medium text-[#578BFA]">
          See all
        </button>
      </div>
      <ul>
        {tokens.slice(0, 8).map((t) => {
          const neg = t.change24h < 0;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => openAsset(t.id)}
                className="tap flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <TokenGlyph id={t.id} symbol={t.symbol} color={t.color} />
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] font-medium">{t.name}</p>
                  <p className="text-[13px] text-white/45">{t.symbol}</p>
                </div>
                <Sparkline points={sliceSpark(t.sparkline, 0.3)} color={neg ? "#F0616D" : "#3DDC97"} />
                <div className="min-w-[88px] text-right">
                  <p className="text-[16px] font-medium tabular-nums">{formatPrice(t.priceUsd)}</p>
                  <p className={cn("text-[13px] tabular-nums", neg ? "text-[#F0616D]" : "text-[#3DDC97]")}>
                    {formatPct(t.change24h)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Round({ label, onClick, icon }: { label: string; onClick: () => void; icon: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="tap flex flex-col items-center gap-2">
      <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#1C1F26] text-white">
        {icon}
      </span>
      <span className="text-[12px] text-white/85">{label}</span>
    </button>
  );
}
