"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Sparkline } from "../Sparkline";
import { SmoothUsd } from "../SmoothUsd";
import { TokenGlyph } from "../TokenGlyph";
import { Note } from "../Note";
import { useApp } from "@/lib/app-context";
import { useHoldings } from "@/lib/quotes-store";
import { CB } from "@/lib/theme";
import { cn, formatBalance, formatPct, formatPrice } from "@/lib/utils";

export function MarketsTab() {
  const { state, setOverlay, openAsset } = useApp();
  const { tokens } = useHoldings(state.tokens, state.cashUsd);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"all" | "gainers" | "losers">("all");
  const list = useMemo(() => {
    let rows = tokens.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.symbol.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "gainers") rows = [...rows].sort((a, b) => b.change24h - a.change24h);
    else if (sort === "losers") rows = [...rows].sort((a, b) => a.change24h - b.change24h);
    else rows = [...rows].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    return rows;
  }, [tokens, q, sort]);

  return (
    <div className="flex h-full flex-col">
      <h1 className="px-4 pt-4 text-[28px] font-semibold">Explore</h1>
      <Note className="px-4">Live prices. Buys complete on this device only.</Note>
      <label className="mx-4 mt-3 flex items-center gap-2 rounded-full bg-cb-elev px-4 py-2.5">
        <Search size={16} className="text-cb-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search"
          className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-cb-muted"
        />
      </label>
      <div className="mt-3 flex gap-2 px-4 text-[13px] font-medium">
        {(
          [
            ["all", "All"],
            ["gainers", "Gainers"],
            ["losers", "Losers"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSort(id)}
            className={cn("tap rounded-full px-3 py-1.5", sort === id ? "bg-white text-black" : "bg-cb-elev")}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="scroll mt-2 flex-1 pb-4">
        {list.length === 0 && (
          <li className="px-4 py-10 text-center text-[14px] text-cb-muted">No assets match that search</li>
        )}
        {list.map((t) => {
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
                  <p className="text-[13px] text-cb-muted">{t.symbol}</p>
                </div>
                <Sparkline points={t.sparkline.slice(-32)} color={neg ? CB.down : CB.up} />
                <div className="min-w-[84px] text-right">
                  <p className="text-[16px] font-medium tabular-nums">{formatPrice(t.priceUsd)}</p>
                  <p className={cn("text-[13px] tabular-nums", neg ? "text-cb-down" : "text-cb-up")}>
                    {formatPct(t.change24h)}
                  </p>
                </div>
                <span
                  role="presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlay("buy");
                  }}
                  className="tap rounded-full bg-cb-blue px-3 py-1.5 text-[13px] font-semibold"
                >
                  Buy
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AssetsTab() {
  const { state, setOverlay, openAsset } = useApp();
  const { tokens, totalUsd, tokenUsd } = useHoldings(state.tokens, state.cashUsd);
  const rows = [...tokens].sort((a, b) => b.amount * b.priceUsd - a.amount * a.priceUsd);
  return (
    <div className="scroll flex h-full flex-col">
      <h1 className="px-4 pt-4 text-[28px] font-semibold">Assets</h1>
      <p className="whitespace-nowrap px-4 text-[clamp(1.6rem,7.5vw,2rem)] font-semibold tracking-[-0.03em]">
        <SmoothUsd value={totalUsd} balance />
      </p>
      <p className="px-4 text-[13px] tabular-nums text-cb-muted">
        Crypto {formatBalance(tokenUsd)} · Cash {formatBalance(state.cashUsd)}
      </p>
      <p className="mt-4 px-4 text-[13px] font-medium text-cb-muted">Allocation</p>
      <div className="mx-4 mt-2 flex h-2 overflow-hidden rounded-full">
        {rows
          .filter((t) => t.amount * t.priceUsd > 0)
          .slice(0, 8)
          .map((t) => (
            <span
              key={t.id}
              style={{
                width: `${Math.max(2, ((t.amount * t.priceUsd) / Math.max(totalUsd, 1)) * 100)}%`,
                background: t.color,
              }}
            />
          ))}
      </div>
      {state.editMode ? (
        <button
          type="button"
          onClick={() => setOverlay("balances")}
          className="tap mx-4 mt-4 h-10 rounded-full bg-cb-elev text-[13px] font-semibold"
        >
          Edit balances
        </button>
      ) : null}
      <ul className="mt-3 pb-6">
        <li className="flex items-center gap-3 px-4 py-3">
          <TokenGlyph id="usd" symbol="USD" color="#2775CA" />
          <span className="min-w-0 flex-1">
            <span className="flex justify-between text-[16px] font-medium">
              <span>USD</span>
              <span className="tabular-nums">{formatBalance(state.cashUsd)}</span>
            </span>
            <span className="text-[13px] text-cb-muted">Cash</span>
          </span>
        </li>
        {rows.map((t) => {
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
                  <div className="flex justify-between gap-3 text-[16px] font-medium">
                    <span className="truncate">{t.name}</span>
                    <span className="shrink-0 tabular-nums">{formatBalance(t.amount * t.priceUsd)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] tabular-nums text-cb-muted">
                    <span>
                      {t.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {t.symbol}
                    </span>
                    <span className={neg ? "text-cb-down" : "text-cb-up"}>{formatPct(t.change24h)}</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
