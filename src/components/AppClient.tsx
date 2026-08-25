"use client";

import { useEffect, useState } from "react";
import { AppProvider, useApp } from "@/lib/app-context";
import { CoinbaseApp } from "./CoinbaseApp";

export function AppClient() {
  const [native, setNative] = useState(false);
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setNative(standalone || "Capacitor" in window);
    if (standalone) document.documentElement.classList.add("native-shell");
  }, []);

  return (
    <div className="h-[100dvh] overflow-hidden bg-black text-white">
      <AppProvider>
        <Shell native={native} />
      </AppProvider>
    </div>
  );
}

function Shell({ native }: { native: boolean }) {
  const { state } = useApp();
  const showAside = !native && state.showDisclaimers;
  return (
    <div
      className={
        native
          ? "mx-auto w-full max-w-[430px]"
          : "mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 lg:flex-row lg:items-start lg:py-10"
      }
    >
      {showAside && (
        <aside className="lg:sticky lg:top-10 lg:w-[300px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-cb-link">
            Simulator
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Coinbase-style LARP</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Labels are on. Turn them off in Account → Show simulator labels.
          </p>
        </aside>
      )}
      <div className="mx-auto w-full max-w-[430px]">
        <CoinbaseApp />
      </div>
    </div>
  );
}
