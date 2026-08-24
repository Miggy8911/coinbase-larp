"use client";

import { useEffect, useRef, useState } from "react";
import { cn, formatPrice, formatUsd } from "@/lib/utils";

export function SmoothUsd({
  value,
  className,
  compact = true,
}: {
  value: number;
  className?: string;
  compact?: boolean;
}) {
  const target = useRef(value);
  const current = useRef(value);
  const [shown, setShown] = useState(value);
  target.current = value;

  useEffect(() => {
    let raf = 0;
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const t = target.current;
      const c = current.current;
      const gap = t - c;
      const eps = Math.max(0.02, Math.abs(t) * 1e-6);
      if (Math.abs(gap) > eps) {
        current.current = c + gap * 0.28;
        setShown(current.current);
      } else if (c !== t) {
        current.current = t;
        setShown(t);
      }
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) return;
      current.current = target.current;
      setShown(target.current);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <span className={cn("tabular-nums", className)}>
      {compact ? formatUsd(shown) : formatPrice(shown)}
    </span>
  );
}

