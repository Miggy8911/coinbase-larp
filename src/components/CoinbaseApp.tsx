"use client";

import type { ReactNode } from "react";
import { ArrowLeftRight, ChartPie, Compass, Home, Send } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { Onboard } from "./cb/Onboard";
import { HomeTab } from "./cb/HomeTab";
import { AssetsTab, MarketsTab } from "./cb/MarketsAssets";
import { PayTab, TradeTab } from "./cb/TradePay";
import { Overlays } from "./cb/Overlays";
import { cn } from "@/lib/utils";

export function CoinbaseApp() {
  const { ready, state, tab, setTab, acceptDisclaimer } = useApp();

  return (
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden overscroll-none bg-cb-bg pt-[env(safe-area-inset-top)] text-white [touch-action:pan-y]">
      {!ready ? (
        <div className="flex-1" />
      ) : !state.disclaimerSeen ? (
        <div className="flex flex-1 flex-col justify-center px-6">
          <h1 className="text-[26px] font-semibold">Not a real Coinbase account</h1>
          <p className="mt-3 text-[14px] leading-6 text-white/60">
            This is a LARP simulator. Trades and sends only update this phone. They generate fake
            transaction IDs. No seed phrase. Not affiliated with Coinbase. This notice will not
            show again.
          </p>
          <button
            type="button"
            className="tap mt-8 h-12 rounded-full bg-cb-blue font-semibold"
            onClick={acceptDisclaimer}
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
          <nav className="grid grid-cols-5 border-t border-white/[0.08] bg-cb-bg px-1 pt-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
            <Nav active={tab === "home"} label="Home" onClick={() => setTab("home")}>
              <Home size={22} className={tab === "home" ? "fill-current" : undefined} strokeWidth={1.8} />
            </Nav>
            <Nav active={tab === "markets"} label="Explore" onClick={() => setTab("markets")}>
              <Compass size={22} strokeWidth={1.8} />
            </Nav>
            <Nav active={tab === "trade"} label="Trade" onClick={() => setTab("trade")} accent>
              <ArrowLeftRight size={22} strokeWidth={2.2} />
            </Nav>
            <Nav active={tab === "pay"} label="Pay" onClick={() => setTab("pay")}>
              <Send size={22} strokeWidth={1.8} />
            </Nav>
            <Nav active={tab === "assets"} label="Assets" onClick={() => setTab("assets")}>
              <ChartPie size={22} className={tab === "assets" ? "fill-current" : undefined} strokeWidth={1.8} />
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
        "tap flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors duration-150",
        active ? "text-white" : "text-cb-muted"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center",
          accent ? "h-14 w-14 -mt-6 rounded-full bg-cb-blue text-white" : "h-7 w-7"
        )}
      >
        {children}
      </span>
      {label}
    </button>
  );
}
