import type { LayoutId } from "./types";

export const LAYOUTS: { id: LayoutId; name: string; blurb: string }[] = [
  {
    id: "phantom",
    name: "Phantom",
    blurb: "Ghost icon, purple Home / Trade / Explore, Cash + token cards.",
  },
  {
    id: "exodus",
    name: "Exodus",
    blurb: "Portfolio chart, Send / Exchange, multi-asset list.",
  },
  {
    id: "ledger",
    name: "Ledger Live",
    blurb: "Accounts list, Manager / Discover, hardware-wallet chrome.",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    blurb: "Blue Buy button, watchlist rows, Home / Trade / Pay tabs.",
  },
];

export const LEGACY_LAYOUT: Record<string, LayoutId> = {
  larpz: "phantom",
  halo: "exodus",
  pulse: "ledger",
};
