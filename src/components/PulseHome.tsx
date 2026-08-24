"use client";

import type { ReactNode } from "react";
import { ArrowLeftRight, Bell, Compass, Plus, Settings2, Wallet } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatUsd } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

const MARKET = [
  { id: "mood", label: "Mood", sub: "49 Neutral", color: "#6b7280" },
  { id: "tel", label: "TEL", sub: "+22.36%", color: "#3b82f6" },
  { id: "cro", label: "CRO", sub: "+7.52%", color: "#103F68" },
  { id: "inj", label: "INJ", sub: "+7.09%", color: "#00F2FE" },
];

export function PulseHome() {
  const { state, totalUsd, dayChangePct, setScreen } = useWallet();
  const [tab, setTab] = useState<"assets" | "accounts">("assets");
  const down = dayChangePct < 0;

  return (
    <div className="flex h-full flex-col bg-[#0b0b0f]">
      <div
        className="px-4 pb-4 pt-2"
        style={{
          background:
            "radial-gradient(circle at top, rgba(120,70,200,0.35), transparent 55%), #0b0b0f",
        }}
      >
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => setScreen("settings")} className="text-white/80">
            <Wallet size={20} />
          </button>
          <div className="flex gap-3 text-white/80">
            <button type="button" onClick={() => setScreen("explore")}>
              <Compass size={20} />
            </button>
            <button type="button" onClick={() => setScreen("activity")}>
              <Bell size={20} />
            </button>
            <button type="button" onClick={() => setScreen("settings")}>
              <Settings2 size={20} />
            </button>
          </div>
        </div>
        <p className="mt-6 text-[32px] font-semibold tracking-tight">{formatUsd(totalUsd)}</p>
        <button
          type="button"
          className={cn(
            "mt-2 rounded-full px-3 py-1 text-[12px] font-medium",
            down ? "bg-[#3a1518] text-[#ff6b7a]" : "bg-[#143226] text-[#3dd68c]"
          )}
        >
          {down ? "" : "+"}
          {dayChangePct.toFixed(2)}% · Today ›
        </button>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Action label="Transfer" onClick={() => setScreen("send")}>
            <ArrowLeftRight size={18} />
          </Action>
          <Action label="Swap" onClick={() => setScreen("swap")}>
            <ArrowLeftRight size={18} className="rotate-90" />
          </Action>
          <Action label="Buy" onClick={() => setScreen("editor")}>
            <Plus size={18} />
          </Action>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <p className="mb-2 text-[13px] text-[#8e8e93]">Explore the market</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MARKET.map((m) => (
            <div
              key={m.id}
              className="min-w-[108px] rounded-2xl bg-[#16161c] p-3"
              style={{ boxShadow: `inset 0 0 0 1px ${m.color}33` }}
            >
              <p className="text-[13px] font-semibold">{m.label}</p>
              <p className="mt-6 text-[12px] text-[#8e8e93]">{m.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 inline-flex rounded-full bg-[#16161c] p-1 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setTab("assets")}
            className={cn("rounded-full px-4 py-1.5", tab === "assets" && "bg-[#2c2c32]")}
          >
            Assets
          </button>
          <button
            type="button"
            onClick={() => setTab("accounts")}
            className={cn("rounded-full px-4 py-1.5", tab === "accounts" && "bg-[#2c2c32]")}
          >
            Accounts
          </button>
        </div>

        {tab === "accounts" ? (
          <button
            type="button"
            onClick={() => setScreen("editor")}
            className="mt-4 w-full rounded-2xl bg-[#16161c] px-4 py-4 text-left"
          >
            <p className="text-[15px] font-medium">{state.walletName}</p>
            <p className="text-[13px] text-[#8e8e93]">{formatUsd(totalUsd)}</p>
          </button>
        ) : (
          <ul className="mt-3 space-y-1">
            {state.tokens.slice(0, 4).map((t) => {
              const usd = t.amount * t.priceUsd;
              const neg = t.change24h < 0;
              return (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <TokenGlyph symbol={t.symbol} color={t.color} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between text-[15px]">
                      <span className="font-medium">{t.name}</span>
                      <span>{formatUsd(usd)}</span>
                    </div>
                    <div className="mt-0.5 flex justify-between text-[12px] text-[#8e8e93]">
                      <span>
                        {formatAmount(t.amount)} {t.symbol}
                      </span>
                      <span className={neg ? "text-[#ff5a6a]" : "text-[#3dd68c]"}>
                        {neg ? "" : "+"}
                        {t.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="mt-2 text-[13px] text-[#8e8e93]"
        >
          See all assets
        </button>
      </div>
    </div>
  );
}

function Action({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl bg-[#16161c] py-4 text-[13px]"
    >
      {children}
      {label}
    </button>
  );
}
