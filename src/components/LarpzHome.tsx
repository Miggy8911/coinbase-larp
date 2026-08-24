"use client";

import { Banknote, ChevronRight, Search } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatUsd } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

export function LarpzHome() {
  const { state, totalUsd, dayChangeUsd, dayChangePct, setScreen } = useWallet();
  const down = dayChangeUsd < 0;

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center gap-2 px-4 pt-1">
        <button
          type="button"
          onClick={() => setScreen("settings")}
          className="flex h-8 w-8 items-center justify-center text-[#AB9FF2]"
          aria-label="Settings"
        >
          <GhostIcon />
        </button>
        <div className="flex rounded-full bg-[#1a1a1a] p-1 text-[13px] font-semibold">
          <Tab active>Home</Tab>
          <Tab onClick={() => setScreen("trade")}>Trade</Tab>
          <Tab onClick={() => setScreen("explore")}>Explore</Tab>
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
          {down ? "-" : "+"}
          {formatUsd(Math.abs(dayChangeUsd)).replace("$", "$")}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[12px] font-medium",
            down ? "bg-[#3a1518] text-[#ff5a6a]" : "bg-[#143226] text-[#3dd68c]"
          )}
        >
          {down ? "" : "+"}
          {dayChangePct.toFixed(2)}%
        </span>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-3 pb-24">
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
                <div className="relative">
                  <TokenGlyph symbol={t.symbol} color={t.color} size={42} />
                  {["USDC", "WCC", "BONK", "JUP", "WIF"].includes(t.symbol) && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#9945FF] text-[7px] leading-[14px] text-center">
                      S
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="flex items-center gap-1 truncate text-[15px] font-medium">
                      {t.name}
                      {t.verified !== false && (
                        <span className="text-[11px] text-[#AB9FF2]">✓</span>
                      )}
                    </p>
                    <p className="text-[15px] font-medium">{formatUsd(usd)}</p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[13px] text-[#8e8e93]">
                    <p>
                      {formatAmount(t.amount)} {t.symbol}
                    </p>
                    <p className={neg ? "text-[#ff5a6a]" : "text-[#3dd68c]"}>
                      {neg ? "-" : "+"}${Math.abs(ch).toLocaleString("en-US", { maximumFractionDigits: 2 })}
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
          onClick={() => setScreen("explore")}
          className="flex h-12 flex-1 items-center gap-2 rounded-full bg-[#2c2c2e] px-4 text-[15px] text-[#8e8e93]"
        >
          <Search size={18} /> Search Phantom
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
      className={cn(
        "rounded-full px-3.5 py-1.5",
        active ? "bg-[#AB9FF2] text-black" : "text-[#c7c7cc]"
      )}
    >
      {children}
    </button>
  );
}

function GhostIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c-4.4 0-8 3.2-8 9.2V18c0 1.4 1.3 2.2 2.4 1.5.7-.4 1.6-.4 2.3 0 1.1.7 2.5.7 3.6 0 .7-.4 1.6-.4 2.3 0 1.1.7 2.4-.1 2.4-1.5V11.2C20 5.2 16.4 2 12 2zm-3 11.2a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4zm6 0a1.2 1.2 0 1 1 0-2.4 1.2 1.2 0 0 1 0 2.4z" />
    </svg>
  );
}
