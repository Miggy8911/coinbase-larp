"use client";

import { Plus } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LiveBadge } from "./LiveBadge";
import { Sparkline } from "./Sparkline";
import { TokenGlyph } from "./TokenGlyph";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatPct, formatPrice, formatUsd } from "@/lib/utils";

export function CoinbaseHome() {
  const { state, totalUsd, dayChangeUsd, dayChangePct, setScreen } = useWallet();
  const down = dayChangePct < 0;

  return (
    <div className="flex h-full flex-col bg-[#0A0B0D]">
      <div className="flex items-center justify-between px-4 pt-3">
        <button type="button" onClick={() => setScreen("settings")} className="flex items-center gap-2">
          <BrandMark layout="coinbase" size={30} />
          <span className="text-[16px] font-semibold">Coinbase</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("settings")}
          className="h-8 rounded-full bg-[#1e2026] px-3 text-[12px]"
        >
          Skin
        </button>
      </div>

      <p className="mt-5 px-4 text-[11px] uppercase tracking-widest text-white/45">Your balance</p>
      <p className="px-4 text-[32px] font-semibold tracking-tight">{formatUsd(totalUsd)}</p>
      <p className={cn("px-4 text-[14px]", down ? "text-[#F0616D]" : "text-[#3DDC97]")}>
        {down ? "" : "+"}
        {formatUsd(Math.abs(dayChangeUsd))} ({formatPct(dayChangePct)})
      </p>
      <div className="mt-2">
        <LiveBadge />
      </div>

      <div className="mt-4 flex gap-2 px-4">
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="flex h-11 flex-1 items-center justify-center gap-1 rounded-full bg-[#0052FF] text-[14px] font-semibold"
        >
          <Plus size={16} /> Buy
        </button>
        <button
          type="button"
          onClick={() => setScreen("send")}
          className="h-11 flex-1 rounded-full bg-[#1e2026] text-[14px] font-semibold"
        >
          Send
        </button>
        <button
          type="button"
          onClick={() => setScreen("receive")}
          className="h-11 flex-1 rounded-full bg-[#1e2026] text-[14px] font-semibold"
        >
          Receive
        </button>
      </div>

      <p className="mt-5 px-4 text-[13px] font-medium text-white/70">Watchlist</p>
      <ul className="flex-1 overflow-y-auto px-3 pb-3">
        {state.tokens.map((t) => {
          const usd = t.amount * t.priceUsd;
          const neg = t.change24h < 0;
          return (
            <li key={t.id} className="flex items-center gap-3 py-3">
              <TokenGlyph symbol={t.symbol} color={t.color} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[14px] font-medium">
                  <span>{t.name}</span>
                  <span>{formatUsd(usd)}</span>
                </div>
                <div className="mt-0.5 flex justify-between text-[12px] text-white/45">
                  <span>
                    {formatAmount(t.amount)} {t.symbol} · {formatPrice(t.priceUsd)}
                  </span>
                  <span className={neg ? "text-[#F0616D]" : "text-[#3DDC97]"}>{formatPct(t.change24h)}</span>
                </div>
              </div>
              <Sparkline points={t.sparkline} color={neg ? "#F0616D" : "#3DDC97"} width={52} height={24} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
