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
  if (FILES.has(key)) {
    return (
      <span
        className="relative shrink-0 overflow-hidden rounded-full bg-[#1C1F26]"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/tokens/${key}.svg`} alt="" width={size} height={size} className="h-full w-full object-cover" />
      </span>
    );
  }
  const style: CSSProperties = {
    width: size,
    height: size,
    background: color,
  };
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide text-white"
      )}
      style={style}
    >
      {symbol.slice(0, 3)}
    </span>
  );
}
