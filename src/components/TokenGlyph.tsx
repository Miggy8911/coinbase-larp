import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function TokenGlyph({
  symbol,
  color,
  size = 40,
}: {
  symbol: string;
  color: string;
  size?: number;
}) {
  const style: CSSProperties = {
    width: size,
    height: size,
    background: `linear-gradient(145deg, ${color}, #111 140%)`,
  };
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tracking-wide text-white"
      )}
      style={style}
    >
      {symbol.slice(0, 3)}
    </div>
  );
}
