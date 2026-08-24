"use client";

import { Banknote, ChevronRight, Search } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LiveBadge } from "./LiveBadge";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatPct, formatUsd } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

export function PhantomHome() {
  const { state, totalUsd, dayChangeUsd, dayChangePct, setScreen } = useWallet();
  const down = dayChangeUsd < 0;

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center gap-2 px-4 pt-1">
        <button type="button" onClick={() => setScreen("settings")} aria-label="Phantom settings">
          <BrandMark layout="phantom" size={32} />
        </button>
        <div className="flex rounded-full bg-[#1a1a1a] p-1 text-[13px] font-semibold">
          <Tab active>Home</Tab>
          <Tab onClick={() => setScreen("swap")}>Trade</Tab>
          <Tab onClick={() => setScreen("nfts")}>NFTs</Tab>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setScreen("settings")}
        className="mt-5 flex items-center gap-1 px-5 text-[15px] text-[#cfcfcf]"
      >
        {state.walletName}
        <span className="text-[10px]">▼</span>
      </button>
      <p className="px-5 text-[34px] font-semibold tracking-tight">{formatUsd(totalUsd)}</p>
      <div className="mt-1 flex items-center gap-2 px-5 text-[14px]">
        <span className={down ? "text-[#ff5a6a]" : "text-[#3dd68c]"}>
          {formatUsd(dayChangeUsd)}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[12px] font-medium",
            down ? "bg-[#3a1518] text-[#ff5a6a]" : "bg-[#143226] text-[#3dd68c]"
          )}
        >
          {formatPct(dayChangePct)}
        </span>
      </div>
      <div className="mt-2">
        <LiveBadge />
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-3 pb-24">
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="flex w-full items-center justify-between rounded-2xl bg-[#1c1c1e] px-4 py-3.5"
        >
          <span className="flex items-center gap-3 text-[15px] font-medium">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c2c2e] text-[#AB9FF2]">
              <Banknote size={16} />
            </span>
            Cash
          </span>
          <span className="text-[15px]">{formatUsd(state.cashUsd)}</span>
        </button>

        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="mt-5 mb-2 flex items-center gap-0.5 px-1 text-[15px] font-semibold"
        >
          Tokens <ChevronRight size={16} className="text-[#6e6e73]" />
        </button>

        <ul className="space-y-2">
          {state.tokens.map((t) => {
            const usd = t.amount * t.priceUsd;
            const ch = usd * (t.change24h / 100);
            const neg = ch < 0;
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-[#1c1c1e] px-3 py-3">
                <TokenGlyph symbol={t.symbol} color={t.color} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 truncate text-[15px] font-medium">
                      {t.name}
                      {t.verified !== false && <span className="text-[11px] text-[#AB9FF2]">✓</span>}
                    </p>
                    <p className="text-[15px] font-medium">{formatUsd(usd)}</p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[13px] text-[#8e8e93]">
                    <p>
                      {formatAmount(t.amount)} {t.symbol}
                    </p>
                    <p className={neg ? "text-[#ff5a6a]" : "text-[#3dd68c]"}>
                      {formatPct(t.change24h)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setScreen("activity")}
          className="flex h-12 flex-1 items-center gap-2 rounded-full bg-[#2c2c2e] px-4 text-[15px] text-[#8e8e93]"
        >
          <Search size={18} /> Activity
        </button>
        <button
          type="button"
          onClick={() => setScreen("send")}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#AB9FF2] text-2xl text-black"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Tab({
  children,
  active,
  onClick,
}: {
  children: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("rounded-full px-3.5 py-1.5", active ? "bg-[#AB9FF2] text-black" : "text-[#c7c7cc]")}
    >
      {children}
    </button>
  );
}
