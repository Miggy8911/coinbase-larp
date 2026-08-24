"use client";

import { fetchMarket } from "@/lib/market";
import { LEGACY_LAYOUT } from "@/lib/layouts";
import { DEFAULT_STATE } from "@/lib/defaults";
import type { ActivityItem, LayoutId, Screen, Token, WalletState } from "@/lib/types";
import { uid } from "@/lib/utils";
import { brandTheme, iconDataUri } from "@/components/BrandMark";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "phantom-sim-wallet-v3";

type Ctx = {
  state: WalletState;
  screen: Screen;
  setScreen: (s: Screen) => void;
  totalUsd: number;
  tokenUsd: number;
  dayChangeUsd: number;
  dayChangePct: number;
  updateWallet: (patch: Partial<WalletState>) => void;
  updateToken: (id: string, patch: Partial<Token>) => void;
  addToken: () => void;
  removeToken: (id: string) => void;
  simulateSend: (tokenId: string, amount: number, to: string) => void;
  simulateSwap: (fromId: string, toId: string, amount: number) => void;
  reset: () => void;
  pricesLive: boolean;
  marketSource: string;
  chainHint: string;
  lastTick: number | null;
};

const WalletContext = createContext<Ctx | null>(null);

function migrate(parsed: Partial<WalletState>): WalletState {
  const layout = (LEGACY_LAYOUT[parsed.layout as string] ?? parsed.layout ?? "phantom") as LayoutId;
  const catalog = Object.fromEntries(DEFAULT_STATE.tokens.map((t) => [t.symbol, t]));
  let tokens = parsed.tokens?.length ? parsed.tokens : DEFAULT_STATE.tokens;
  tokens = tokens.map((t) => {
    const hit = catalog[t.symbol];
    return {
      ...t,
      sparkline: t.sparkline ?? [],
      coingeckoId: t.coingeckoId || hit?.coingeckoId || "",
      binanceSymbol: t.binanceSymbol || hit?.binanceSymbol,
    };
  });
  const have = new Set(tokens.map((t) => t.symbol));
  for (const t of DEFAULT_STATE.tokens) {
    if (!have.has(t.symbol)) tokens.push(t);
  }
  return {
    ...DEFAULT_STATE,
    ...parsed,
    layout,
    tokens,
  };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [pricesLive, setPricesLive] = useState(false);
  const [marketSource, setMarketSource] = useState("connecting");
  const [chainHint, setChainHint] = useState("");
  const [lastTick, setLastTick] = useState<number | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("phantom-sim-wallet-v2");
      if (raw) setState(migrate(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    const theme = brandTheme(state.layout);
    document.title = `${theme.title} · LARP sim`;
    const icon = iconDataUri(state.layout);
    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = icon;
    let apple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement | null;
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = icon;
    const meta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement | null;
    if (meta) meta.content = theme.accent;
  }, [state.layout]);

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    async function load() {
      try {
        const snap = await fetchMarket(state.tokens);
        if (cancelled) return;
        const has = Object.keys(snap.quotes).length > 0;
        setPricesLive(has);
        setMarketSource(snap.source);
        setChainHint(snap.chainHint);
        if (!has) return;
        setLastTick(Date.now());
        setState((prev) => ({
          ...prev,
          tokens: prev.tokens.map((t) => {
            const p = snap.quotes[t.coingeckoId];
            if (!p) return t;
            return {
              ...t,
              priceUsd: p.usd || t.priceUsd,
              change24h: p.usd_24h_change,
              sparkline: p.sparkline.length ? p.sparkline : t.sparkline,
            };
          }),
        }));
      } catch {
        setPricesLive(false);
      }
    }
    load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const updateWallet = useCallback((patch: Partial<WalletState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  const updateToken = useCallback((id: string, patch: Partial<Token>) => {
    setState((s) => ({
      ...s,
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const addToken = useCallback(() => {
    setState((s) => ({
      ...s,
      tokens: [
        ...s.tokens,
        {
          id: uid(),
          symbol: "MEME",
          name: "Custom Token",
          amount: 1000,
          coingeckoId: "",
          priceUsd: 0.01,
          change24h: 0,
          sparkline: [],
          color: "#AB9FF2",
        },
      ],
    }));
  }, []);

  const removeToken = useCallback((id: string) => {
    setState((s) => ({ ...s, tokens: s.tokens.filter((t) => t.id !== id) }));
  }, []);

  const simulateSend = useCallback((tokenId: string, amount: number, to: string) => {
    setState((s) => {
      const token = s.tokens.find((t) => t.id === tokenId);
      if (!token) return s;
      const usd = amount * token.priceUsd;
      const item: ActivityItem = {
        id: uid(),
        kind: "send",
        title: `Sent ${token.symbol}`,
        subtitle: `To ${to.slice(0, 4)}...${to.slice(-4)}`,
        amountLabel: `-${amount} ${token.symbol}`,
        usdLabel: `-$${usd.toFixed(2)}`,
        at: "Just now",
      };
      return {
        ...s,
        tokens: s.tokens.map((t) =>
          t.id === tokenId ? { ...t, amount: Math.max(0, t.amount - amount) } : t
        ),
        activity: [item, ...s.activity],
      };
    });
  }, []);

  const simulateSwap = useCallback((fromId: string, toId: string, amount: number) => {
    setState((s) => {
      const from = s.tokens.find((t) => t.id === fromId);
      const to = s.tokens.find((t) => t.id === toId);
      if (!from || !to || from.id === to.id) return s;
      const usd = amount * from.priceUsd;
      const received = to.priceUsd > 0 ? usd / to.priceUsd : 0;
      const item: ActivityItem = {
        id: uid(),
        kind: "swap",
        title: `Swapped ${from.symbol} → ${to.symbol}`,
        subtitle: "Simulator",
        amountLabel: `${amount} ${from.symbol}`,
        usdLabel: `$${usd.toFixed(2)}`,
        at: "Just now",
      };
      return {
        ...s,
        tokens: s.tokens.map((t) => {
          if (t.id === fromId) return { ...t, amount: Math.max(0, t.amount - amount) };
          if (t.id === toId) return { ...t, amount: t.amount + received };
          return t;
        }),
        activity: [item, ...s.activity],
      };
    });
  }, []);

  const reset = useCallback(() => setState(DEFAULT_STATE), []);

  const tokenUsd = useMemo(
    () => state.tokens.reduce((sum, t) => sum + t.amount * t.priceUsd, 0),
    [state.tokens]
  );
  const totalUsd = tokenUsd + (state.cashUsd || 0);
  const dayChangeUsd = useMemo(
    () => state.tokens.reduce((sum, t) => sum + t.amount * t.priceUsd * (t.change24h / 100), 0),
    [state.tokens]
  );
  const dayChangePct = tokenUsd > 0 ? (dayChangeUsd / tokenUsd) * 100 : 0;

  const value = useMemo(
    () => ({
      state,
      screen,
      setScreen,
      totalUsd,
      tokenUsd,
      dayChangeUsd,
      dayChangePct,
      updateWallet,
      updateToken,
      addToken,
      removeToken,
      simulateSend,
      simulateSwap,
      reset,
      pricesLive,
      marketSource,
      chainHint,
      lastTick,
    }),
    [
      state,
      screen,
      totalUsd,
      tokenUsd,
      dayChangeUsd,
      dayChangePct,
      updateWallet,
      updateToken,
      addToken,
      removeToken,
      simulateSend,
      simulateSwap,
      reset,
      pricesLive,
      marketSource,
      chainHint,
      lastTick,
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
