"use client";

import type { ReactNode } from "react";
import { Clock, Search } from "lucide-react";
import { useMemo } from "react";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatUsd } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

export function HaloHome() {
  const { state, tokenUsd, setScreen } = useWallet();
  const segments = useMemo(() => {
    const parts = state.tokens
      .map((t) => ({ id: t.id, color: t.color, value: t.amount * t.priceUsd }))
      .filter((p) => p.value > 0);
    const sum = parts.reduce((s, p) => s + p.value, 0) || 1;
    let offset = 0;
    return parts.map((p) => {
      const pct = p.value / sum;
      const dash = pct * 100;
      const seg = { ...p, dash, offset };
      offset += dash;
      return seg;
    });
  }, [state.tokens]);

  return (
    <div
      className="flex h-full flex-col"
      style={{ background: "linear-gradient(180deg,#4B2A8C 0%,#1a1030 38%,#0D0D15 100%)" }}
    >
      <div className="flex items-center justify-between px-4 pt-2">
        <button
          type="button"
          onClick={() => setScreen("settings")}
          className="h-9 w-9 rounded-full bg-white/10 text-sm font-semibold"
        >
          {state.walletName.slice(0, 1)}
        </button>
        <div className="flex gap-2">
          <IconBtn onClick={() => setScreen("explore")}>
            <Search size={16} />
          </IconBtn>
          <IconBtn onClick={() => setScreen("activity")}>
            <Clock size={16} />
          </IconBtn>
        </div>
      </div>

      <div className="relative mx-auto mt-4 h-[220px] w-[220px]">
        <svg viewBox="0 0 36 36" className="-rotate-90 h-full w-full">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2.2"
            pathLength={100}
          />
          {segments.map((s) => (
            <circle
              key={s.id}
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke={s.color}
              strokeWidth="2.2"
              pathLength={100}
              strokeDasharray={`${s.dash} ${100 - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] uppercase tracking-widest text-white/50">Portfolio</p>
          <p className="text-[22px] font-semibold leading-tight">{formatUsd(tokenUsd)}</p>
        </div>
      </div>

      <ul className="mt-2 flex-1 space-y-2 overflow-y-auto px-4 pb-24">
        {state.tokens.slice(0, 6).map((t) => {
          const usd = t.amount * t.priceUsd;
          const up = t.change24h >= 0;
          return (
            <li
              key={t.id}
              className="flex items-center gap-3 rounded-[20px] border border-white/10 bg-white/5 px-3 py-3 backdrop-blur"
            >
              <TokenGlyph symbol={t.symbol} color={t.color} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[15px] font-medium">
                  <span>{t.name}</span>
                  <span>{formatUsd(usd)}</span>
                </div>
                <div className="mt-0.5 flex justify-between text-[12px] text-white/55">
                  <span>
                    {formatAmount(t.amount)} {t.symbol}
                  </span>
                  <span className={cn(up ? "text-[#3dd68c]" : "text-[#ff7b88]")}>
                    {formatUsd(t.priceUsd)} {up ? "+" : ""}
                    {t.change24h.toFixed(1)}%
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function IconBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
    >
      {children}
    </button>
  );
}
