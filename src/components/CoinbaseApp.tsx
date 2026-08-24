"use client";

import type { ReactNode } from "react";
import { ArrowLeftRight, Home, LayoutGrid, Send, Wallet } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Onboard } from "./cb/Onboard";
import { HomeTab } from "./cb/HomeTab";
import { AssetsTab, MarketsTab } from "./cb/MarketsAssets";
import { PayTab, TradeTab } from "./cb/TradePay";
import { Overlays } from "./cb/Overlays";
import { cn } from "@/lib/utils";
import { DISCLAIMER_KEY } from "@/lib/ids";
import { useEffect, useState } from "react";

export function CoinbaseApp() {
  const { state, tab, setTab } = useApp();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const accepted =
      localStorage.getItem(DISCLAIMER_KEY) === "1" || sessionStorage.getItem("cb-larp-ok") === "1";
    if (accepted) localStorage.setItem(DISCLAIMER_KEY, "1");
    setSeen(accepted);
  }, []);

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden overscroll-none bg-[#0A0B0D] pt-[env(safe-area-inset-top)] text-white [touch-action:pan-y]">
      {seen === null ? (
        <div className="flex-1" />
      ) : !seen ? (
        <div className="flex flex-1 flex-col justify-center px-6">
          <h1 className="text-[26px] font-semibold">Not a real Coinbase account</h1>
          <p className="mt-3 text-[14px] leading-6 text-white/60">
            This is a LARP simulator. Trades and sends only update this phone. They generate fake
            transaction IDs. No seed phrase. Not affiliated with Coinbase. This notice will not
            show again.
          </p>
          <button
            type="button"
            className="tap mt-8 h-12 rounded-full bg-[#0052FF] font-semibold"
            onClick={() => {
              localStorage.setItem(DISCLAIMER_KEY, "1");
              setSeen(true);
            }}
          >
            I understand
          </button>
        </div>
      ) : !state.account ? (
        <Onboard />
      ) : (
        <>
          <div className="relative min-h-0 flex-1">
            <div className={cn("h-full", tab !== "home" && "hidden")}>
              <HomeTab />
            </div>
            <div className={cn("h-full", tab !== "markets" && "hidden")}>
              <MarketsTab />
            </div>
            <div className={cn("h-full", tab !== "trade" && "hidden")}>
              <TradeTab />
            </div>
            <div className={cn("h-full", tab !== "pay" && "hidden")}>
              <PayTab />
            </div>
            <div className={cn("h-full", tab !== "assets" && "hidden")}>
              <AssetsTab />
            </div>
            <Overlays />
          </div>
          <nav className="grid grid-cols-5 border-t border-white/8 bg-[#0A0B0D] px-1 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]">
            <Nav active={tab === "home"} label="Home" onClick={() => setTab("home")}>
              <Home size={22} />
            </Nav>
            <Nav active={tab === "markets"} label="Markets" onClick={() => setTab("markets")}>
              <LayoutGrid size={22} />
            </Nav>
            <Nav active={tab === "trade"} label="Trade" onClick={() => setTab("trade")} accent>
              <ArrowLeftRight size={20} />
            </Nav>
            <Nav active={tab === "pay"} label="Pay" onClick={() => setTab("pay")}>
              <Send size={22} />
            </Nav>
            <Nav active={tab === "assets"} label="Assets" onClick={() => setTab("assets")}>
              <Wallet size={22} />
            </Nav>
          </nav>
        </>
      )}
    </div>
  );
}

function Nav({
  active,
  label,
  onClick,
  children,
  accent,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap flex flex-col items-center gap-0.5 text-[10px] transition-colors duration-150",
        active ? "text-white" : "text-white/40"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center transition-transform duration-150",
          accent ? "h-12 w-12 -mt-4 rounded-full bg-[#0052FF] text-white shadow-lg shadow-blue-900/40" : "h-7 w-7",
          accent && !active && "opacity-90"
        )}
      >
        {children}
      </span>
      {label}
    </button>
  );
}
