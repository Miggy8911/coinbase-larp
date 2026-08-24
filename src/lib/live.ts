import type { Token } from "./types";
import { fetchDeepMarket, fetchFastQuotes } from "./market";
import { applyRest, applyTicks, setFeedStatus, type Tick } from "./quotes-store";

export function startLiveFeed(tokens: Token[]) {
  const geckoByProduct: Record<string, string> = {};
  for (const t of tokens) {
    if (t.coingeckoId) geckoByProduct[`${t.symbol}-USD`] = t.coingeckoId;
  }
  const products = Object.keys(geckoByProduct);
  let closed = false;
  let ws: WebSocket | null = null;
  let pending: Record<string, Tick> = {};
  let raf = 0;
  let backoff = 250;

  const flush = () => {
    raf = 0;
    const batch = pending;
    pending = {};
    if (Object.keys(batch).length) applyTicks(batch);
  };

  const queue = (id: string, tick: Tick) => {
    pending[id] = tick;
    if (!raf) raf = requestAnimationFrame(flush);
  };

  const connectWs = () => {
    if (closed || !products.length) return;
    try {
      ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");
    } catch {
      setFeedStatus(false, "rest");
      return;
    }
    ws.onopen = () => {
      backoff = 250;
      ws?.send(
        JSON.stringify({
          type: "subscribe",
          product_ids: products,
          channels: ["ticker", "heartbeat"],
        })
      );
      setFeedStatus(true, "Coinbase live");
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data as string) as {
          type?: string;
          product_id?: string;
          price?: string;
          open_24h?: string;
        };
        if (msg.type !== "ticker" || !msg.product_id || !msg.price) return;
        const id = geckoByProduct[msg.product_id];
        if (!id) return;
        const usd = Number(msg.price);
        if (!Number.isFinite(usd) || usd <= 0) return;
        const open = Number(msg.open_24h);
        const change = open > 0 ? ((usd - open) / open) * 100 : undefined;
        queue(id, { usd, usd_24h_change: change });
      } catch {
        /* ignore */
      }
    };
    ws.onclose = () => {
      ws = null;
      if (closed) return;
      setFeedStatus(false, "reconnecting");
      window.setTimeout(connectWs, backoff);
      backoff = Math.min(4000, backoff * 1.6);
    };
    ws.onerror = () => ws?.close();
  };

  connectWs();

  const fast = async () => {
    if (ws && ws.readyState === WebSocket.OPEN) return;
    try {
      const { quotes, source } = await fetchFastQuotes(tokens);
      applyRest(quotes, "fast");
      setFeedStatus(Object.keys(quotes).length > 0, source);
    } catch {
      /* ignore */
    }
  };

  const deep = async () => {
    try {
      const { quotes } = await fetchDeepMarket(tokens);
      applyRest(quotes, "deep");
    } catch {
      /* ignore */
    }
  };

  void fast();
  void deep();
  const fastId = window.setInterval(fast, 2500);
  const deepId = window.setInterval(deep, 60_000);

  return () => {
    closed = true;
    window.clearInterval(fastId);
    window.clearInterval(deepId);
    if (raf) cancelAnimationFrame(raf);
    ws?.close();
  };
}
