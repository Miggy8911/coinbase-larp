"use client";

import type { ReactNode } from "react";
import { ArrowLeftRight, ArrowUpRight, Settings2 } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { LiveBadge } from "./LiveBadge";
import { Sparkline } from "./Sparkline";
import { TokenGlyph } from "./TokenGlyph";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatPct, formatPrice, formatUsd } from "@/lib/utils";

export function ExodusHome() {
  const { state, tokenUsd, dayChangePct, setScreen } = useWallet();
  const chart = state.tokens.find((t) => t.symbol === "BTC")?.sparkline ?? [];
  const down = dayChangePct < 0;

  return (
    <div className="flex h-full flex-col" style={{ background: "linear-gradient(180deg,#1a1144 0%,#0E0A1F 42%)" }}>
      <div className="flex items-center justify-between px-4 pt-2">
        <button type="button" onClick={() => setScreen("settings")} className="flex items-center gap-2">
          <BrandMark layout="exodus" size={30} />
          <span className="text-[15px] font-semibold">Portfolio</span>
        </button>
        <button type="button" onClick={() => setScreen("settings")}>
          <Settings2 size={18} />
        </button>
      </div>

      <p className="mt-5 px-5 text-[32px] font-semibold">{formatUsd(tokenUsd)}</p>
      <p className={cn("px-5 text-[14px]", down ? "text-[#ff7b88]" : "text-[#5EF2D2]")}>
        {formatPct(dayChangePct)} today
      </p>
      <div className="mt-3 px-2">
        <Sparkline points={chart} color={down ? "#ff7b88" : "#5EF2D2"} width={400} height={72} />
      </div>
      <LiveBadge />

      <div className="mt-3 grid grid-cols-3 gap-2 px-4">
        <Pill label="Send" onClick={() => setScreen("send")} icon={<ArrowUpRight size={16} />} />
        <Pill label="Receive" onClick={() => setScreen("receive")} icon={<ArrowUpRight size={16} className="rotate-180" />} />
        <Pill label="Exchange" onClick={() => setScreen("swap")} icon={<ArrowLeftRight size={16} />} />
      </div>

      <ul className="mt-4 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {state.tokens.map((t) => {
          const usd = t.amount * t.priceUsd;
          const neg = t.change24h < 0;
          return (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl px-2 py-2.5">
              <TokenGlyph symbol={t.symbol} color={t.color} />
              <div className="min-w-0 flex-1">
                <div className="flex justify-between text-[14px] font-medium">
                  <span>{t.name}</span>
                  <span>{formatUsd(usd)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[12px] text-white/50">
                  <span>
                    {formatAmount(t.amount)} · {formatPrice(t.priceUsd)}
                  </span>
                  <span className={neg ? "text-[#ff7b88]" : "text-[#5EF2D2]"}>{formatPct(t.change24h)}</span>
                </div>
              </div>
              <Sparkline
                points={t.sparkline}
                color={neg ? "#ff7b88" : "#5EF2D2"}
                width={56}
                height={22}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Pill({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 rounded-full bg-white/10 py-2.5 text-[13px] font-medium"
    >
      {icon}
      {label}
    </button>
  );
}
