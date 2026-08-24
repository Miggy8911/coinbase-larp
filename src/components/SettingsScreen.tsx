"use client";

import { LAYOUTS } from "@/lib/layouts";
import type { LayoutId } from "@/lib/types";
import { useWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

export function SettingsScreen() {
  const { state, updateWallet, setScreen, pricesLive } = useWallet();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-black px-4 pt-4 pb-8">
      <h2 className="text-center text-[17px] font-semibold">Settings</h2>
      <p className="mt-1 text-center text-[12px] text-[#8e8e93]">
        Pick a home layout. Same balances, different chrome.
      </p>

      <p className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-[#8e8e93]">
        Layout
      </p>
      <div className="mt-2 space-y-2">
        {LAYOUTS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => {
              updateWallet({ layout: l.id as LayoutId });
              setScreen("home");
            }}
            className={cn(
              "w-full rounded-2xl border px-4 py-3 text-left",
              state.layout === l.id
                ? "border-[#AB9FF2] bg-[#1c1c1e]"
                : "border-transparent bg-[#1c1c1e]"
            )}
          >
            <p className="text-[15px] font-semibold">{l.name}</p>
            <p className="mt-1 text-[12px] leading-5 text-[#8e8e93]">{l.blurb}</p>
          </button>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-[#8e8e93]">
        Prices: {pricesLive ? "live CoinGecko" : "stored demo values"}. Simulator only — no real
        funds.
      </p>

      <button
        type="button"
        onClick={() => setScreen("editor")}
        className="mt-4 h-12 rounded-full bg-[#2c2c2e] text-[15px] font-semibold"
      >
        Edit balances
      </button>
      <button
        type="button"
        onClick={() => setScreen("home")}
        className="mt-2 h-12 rounded-full bg-[#AB9FF2] text-[15px] font-semibold text-black"
      >
        Done
      </button>
    </div>
  );
}

export function SimplePage({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
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
