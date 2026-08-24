"use client";

import { Sparkline } from "../Sparkline";
import { TokenGlyph } from "../TokenGlyph";
import { useApp } from "@/lib/app-context";
import { formatPct, formatPrice, formatUsd } from "@/lib/utils";

export function MarketsTab() {
  const { state, setOverlay } = useApp();
  return (
    <div className="flex h-full flex-col">
      <h1 className="px-4 pt-4 text-[22px] font-semibold">Markets</h1>
      <p className="px-4 text-[12px] text-white/45">Live prices. Tap Buy to LARP a fill.</p>
      <ul className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
        {state.tokens.map((t) => {
          const neg = t.change24h < 0;
          return (
            <li key={t.id} className="flex items-center gap-3 px-2 py-3">
              <TokenGlyph symbol={t.symbol} color={t.color} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[14px] font-medium">
                  <span>{t.name}</span>
                  <span>{formatPrice(t.priceUsd)}</span>
                </div>
                <div className="mt-0.5 flex justify-between text-[12px] text-white/45">
                  <span>{t.symbol}</span>
                  <span className={neg ? "text-[#F0616D]" : "text-[#3DDC97]"}>{formatPct(t.change24h)}</span>
                </div>
              </div>
              <Sparkline points={t.sparkline} color={neg ? "#F0616D" : "#3DDC97"} width={56} height={24} />
              <button
                type="button"
                onClick={() => setOverlay("buy")}
                className="rounded-full bg-[#0052FF] px-3 py-1 text-[12px] font-semibold"
              >
                Buy
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AssetsTab() {
  const { state, totalUsd, tokenUsd, setOverlay } = useApp();
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <h1 className="px-4 pt-4 text-[22px] font-semibold">Assets</h1>
      <p className="px-4 text-[28px] font-semibold">{formatUsd(totalUsd)}</p>
      <p className="px-4 text-[12px] text-white/45">Crypto {formatUsd(tokenUsd)} · Cash {formatUsd(state.cashUsd)}</p>
      <button
        type="button"
        onClick={() => setOverlay("balances")}
        className="mx-4 mt-3 h-10 rounded-full bg-[#1e2026] text-[13px] font-semibold"
      >
        Edit LARP amounts
      </button>
      <ul className="mt-3 px-2 pb-6">
        <li className="flex items-center justify-between px-2 py-3">
          <span>
            <span className="block text-[14px] font-medium">USD</span>
            <span className="text-[12px] text-white/45">Cash</span>
          </span>
          <span className="text-[14px] font-medium">{formatUsd(state.cashUsd)}</span>
        </li>
        {state.tokens.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-2 py-3">
            <TokenGlyph symbol={t.symbol} color={t.color} />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between text-[14px] font-medium">
                <span>{t.name}</span>
                <span>{formatUsd(t.amount * t.priceUsd)}</span>
              </div>
              <p className="text-[12px] text-white/45">
                {t.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })} {t.symbol}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
