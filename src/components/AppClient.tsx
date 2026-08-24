"use client";

import { useEffect, useState } from "react";
import { AppProvider } from "@/lib/app-context";
import { CoinbaseApp } from "./CoinbaseApp";

export function AppClient() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setNative(standalone || "Capacitor" in window);
    if (standalone) document.documentElement.classList.add("native-shell");
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
          <aside className="lg:sticky lg:top-10 lg:w-[300px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6B9CFF]">
              Unofficial LARP
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Coinbase-style simulator</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Fake account, huge bag, live prices. Sends and trades complete on-device and mint a
              random transaction ID. Not Coinbase. No real money.
            </p>
          </aside>
        )}
        <div className="mx-auto w-full max-w-[430px]">
          <AppProvider>
            <CoinbaseApp />
          </AppProvider>
        </div>
      </div>
    </div>
  );
}
