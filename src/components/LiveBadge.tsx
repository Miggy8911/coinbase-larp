"use client";

import { useWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

export function LiveBadge() {
  const { pricesLive, marketSource, chainHint, lastTick } = useWallet();
  const ago = lastTick ? Math.max(0, Math.round((Date.now() - lastTick) / 1000)) : null;
  return (
    <p className="px-5 text-[11px] text-[#8e8e93]">
      <span className={cn("mr-1 inline-block h-1.5 w-1.5 rounded-full", pricesLive ? "bg-[#3dd68c]" : "bg-[#8e8e93]")} />
      {pricesLive ? "Live quotes" : "Waiting for quotes"} · {marketSource}
      {ago !== null ? ` · ${ago}s` : ""}
      {chainHint ? ` · ${chainHint}` : ""}
      <span className="block text-[10px] text-[#6e6e73]">Read-only feeds. No keys, no sends on-chain.</span>
    </p>
  );
}
