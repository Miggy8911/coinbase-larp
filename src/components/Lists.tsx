"use client";

import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight } from "lucide-react";
import { useWallet } from "@/lib/wallet-context";
import { cn } from "@/lib/utils";

export function NftScreen() {
  const { state, setScreen } = useWallet();
  if (state.collectibles.length === 0) {
    return (
      <Empty title="No collectibles" body="This simulator ships a few dummy NFTs. Reset from Edit if they disappeared." />
    );
  }
  return (
    <div className="flex h-full flex-col px-4 pt-4">
      <div className="relative">
        <button type="button" onClick={() => setScreen("home")} className="absolute left-0 top-0 text-[13px] text-[#AB9FF2]">
          Home
        </button>
        <h2 className="text-center text-[17px] font-semibold">Collectibles</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 overflow-y-auto pb-4">
        {state.collectibles.map((n) => (
          <article key={n.id} className="overflow-hidden rounded-2xl bg-[#2a2a2a]">
            <div className="aspect-square" style={{ background: `linear-gradient(160deg, ${n.color}, #111)` }} />
            <div className="px-3 py-2">
              <p className="text-[13px] font-medium">{n.name}</p>
              <p className="text-[11px] text-[#8d8d8d]">{n.collection}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function ActivityScreen() {
  const { state, setScreen } = useWallet();
  if (state.activity.length === 0) {
    return <Empty title="No activity" body="Simulated sends and swaps will show up here." />;
  }
  return (
    <div className="flex h-full flex-col px-4 pt-4">
      <div className="relative">
        <button type="button" onClick={() => setScreen("home")} className="absolute left-0 top-0 text-[13px] text-[#AB9FF2]">
          Home
        </button>
        <h2 className="text-center text-[17px] font-semibold">Activity</h2>
      </div>
      <ul className="mt-4 space-y-1 overflow-y-auto pb-4">
        {state.activity.map((a) => (
          <li key={a.id} className="flex items-center gap-3 rounded-2xl px-1 py-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                a.kind === "receive" && "bg-[#1e3a2f] text-[#3dd68c]",
                a.kind === "send" && "bg-[#3a2226] text-[#ff5a6a]",
                a.kind === "swap" && "bg-[#2a2540] text-[#AB9FF2]"
              )}
            >
              {a.kind === "receive" && <ArrowDownLeft size={18} />}
              {a.kind === "send" && <ArrowUpRight size={18} />}
              {a.kind === "swap" && <ArrowLeftRight size={18} />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-[14px] font-medium">{a.title}</p>
                <p className="text-[14px]">{a.amountLabel}</p>
              </div>
              <div className="mt-0.5 flex items-center justify-between text-[12px] text-[#8d8d8d]">
                <p className="truncate">{a.subtitle}</p>
                <p>{a.usdLabel}</p>
              </div>
              <p className="mt-0.5 text-[11px] text-[#6f6f6f]">{a.at}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  const { setScreen } = useWallet();
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <p className="text-[17px] font-semibold">{title}</p>
      <p className="mt-2 text-[13px] text-[#8d8d8d]">{body}</p>
      <button type="button" onClick={() => setScreen("home")} className="mt-4 text-[13px] text-[#AB9FF2]">
        Home
      </button>
    </div>
  );
}
