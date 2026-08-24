"use client";

import { useEffect, useRef, useState } from "react";

export function seedTrail(now: number, changePct: number, n = 56) {
  const start = now / (1 + changePct / 100);
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    const drift = start + (now - start) * t;
    const wave = Math.sin(t * Math.PI * 3.2) * now * 0.004 + Math.sin(t * Math.PI * 9.5) * now * 0.0014;
    pts.push(i === n - 1 ? now : drift + wave);
  }
  return pts;
}

export function downsample(points: number[], len: number) {
  if (points.length <= len) return points;
  const out: number[] = [];
  for (let i = 0; i < len; i++) {
    const idx = Math.round((i / (len - 1)) * (points.length - 1));
    out.push(points[idx]);
  }
  return out;
}

export function mixChart(hist: number[], trail: number[], liveWeight: number) {
  const live = trail.length ? trail : hist;
  if (liveWeight >= 0.92 && live.length >= 4) return downsample(live, 80);
  const keep = Math.max(10, Math.floor((hist.length || 40) * (1 - liveWeight)));
  const histPart = hist.length ? hist.slice(0, keep) : [];
  const joined = histPart.concat(live);
  if (joined.length && live.length) joined[joined.length - 1] = live[live.length - 1];
  return downsample(joined.length ? joined : live, 80);
}

export function useLiveTrail(value: number, resetKey: string, changePct: number) {
  const valueRef = useRef(value);
  const chgRef = useRef(changePct);
  valueRef.current = value;
  chgRef.current = changePct;
  const [trail, setTrail] = useState<number[]>(() => seedTrail(value, changePct));

  useEffect(() => {
    setTrail(seedTrail(valueRef.current, chgRef.current));
  }, [resetKey]);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const loop = (t: number) => {
      if (t - last >= 160) {
        last = t;
        const v = valueRef.current;
        setTrail((prev) => {
          if (!prev.length) return [v];
          const tip = prev[prev.length - 1];
          if (tip === v) return prev;
          if (tip > 0 && Math.abs(v - tip) / tip > 0.12) return seedTrail(v, chgRef.current);
          const next = prev.length >= 240 ? prev.slice(prev.length - 239) : prev.slice();
          next.push(v);
          return next;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);

  return trail;
}
