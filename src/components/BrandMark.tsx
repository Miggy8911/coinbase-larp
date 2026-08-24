"use client";

import type { LayoutId } from "@/lib/types";

export function BrandMark({
  layout,
  size = 28,
}: {
  layout: LayoutId;
  size?: number;
}) {
  const s = { width: size, height: size };
  if (layout === "phantom") {
    return (
      <svg viewBox="0 0 24 24" style={s} aria-hidden>
        <rect width="24" height="24" rx="7" fill="#AB9FF2" />
        <path
          fill="#1b1529"
          d="M12 5c-3.6 0-6.2 2.4-6.2 7v5.2c0 .9.9 1.4 1.6.9.7-.4 1.6-.4 2.3 0 .8.5 1.8.5 2.6 0 .7-.4 1.6-.4 2.3 0 .7.5 1.6 0 1.6-.9V12c0-4.6-2.6-7-6.2-7zm-2.2 7.2a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3zm4.4 0a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3z"
        />
      </svg>
    );
  }
  if (layout === "exodus") {
    return (
      <svg viewBox="0 0 24 24" style={s} aria-hidden>
        <rect width="24" height="24" rx="7" fill="#1B1438" />
        <path
          fill="#8B7CFF"
          d="M7 17.5 12 4.5 17 17.5h-2.2L12 9.8 9.2 17.5H7z"
        />
        <path fill="#5EF2D2" d="M9.4 19h5.2l-1.1-2.6h-3z" />
      </svg>
    );
  }
  if (layout === "ledger") {
    return (
      <svg viewBox="0 0 24 24" style={s} aria-hidden>
        <rect width="24" height="24" rx="7" fill="#000" />
        <path
          fill="#fff"
          d="M6 6h5.2v2.1H8.1v7.8H6V6zm6.8 0H18v12h-5.2v-2.1h3.1V8.1h-3.1V6z"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" style={s} aria-hidden>
      <rect width="24" height="24" rx="12" fill="#0052FF" />
      <path fill="#fff" d="M12.8 6.2v11.6c3.1-.3 5.4-2.2 5.4-5.8 0-3.6-2.3-5.5-5.4-5.8zm-1.6 0C8.1 6.5 5.8 8.4 5.8 12c0 3.6 2.3 5.5 5.4 5.8V6.2z" />
    </svg>
  );
}

export function brandTheme(layout: LayoutId) {
  switch (layout) {
    case "exodus":
      return { bg: "#0E0A1F", accent: "#8B7CFF", title: "Exodus" };
    case "ledger":
      return { bg: "#121214", accent: "#FFFFFF", title: "Ledger Live" };
    case "coinbase":
      return { bg: "#0A0B0D", accent: "#0052FF", title: "Coinbase" };
    default:
      return { bg: "#000000", accent: "#AB9FF2", title: "Phantom" };
  }
}

export function iconDataUri(layout: LayoutId) {
  const svg =
    layout === "coinbase"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="16" fill="#0052FF"/><circle cx="16" cy="16" r="6" fill="#fff"/></svg>`
      : layout === "ledger"
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#000"/><path fill="#fff" d="M6 6h9v4h-5v12H6V6zm11 0h9v20h-9v-4h5V10h-5V6z"/></svg>`
        : layout === "exodus"
          ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1B1438"/><path fill="#8B7CFF" d="M8 24 16 6l8 18h-4l-4-10-4 10H8z"/></svg>`
          : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="10" fill="#AB9FF2"/><path fill="#1b1529" d="M16 7c-5 0-8 3-8 9v7c0 1.2 1.2 1.8 2.1 1.2.9-.5 2.1-.5 3 0 1.1.6 2.4.6 3.5 0 .9-.5 2.1-.5 3 0 .9.6 2.1 0 2.1-1.2v-7c0-6-3-9-8-9z"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
