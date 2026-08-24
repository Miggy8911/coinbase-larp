"use client";

import { useMemo, useState } from "react";
import { Sparkline } from "../Sparkline";
import { TokenGlyph } from "../TokenGlyph";
import { Note } from "../Note";
import { useApp } from "@/lib/app-context";
import { cn, formatPct, formatPrice, formatUsd } from "@/lib/utils";

export function MarketsTab() {
  const { state, setOverlay, openAsset } = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"cap" | "gainers" | "losers">("cap");
  const list = useMemo(() => {
    let rows = state.tokens.filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q.toLowerCase()) ||
        t.symbol.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "gainers") rows = [...rows].sort((a, b) => b.change24h - a.change24h);
    else if (sort === "losers") rows = [...rows].sort((a, b) => a.change24h - b.change24h);
    else rows = [...rows].sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
    return rows;
  }, [state.tokens, q, sort]);

  return (
    <div className="flex h-full flex-col">
      <h1 className="px-4 pt-4 text-[28px] font-semibold">Markets</h1>
      <Note className="px-4">Live prices. Buys complete on this device only.</Note>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search"
        className="mx-4 mt-3 rounded-full bg-[#1C1F26] px-4 py-2.5 text-[15px] outline-none"
      />
      <div className="mt-3 flex gap-2 px-4 text-[13px] font-medium">
        {(
          [
            ["cap", "Market cap"],
            ["gainers", "Gainers"],
            ["losers", "Losers"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSort(id)}
            className={cn("rounded-full px-3 py-1.5", sort === id ? "bg-white text-black" : "bg-[#1C1F26]")}
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="mt-2 flex-1 overflow-y-auto pb-4">
        {list.map((t) => {
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
                    <span>{formatPrice(t.priceUsd)}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-[13px] text-white/45">
                    <span>
                      {t.symbol}
                      {t.rank ? ` · #${t.rank}` : ""}
                    </span>
                    <span className={neg ? "text-[#F0616D]" : "text-[#3DDC97]"}>{formatPct(t.change24h)}</span>
                  </div>
                </div>
                <Sparkline points={t.sparkline.slice(-32)} color={neg ? "#F0616D" : "#3DDC97"} />
                <span
                  role="presentation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOverlay("buy");
                  }}
                  className="rounded-full bg-[#0052FF] px-3 py-1 text-[12px] font-semibold"
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
  const { state, totalUsd, tokenUsd, setOverlay, openAsset } = useApp();
  const rows = [...state.tokens].sort((a, b) => b.amount * b.priceUsd - a.amount * a.priceUsd);
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <h1 className="px-4 pt-4 text-[28px] font-semibold">Assets</h1>
      <p className="px-4 text-[32px] font-semibold tracking-tight">{formatUsd(totalUsd)}</p>
      <p className="px-4 text-[13px] text-white/45">
        Crypto {formatUsd(tokenUsd)} · Cash {formatUsd(state.cashUsd)}
      </p>
      <p className="mt-4 px-4 text-[13px] font-medium text-white/50">Allocation</p>
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
      <button
        type="button"
        onClick={() => setOverlay("balances")}
        className="mx-4 mt-4 h-10 rounded-full bg-[#1C1F26] text-[13px] font-semibold"
      >
        Edit balances
      </button>
      <ul className="mt-3 pb-6">
        <li className="flex items-center justify-between px-4 py-3">
          <span>
            <span className="block text-[15px] font-medium">USD</span>
            <span className="text-[13px] text-white/45">Cash</span>
          </span>
          <span className="text-[15px] font-medium">{formatUsd(state.cashUsd)}</span>
        </li>
        {rows.map((t) => (
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
                  <span>{formatUsd(t.amount * t.priceUsd)}</span>
                </div>
                <p className="text-[13px] text-white/45">
                  {t.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {t.symbol}
                </p>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
