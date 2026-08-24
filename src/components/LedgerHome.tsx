"use client";

import { BrandMark } from "./BrandMark";
import { LiveBadge } from "./LiveBadge";
import { TokenGlyph } from "./TokenGlyph";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatPct, formatPrice, formatUsd } from "@/lib/utils";

export function LedgerHome() {
  const { state, tokenUsd, dayChangePct, setScreen } = useWallet();
  const down = dayChangePct < 0;

  return (
    <div className="flex h-full flex-col bg-[#121214]">
      <div className="flex items-center justify-between px-4 pt-3">
        <button type="button" onClick={() => setScreen("settings")} className="flex items-center gap-2">
          <BrandMark layout="ledger" size={28} />
          <span className="text-[16px] font-semibold tracking-wide">LEDGER</span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="text-[13px] text-white/60"
        >
          Edit
        </button>
      </div>

      <p className="mt-6 px-4 text-[12px] uppercase tracking-[0.14em] text-white/45">Total balance</p>
      <p className="px-4 text-[30px] font-semibold">{formatUsd(tokenUsd)}</p>
      <p className={cn("px-4 text-[13px]", down ? "text-[#ff5a6a]" : "text-[#3dd68c]")}>
        {formatPct(dayChangePct)} · 24h
      </p>
      <div className="mt-2">
        <LiveBadge />
      </div>

      <p className="mt-4 px-4 text-[13px] font-medium text-white/70">Accounts</p>
      <ul className="mt-1 flex-1 overflow-y-auto px-3 pb-4">
        {state.tokens.map((t) => {
          const usd = t.amount * t.priceUsd;
          const neg = t.change24h < 0;
          return (
            <li key={t.id} className="flex items-center gap-3 border-b border-white/5 px-1 py-3">
              <TokenGlyph symbol={t.symbol} color={t.color} size={36} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[14px]">
                  <span className="font-medium">{t.name}</span>
                  <span>{formatUsd(usd)}</span>
                </div>
                <div className="mt-0.5 flex justify-between text-[12px] text-white/45">
                  <span>
                    {formatAmount(t.amount)} {t.symbol} · {formatPrice(t.priceUsd)}
                  </span>
                  <span className={neg ? "text-[#ff5a6a]" : "text-[#3dd68c]"}>{formatPct(t.change24h)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
