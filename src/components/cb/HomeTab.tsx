"use client";

import { Bell } from "lucide-react";
import { CoinbaseMark } from "../CoinbaseMark";
import { Sparkline } from "../Sparkline";
import { TokenGlyph } from "../TokenGlyph";
import { useApp } from "@/lib/app-context";
import { cn, formatPct, formatUsd } from "@/lib/utils";

export function HomeTab() {
  const { state, totalUsd, dayChangePct, dayChangeUsd, setOverlay, setTab, pricesLive, marketSource } =
    useApp();
  const name = state.account?.firstName ?? "there";
  const down = dayChangePct < 0;

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-4">
      <header className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-2">
          <CoinbaseMark size={28} />
          <span className="text-[16px] font-semibold">Coinbase</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/40">{pricesLive ? marketSource : "offline"}</span>
          <button type="button" onClick={() => setOverlay("profile")} className="text-white/70">
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={() => setOverlay("profile")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0052FF] text-[12px] font-semibold"
          >
            {name.slice(0, 1)}
          </button>
        </div>
      </header>

      <p className="mt-5 px-4 text-[14px] text-white/55">Hi, {name}</p>
      <p className="px-4 text-[34px] font-semibold tracking-tight">{formatUsd(totalUsd)}</p>
      <p className={cn("px-4 text-[14px]", down ? "text-[#F0616D]" : "text-[#3DDC97]")}>
        {formatUsd(dayChangeUsd)} ({formatPct(dayChangePct)})
      </p>
      <p className="px-4 pt-1 text-[11px] text-white/35">LARP balance · live market prices · not real funds</p>

      <div className="mt-4 grid grid-cols-4 gap-2 px-4">
        <Action label="Buy" onClick={() => setOverlay("buy")} />
        <Action label="Sell" onClick={() => setOverlay("sell")} />
        <Action label="Convert" onClick={() => setOverlay("convert")} />
        <Action label="Send" onClick={() => setOverlay("send")} />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 px-4">
        <Action label="Receive" onClick={() => setOverlay("receive")} wide />
        <Action label="Pay" onClick={() => setTab("pay")} wide />
      </div>

      <div className="mt-6 flex items-center justify-between px-4">
        <p className="text-[15px] font-semibold">Watchlist</p>
        <button type="button" onClick={() => setTab("markets")} className="text-[13px] text-[#6B9CFF]">
          See all
        </button>
      </div>
      <ul className="px-2">
        {state.tokens.slice(0, 6).map((t) => {
          const usd = t.amount * t.priceUsd;
          const neg = t.change24h < 0;
          return (
            <li key={t.id} className="flex items-center gap-3 px-2 py-3">
              <TokenGlyph symbol={t.symbol} color={t.color} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[14px] font-medium">
                  <span>{t.name}</span>
                  <span>{formatUsd(usd)}</span>
                </div>
                <div className="mt-0.5 flex justify-between text-[12px] text-white/45">
                  <span>{t.symbol}</span>
                  <span className={neg ? "text-[#F0616D]" : "text-[#3DDC97]"}>{formatPct(t.change24h)}</span>
                </div>
              </div>
              <Sparkline points={t.sparkline} color={neg ? "#F0616D" : "#3DDC97"} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Action({
  label,
  onClick,
  wide,
}: {
  label: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full bg-[#1e2026] py-3 text-[13px] font-semibold",
        wide && "py-3.5"
      )}
    >
      {label}
    </button>
  );
}
