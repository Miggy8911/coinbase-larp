"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

const FILES = new Set(["btc", "eth", "sol", "bnb", "xrp", "ada", "doge", "avax", "link", "sui", "usdc", "usdt", "pepe", "wif", "usd"]);

export function TokenGlyph({
  id,
  symbol,
  color,
  size = 40,
}: {
  id?: string;
  symbol: string;
  color: string;
  size?: number;
}) {
  const key = (id ?? symbol).toLowerCase();
  const box: CSSProperties = { width: size, height: size, minWidth: size, minHeight: size };
  if (FILES.has(key)) {
    return (
      <span className="relative block shrink-0 overflow-hidden rounded-full bg-cb-elev" style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/tokens/${key}.svg`} alt="" width={size} height={size} className="block max-w-none" style={box} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide text-white"
      )}
      style={{ ...box, background: color }}
    >
      {symbol.slice(0, 3)}
    </span>
  );
}
