"use client";

import { useEffect, useState } from "react";
import { WalletProvider } from "@/lib/wallet-context";
import { WalletShell } from "./WalletShell";

export function AppClient() {
  const [accepted, setAccepted] = useState(false);
  const [native, setNative] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("sim-ok") === "1") setAccepted(true);
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const cap = "Capacitor" in window;
    setNative(standalone || cap);
    if (standalone || cap) {
      document.documentElement.classList.add("native-shell");
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div
        className={
          native
            ? "mx-auto w-full max-w-[430px]"
            : "mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:py-10"
        }
      >
        {!native && (
          <aside className="lg:sticky lg:top-10 lg:w-[320px] lg:shrink-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#AB9FF2]">
              Entertainment simulator
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">LARP wallet</h1>
            <p className="mt-3 text-sm leading-6 text-[#b7b7b7]">
              Phantom, Exodus, Ledger, and Coinbase skins. Amounts you type are fake. USD prices and
              24h percents are live read-only market data. Icon follows the selected skin.
            </p>
            <p className="mt-4 text-xs leading-5 text-[#8d8e93]">
              Unofficial lookalikes. Not affiliated with those companies. No keys, no on-chain sends.
            </p>
          </aside>
        )}
        <div className="relative mx-auto w-full max-w-[430px]">
          {!accepted && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-6">
              <div className="w-full rounded-3xl bg-[#1c1c1c] p-6 shadow-2xl">
                <h2 className="text-xl font-semibold">This is not a real wallet</h2>
                <p className="mt-3 text-sm leading-6 text-[#c4c4c4]">
                  Nothing here can hold or move crypto. This app never asks for a seed phrase.
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
