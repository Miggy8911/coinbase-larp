"use client";

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
        aria-hidden
        className="glyph"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(/tokens/${key}.svg)`,
        }}
      />
    );
  }
  return (
    <span
      className={cn("glyph flex items-center justify-center text-[11px] font-semibold tracking-wide text-white")}
      style={{ width: size, height: size, background: color }}
    >
      {symbol.slice(0, 3)}
    </span>
  );
}
