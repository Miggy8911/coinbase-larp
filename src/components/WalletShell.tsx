"use client";

import type { ReactNode } from "react";
import { Grid2x2, Home, Layers, List } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { HomeScreen } from "./HomeScreen";
import { SwapScreen, SendScreen, ReceiveScreen } from "./FlowScreens";
import { ActivityScreen, NftScreen } from "./Lists";
import { EditorScreen } from "./EditorScreen";
import { cn } from "@/lib/utils";

export function WalletShell() {
  const { screen, setScreen } = useWallet();

  const tab =
    screen === "home" || screen === "send" || screen === "receive" || screen === "editor"
      ? "home"
      : screen;

  return (
    <div className="relative mx-auto flex h-[100dvh] max-h-[900px] w-full max-w-[430px] flex-col overflow-hidden bg-[#1c1c1c] text-white shadow-[0_0_0_1px_#2a2a2a]">
      <div className="flex items-center justify-between px-6 pt-2 text-[12px] text-[#cfcfcf]">
        <span>9:41</span>
        <span className="h-5 w-24 rounded-b-xl bg-black" />
        <span>100%</span>
      </div>

      <div className="min-h-0 flex-1">
        {screen === "home" && <HomeScreen />}
        {screen === "swap" && <SwapScreen />}
        {screen === "nfts" && <NftScreen />}
        {screen === "activity" && <ActivityScreen />}
        {screen === "send" && <SendScreen />}
        {screen === "receive" && <ReceiveScreen />}
        {screen === "editor" && <EditorScreen />}
      </div>

      <nav className="grid grid-cols-4 border-t border-[#2a2a2a] bg-[#1c1c1c] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavBtn active={tab === "home"} label="Home" onClick={() => setScreen("home")}>
          <Home size={20} />
        </NavBtn>
        <NavBtn active={tab === "swap"} label="Swap" onClick={() => setScreen("swap")}>
          <Layers size={20} />
        </NavBtn>
        <NavBtn active={tab === "nfts"} label="NFTs" onClick={() => setScreen("nfts")}>
          <Grid2x2 size={20} />
        </NavBtn>
        <NavBtn active={tab === "activity"} label="Activity" onClick={() => setScreen("activity")}>
          <List size={20} />
        </NavBtn>
      </nav>
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
        active ? "text-[#AB9FF2]" : "text-[#7a7a7a]"
      )}
    >
      {children}
      {label}
    </button>
  );
}
