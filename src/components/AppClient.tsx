"use client";

import { useEffect, useState } from "react";
import { WalletProvider } from "@/lib/wallet-context";
import { WalletShell } from "./WalletShell";

export function AppClient() {
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sim-ok") === "1") setAccepted(true);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#0b0b0c] text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:py-10">
        <aside className="lg:sticky lg:top-10 lg:w-[320px] lg:shrink-0">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AB9FF2]">
            Entertainment simulator
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Phantom-style LARP wallet</h1>
          <p className="mt-3 text-sm leading-6 text-[#b7b7b7]">
            A local UI for content, mockups, and jokes. There is no seed phrase, no keys, and no
            blockchain. Balances you type live only in this browser.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[#d2d2d2]">
            <li>Edit any token amount from the avatar / Edit button</li>
            <li>Simulated send and swap update the list and activity</li>
            <li>Known tokens can pull live USD prices from CoinGecko</li>
          </ul>
          <p className="mt-6 text-xs leading-5 text-[#8d8d8d]">
            Not affiliated with Phantom. Do not use this to misrepresent holdings, solicit funds,
            or scam anyone.
          </p>
        </aside>
        <div className="relative mx-auto w-full max-w-[430px]">
          {!accepted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
              <div className="w-full rounded-3xl bg-[#1c1c1c] p-6 shadow-2xl">
                <h2 className="text-xl font-semibold">This is not a real wallet</h2>
                <p className="mt-3 text-sm leading-6 text-[#c4c4c4]">
                  Nothing you see here can hold or move crypto. If someone asks you to import a
                  seed phrase into this app, they are scamming you — this app never asks for one.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    sessionStorage.setItem("sim-ok", "1");
                    setAccepted(true);
                  }}
                  className="mt-5 h-12 w-full rounded-full bg-[#AB9FF2] text-sm font-semibold text-[#1b1529]"
                >
                  I understand — open simulator
                </button>
              </div>
            </div>
          )}
          <WalletProvider>
            <WalletShell />
          </WalletProvider>
        </div>
      </div>
    </div>
  );
}
