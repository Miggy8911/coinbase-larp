"use client";

import { LAYOUTS } from "@/lib/layouts";
import type { LayoutId } from "@/lib/types";
import { useWallet } from "@/lib/wallet-context";
import { BrandMark } from "./BrandMark";
import { cn } from "@/lib/utils";

export function SettingsScreen() {
  const { state, updateWallet, setScreen, pricesLive, marketSource, chainHint } = useWallet();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-black px-4 pt-4 pb-8">
      <h2 className="text-center text-[17px] font-semibold">Skins</h2>
      <p className="mt-1 text-center text-[12px] text-[#8e8e93]">
        Same LARP balances. Icon and chrome follow the skin. Unofficial lookalikes.
      </p>

      <div className="mt-5 space-y-2">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              updateWallet({ layout: l.id as LayoutId });
              setScreen("home");
            }}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left",
              state.layout === l.id ? "border-white bg-[#1c1c1e]" : "border-transparent bg-[#1c1c1e]"
            )}
          >
            <BrandMark layout={l.id} size={36} />
            <span>
              <span className="block text-[15px] font-semibold">{l.name}</span>
              <span className="mt-1 block text-[12px] leading-5 text-[#8e8e93]">{l.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[12px] leading-5 text-[#8e8e93]">
        Quotes: {pricesLive ? marketSource : "offline"} {chainHint ? `· ${chainHint}` : ""}. Read-only
        public APIs (Binance, CoinGecko, Jupiter, Solana/ETH slot). Nothing is signed or broadcast.
      </p>

      <button
        type="button"
        onClick={() => setScreen("editor")}
        className="mt-4 h-12 rounded-full bg-[#2c2c2e] text-[15px] font-semibold"
      >
        Edit LARP amounts
      </button>
      <button
        type="button"
        onClick={() => setScreen("home")}
        className="mt-2 h-12 rounded-full bg-white text-[15px] font-semibold text-black"
      >
        Done
      </button>
    </div>
  );
}

export function SimplePage({ title, body }: { title: string; body: string }) {
  const { setScreen } = useWallet();
  return (
    <div className="flex h-full flex-col items-center justify-center bg-black px-8 text-center">
      <h2 className="text-[20px] font-semibold">{title}</h2>
      <p className="mt-2 text-[14px] text-[#8e8e93]">{body}</p>
      <button
        type="button"
        onClick={() => setScreen("home")}
        className="mt-6 h-11 rounded-full bg-[#2c2c2e] px-6 text-sm font-semibold"
      >
        Back
      </button>
    </div>
  );
}
