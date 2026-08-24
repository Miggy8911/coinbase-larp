"use client";

import type { ReactNode } from "react";
import { CreditCard, Home, LineChart, Repeat } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { SwapScreen, SendScreen, ReceiveScreen } from "./FlowScreens";
import { ActivityScreen, NftScreen } from "./Lists";
import { EditorScreen } from "./EditorScreen";
import { LarpzHome } from "./LarpzHome";
import { HaloHome } from "./HaloHome";
import { PulseHome } from "./PulseHome";
import { SettingsScreen, SimplePage } from "./SettingsScreen";
import { cn } from "@/lib/utils";

export function WalletShell() {
  const { screen, setScreen, state } = useWallet();
  const layout = state.layout ?? "larpz";

  return (
    <div
      className={cn(
        "relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden text-white",
        layout === "larpz" && "bg-black",
        layout === "halo" && "bg-[#0D0D15]",
        layout === "pulse" && "bg-[#0b0b0f]"
      )}
    >
      <div className="sim-status flex items-center justify-between px-6 pt-[max(0.35rem,env(safe-area-inset-top))] text-[12px] text-[#cfcfcf]">
        <span>9:41</span>
        <span className="h-5 w-24 rounded-b-xl bg-black/80" />
        <span>100%</span>
      </div>

      <div className="min-h-0 flex-1">
        {screen === "home" && layout === "larpz" && <LarpzHome />}
        {screen === "home" && layout === "halo" && <HaloHome />}
        {screen === "home" && layout === "pulse" && <PulseHome />}
        {screen === "swap" && <SwapScreen />}
        {screen === "nfts" && <NftScreen />}
        {screen === "activity" && <ActivityScreen />}
        {screen === "send" && <SendScreen />}
        {screen === "receive" && <ReceiveScreen />}
        {screen === "editor" && <EditorScreen />}
        {screen === "settings" && <SettingsScreen />}
        {screen === "trade" && (
          <SimplePage title="Trade" body="Simulated trade tab. Swaps live under Swap." />
        )}
        {screen === "explore" && (
          <SimplePage title="Explore" body="Decorative explore tab. Nothing is on-chain." />
        )}
        {screen === "earn" && (
          <SimplePage title="Earn" body="Placeholder earn screen for the Pulse layout." />
        )}
        {screen === "card" && (
          <SimplePage title="Card" body="Placeholder card screen for the Pulse layout." />
        )}
      </div>

      {layout === "halo" && screen === "home" && (
        <div className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-0 right-0 flex justify-center">
          <nav className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-xl">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7C5CFF]"
              onClick={() => setScreen("home")}
            >
              <Home size={18} />
            </button>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10"
              onClick={() => setScreen("swap")}
            >
              <Repeat size={18} />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg"
              onClick={() => setScreen("editor")}
            >
              $
            </button>
          </nav>
        </div>
      )}

      {layout === "pulse" && (screen === "home" || screen === "swap" || screen === "earn" || screen === "card") && (
        <nav className="grid grid-cols-4 border-t border-white/5 bg-[#0b0b0f] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavBtn active={screen === "home"} label="Home" onClick={() => setScreen("home")}>
            <Home size={18} />
          </NavBtn>
          <NavBtn active={screen === "swap"} label="Swap" onClick={() => setScreen("swap")}>
            <Repeat size={18} />
          </NavBtn>
          <NavBtn active={screen === "earn"} label="Earn" onClick={() => setScreen("earn")}>
            <LineChart size={18} />
          </NavBtn>
          <NavBtn active={screen === "card"} label="Card" onClick={() => setScreen("card")}>
            <CreditCard size={18} />
          </NavBtn>
        </nav>
      )}
    </div>
  );
}

function NavBtn({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 py-1 text-[11px]",
        active ? "text-white" : "text-[#6e6e73]"
      )}
    >
      {children}
      {label}
    </button>
  );
}
