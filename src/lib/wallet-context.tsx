"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_STATE } from "./defaults";
import { fetchPrices } from "./prices";
import type { ActivityItem, Screen, Token, WalletState } from "./types";
import { uid } from "./utils";

const STORAGE_KEY = "phantom-sim-wallet-v2";

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
};

const WalletContext = createContext<Ctx | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [pricesLive, setPricesLive] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WalletState>;
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          tokens: parsed.tokens?.length ? parsed.tokens : DEFAULT_STATE.tokens,
        });
      }
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
    if (!hydrated) return;
    let cancelled = false;
    async function load() {
      try {
        const ids = state.tokens.map((t) => t.coingeckoId);
        const map = await fetchPrices(ids);
        if (cancelled) return;
        const has = Object.keys(map).length > 0;
        setPricesLive(has);
        if (!has) return;
        setState((prev) => ({
          ...prev,
          tokens: prev.tokens.map((t) => {
            const p = map[t.coingeckoId];
            if (!p) return t;
            return {
              ...t,
              priceUsd: p.usd ?? t.priceUsd,
              change24h: p.usd_24h_change ?? t.change24h,
            };
          }),
        }));
      } catch {
        setPricesLive(false);
      }
    }
    load();
    const id = setInterval(load, 45_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // only refresh prices, not on every token edit
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
          change24h: 12.5,
          color: "#AB9FF2",
        },
      ],
    }));
  }, []);

  const removeToken = useCallback((id: string) => {
    setState((s) => ({ ...s, tokens: s.tokens.filter((t) => t.id !== id) }));
  }, []);

  const simulateSend = useCallback(
    (tokenId: string, amount: number, to: string) => {
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
    },
    []
  );

  const simulateSwap = useCallback(
    (fromId: string, toId: string, amount: number) => {
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
    },
    []
  );

  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  const tokenUsd = useMemo(
    () => state.tokens.reduce((sum, t) => sum + t.amount * t.priceUsd, 0),
    [state.tokens]
  );
  const totalUsd = tokenUsd + (state.cashUsd || 0);
  const dayChangeUsd = useMemo(
    () =>
      state.tokens.reduce(
        (sum, t) => sum + t.amount * t.priceUsd * (t.change24h / 100),
        0
      ),
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
    ]
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
