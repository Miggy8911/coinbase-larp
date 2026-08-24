"use client";

import type { ReactNode } from "react";
import { Compass, CreditCard, Home, Repeat, Send, Wallet } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { SwapScreen, SendScreen, ReceiveScreen } from "./FlowScreens";
import { ActivityScreen, NftScreen } from "./Lists";
import { EditorScreen } from "./EditorScreen";
import { PhantomHome } from "./PhantomHome";
import { ExodusHome } from "./ExodusHome";
import { LedgerHome } from "./LedgerHome";
import { CoinbaseHome } from "./CoinbaseHome";
import { SettingsScreen, SimplePage } from "./SettingsScreen";
import { brandTheme } from "./BrandMark";
import { cn } from "@/lib/utils";

export function WalletShell() {
  const { screen, setScreen, state } = useWallet();
  const layout = state.layout ?? "phantom";
  const theme = brandTheme(layout);

  return (
    <div
      className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden text-white"
      style={{ background: theme.bg }}
    >
      <div className="sim-status flex items-center justify-between px-6 pt-[max(0.35rem,env(safe-area-inset-top))] text-[12px] text-[#cfcfcf]">
        <span>9:41</span>
        <span className="h-5 w-24 rounded-b-xl bg-black/80" />
        <span>100%</span>
      </div>

      <div className="min-h-0 flex-1">
        {screen === "home" && layout === "phantom" && <PhantomHome />}
        {screen === "home" && layout === "exodus" && <ExodusHome />}
        {screen === "home" && layout === "ledger" && <LedgerHome />}
        {screen === "home" && layout === "coinbase" && <CoinbaseHome />}
        {screen === "swap" && <SwapScreen />}
        {screen === "nfts" && <NftScreen />}
        {screen === "activity" && <ActivityScreen />}
        {screen === "send" && <SendScreen />}
        {screen === "receive" && <ReceiveScreen />}
        {screen === "editor" && <EditorScreen />}
        {screen === "settings" && <SettingsScreen />}
        {screen === "trade" && <SimplePage title="Trade" body="Simulated. Live prices are read-only from market feeds." />}
        {screen === "explore" && <SimplePage title="Explore" body="Decorative tab. Quotes still update on Home." />}
        {screen === "earn" && <SimplePage title="Pay" body="Placeholder Coinbase Pay tab." />}
        {screen === "card" && <SimplePage title="Assets" body="Use Home for the live watchlist." />}
        {screen === "manager" && <SimplePage title="Manager" body="Ledger Manager is visual only." />}
        {screen === "discover" && <SimplePage title="Discover" body="Ledger Discover is visual only." />}
      </div>

      {layout === "exodus" && ["home", "send", "swap", "settings"].includes(screen) && (
        <nav className="grid grid-cols-4 border-t border-white/10 bg-[#0E0A1F] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavBtn active={screen === "home"} label="Portfolio" onClick={() => setScreen("home")}>
            <Wallet size={18} />
          </NavBtn>
          <NavBtn active={screen === "send"} label="Send" onClick={() => setScreen("send")}>
            <Send size={18} />
          </NavBtn>
          <NavBtn active={screen === "swap"} label="Exchange" onClick={() => setScreen("swap")}>
            <Repeat size={18} />
          </NavBtn>
          <NavBtn active={screen === "settings"} label="Profile" onClick={() => setScreen("settings")}>
            <Home size={18} />
          </NavBtn>
        </nav>
      )}

      {layout === "ledger" && ["home", "manager", "discover", "settings"].includes(screen) && (
        <nav className="grid grid-cols-4 border-t border-white/10 bg-[#121214] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavBtn active={screen === "home"} label="Wallet" onClick={() => setScreen("home")}>
            <Wallet size={18} />
          </NavBtn>
          <NavBtn active={screen === "manager"} label="Manager" onClick={() => setScreen("manager")}>
            <Compass size={18} />
          </NavBtn>
          <NavBtn active={screen === "discover"} label="Discover" onClick={() => setScreen("discover")}>
            <Repeat size={18} />
          </NavBtn>
          <NavBtn active={screen === "settings"} label="Settings" onClick={() => setScreen("settings")}>
            <Home size={18} />
          </NavBtn>
        </nav>
      )}

      {layout === "coinbase" && ["home", "swap", "earn", "card"].includes(screen) && (
        <nav className="grid grid-cols-4 border-t border-white/10 bg-[#0A0B0D] px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavBtn active={screen === "home"} label="Home" onClick={() => setScreen("home")}>
            <Home size={18} />
          </NavBtn>
          <NavBtn active={screen === "swap"} label="Trade" onClick={() => setScreen("swap")}>
            <Repeat size={18} />
          </NavBtn>
          <NavBtn active={screen === "earn"} label="Pay" onClick={() => setScreen("earn")}>
            <CreditCard size={18} />
          </NavBtn>
          <NavBtn active={screen === "card"} label="Assets" onClick={() => setScreen("home")}>
            <Wallet size={18} />
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
