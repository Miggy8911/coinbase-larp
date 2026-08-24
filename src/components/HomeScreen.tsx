"use client";

import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { cn, formatAmount, formatUsd, truncateAddress } from "@/lib/utils";
import { TokenGlyph } from "./TokenGlyph";

export function HomeScreen() {
  const { state, totalUsd, setScreen } = useWallet();

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-4 pt-3">
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2c2c2c] text-sm font-semibold text-[#AB9FF2]"
          aria-label="Open editor"
        >
          {state.walletName.slice(0, 1)}
        </button>
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="flex flex-col items-center"
        >
          <span className="text-[15px] font-semibold">{state.walletName}</span>
          <span className="text-[12px] text-[#9b9b9b]">
            {truncateAddress(state.address)}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setScreen("editor")}
          className="rounded-full bg-[#2c2c2c] px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-[#AB9FF2]"
        >
          Edit
        </button>
      </header>

      <div className="mt-6 px-4 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-[#AB9FF2]">
          Simulator · not real funds
        </p>
        <h1 className="mt-2 text-[42px] font-semibold leading-none tracking-tight">
          {formatUsd(totalUsd)}
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-3 px-6">
        <Action
          label="Send"
          onClick={() => setScreen("send")}
          icon={<ArrowUpRight size={20} />}
        />
        <Action
          label="Receive"
          onClick={() => setScreen("receive")}
          icon={<ArrowDownLeft size={20} />}
        />
        <Action
          label="Swap"
          onClick={() => setScreen("swap")}
          icon={<ArrowLeftRight size={20} />}
        />
        <Action
          label="Buy"
          onClick={() => setScreen("editor")}
          icon={<span className="text-lg leading-none">+</span>}
        />
      </div>

      <div className="mt-6 flex items-center justify-between px-4">
        <span className="text-[15px] font-semibold">Tokens</span>
        <span className="text-[12px] text-[#8d8d8d]">Tap avatar to customize</span>
      </div>

      <ul className="mt-1 flex-1 overflow-y-auto px-2 pb-4">
        {state.tokens.length === 0 ? (
          <li className="px-3 py-10 text-center text-sm text-[#8d8d8d]">
            No tokens yet. Open Edit and add one.
          </li>
        ) : (
          state.tokens.map((t) => {
            const usd = t.amount * t.priceUsd;
            const up = t.change24h >= 0;
            return (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-2xl px-3 py-3"
              >
                <TokenGlyph symbol={t.symbol} color={t.color} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-[15px] font-medium">{t.name}</p>
                    <p className="text-[15px] font-medium">{formatUsd(usd)}</p>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between text-[13px] text-[#9b9b9b]">
                    <p>
                      {formatAmount(t.amount)} {t.symbol}
                    </p>
                    <p className={cn(up ? "text-[#3dd68c]" : "text-[#ff5a6a]")}>
                      {up ? "+" : ""}
                      {t.change24h.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function Action({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#AB9FF2] text-[#1b1529]">
        {icon}
      </span>
      <span className="text-[12px] font-medium text-[#d7d7d7]">{label}</span>
    </button>
  );
}
