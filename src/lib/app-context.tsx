"use client";

import { CATALOG } from "./defaults";
import { fetchMarket } from "./market";
import { coinbaseRef, hexTx, nowLabel, uid } from "./ids";
import type { Account, ActivityItem, AppState, Overlay, Tab, TxKind } from "./types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "coinbase-larp-v1";

type Receipt = ActivityItem | null;

type Ctx = {
  state: AppState;
  tab: Tab;
  setTab: (t: Tab) => void;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  receipt: Receipt;
  totalUsd: number;
  tokenUsd: number;
  dayChangeUsd: number;
  dayChangePct: number;
  pricesLive: boolean;
  marketSource: string;
  createAccount: (account: Account) => void;
  updateAccount: (patch: Partial<Account>) => void;
  updateTokenAmount: (id: string, amount: number) => void;
  setCash: (n: number) => void;
  sendCrypto: (tokenId: string, amount: number, to: string) => ActivityItem;
  buyCrypto: (tokenId: string, usd: number) => ActivityItem;
  sellCrypto: (tokenId: string, amount: number) => ActivityItem;
  convert: (fromId: string, toId: string, amount: number) => ActivityItem;
  receiveCrypto: (tokenId: string, amount: number) => ActivityItem;
  resetBag: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

const EMPTY: AppState = {
  account: null,
  cashUsd: 2_875_420.18,
  tokens: CATALOG,
  activity: [],
};

function pushTx(
  s: AppState,
  kind: TxKind,
  title: string,
  subtitle: string,
  amountLabel: string,
  usd: number,
  onChain: boolean
): { next: AppState; item: ActivityItem } {
  const item: ActivityItem = {
    id: uid(),
    kind,
    title,
    subtitle,
    amountLabel,
    usdLabel: `${usd < 0 ? "-" : "+"}${Math.abs(usd).toLocaleString("en-US", { style: "currency", currency: "USD" })}`,
    at: nowLabel(),
    txId: onChain ? hexTx() : coinbaseRef(),
    status: "Completed",
  };
  return { next: { ...s, activity: [item, ...s.activity] }, item };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [receipt, setReceipt] = useState<Receipt>(null);
  const [pricesLive, setPricesLive] = useState(false);
  const [marketSource, setMarketSource] = useState("connecting");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppState>;
        setState({
          ...EMPTY,
          ...parsed,
          tokens: parsed.tokens?.length ? parsed.tokens : CATALOG,
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
        const snap = await fetchMarket(state.tokens);
        if (cancelled) return;
        setPricesLive(Object.keys(snap.quotes).length > 0);
        setMarketSource(snap.source);
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

  const finish = useCallback((item: ActivityItem) => {
    setReceipt(item);
    setOverlay("receipt");
  }, []);

  const createAccount = useCallback((account: Account) => {
    setState((s) => ({ ...s, account }));
  }, []);

  const updateAccount = useCallback((patch: Partial<Account>) => {
    setState((s) => ({
      ...s,
      account: s.account ? { ...s.account, ...patch } : (patch as Account),
    }));
  }, []);

  const updateTokenAmount = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      tokens: s.tokens.map((t) => (t.id === id ? { ...t, amount } : t)),
    }));
  }, []);

  const setCash = useCallback((n: number) => {
    setState((s) => ({ ...s, cashUsd: n }));
  }, []);

  const sendCrypto = useCallback((tokenId: string, amount: number, to: string) => {
    let created!: ActivityItem;
    setState((s) => {
      const token = s.tokens.find((x) => x.id === tokenId);
      if (!token) return s;
      const usd = amount * token.priceUsd;
      const { next, item } = pushTx(
        {
          ...s,
          tokens: s.tokens.map((x) =>
            x.id === tokenId ? { ...x, amount: Math.max(0, x.amount - amount) } : x
          ),
        },
        "send",
        `Sent ${token.symbol}`,
        `To ${to}`,
        `-${amount} ${token.symbol}`,
        -usd,
        true
      );
      created = item;
      return next;
    });
    if (created) finish(created);
    return created;
  }, [finish]);

  const buyCrypto = useCallback((tokenId: string, usd: number) => {
    let created!: ActivityItem;
    setState((s) => {
      const token = s.tokens.find((x) => x.id === tokenId);
      if (!token || token.priceUsd <= 0) return s;
      const qty = usd / token.priceUsd;
      const { next, item } = pushTx(
        {
          ...s,
          cashUsd: Math.max(0, s.cashUsd - usd),
          tokens: s.tokens.map((x) => (x.id === tokenId ? { ...x, amount: x.amount + qty } : x)),
        },
        "buy",
        `Bought ${token.symbol}`,
        "USD balance",
        `+${qty.toPrecision(6)} ${token.symbol}`,
        usd,
        false
      );
      created = item;
      return next;
    });
    if (created) finish(created);
    return created;
  }, [finish]);

  const sellCrypto = useCallback((tokenId: string, amount: number) => {
    let created!: ActivityItem;
    setState((s) => {
      const token = s.tokens.find((x) => x.id === tokenId);
      if (!token) return s;
      const usd = amount * token.priceUsd;
      const { next, item } = pushTx(
        {
          ...s,
          cashUsd: s.cashUsd + usd,
          tokens: s.tokens.map((x) =>
            x.id === tokenId ? { ...x, amount: Math.max(0, x.amount - amount) } : x
          ),
        },
        "sell",
        `Sold ${token.symbol}`,
        "USD balance",
        `-${amount} ${token.symbol}`,
        usd,
        false
      );
      created = item;
      return next;
    });
    if (created) finish(created);
    return created;
  }, [finish]);

  const convert = useCallback((fromId: string, toId: string, amount: number) => {
    let created!: ActivityItem;
    setState((s) => {
      const from = s.tokens.find((x) => x.id === fromId);
      const to = s.tokens.find((x) => x.id === toId);
      if (!from || !to || from.priceUsd <= 0 || to.priceUsd <= 0) return s;
      const usd = amount * from.priceUsd;
      const got = usd / to.priceUsd;
      const { next, item } = pushTx(
        {
          ...s,
          tokens: s.tokens.map((x) => {
            if (x.id === fromId) return { ...x, amount: Math.max(0, x.amount - amount) };
            if (x.id === toId) return { ...x, amount: x.amount + got };
            return x;
          }),
        },
        "convert",
        `Converted ${from.symbol} → ${to.symbol}`,
        "Internal",
        `${amount} ${from.symbol}`,
        usd,
        false
      );
      created = item;
      return next;
    });
    if (created) finish(created);
    return created;
  }, [finish]);

  const receiveCrypto = useCallback((tokenId: string, amount: number) => {
    let created!: ActivityItem;
    setState((s) => {
      const token = s.tokens.find((x) => x.id === tokenId);
      if (!token) return s;
      const usd = amount * token.priceUsd;
      const { next, item } = pushTx(
        {
          ...s,
          tokens: s.tokens.map((x) => (x.id === tokenId ? { ...x, amount: x.amount + amount } : x)),
        },
        "receive",
        `Received ${token.symbol}`,
        "From external wallet",
        `+${amount} ${token.symbol}`,
        usd,
        true
      );
      created = item;
      return next;
    });
    if (created) finish(created);
    return created;
  }, [finish]);

  const resetBag = useCallback(() => {
    setState((s) => ({ ...EMPTY, account: s.account }));
  }, []);

  const tokenUsd = useMemo(
    () => state.tokens.reduce((sum, t) => sum + t.amount * t.priceUsd, 0),
    [state.tokens]
  );
  const totalUsd = tokenUsd + state.cashUsd;
  const dayChangeUsd = useMemo(
    () => state.tokens.reduce((sum, t) => sum + t.amount * t.priceUsd * (t.change24h / 100), 0),
    [state.tokens]
  );
  const dayChangePct = tokenUsd > 0 ? (dayChangeUsd / tokenUsd) * 100 : 0;

  const value = useMemo(
    () => ({
      state,
      tab,
      setTab,
      overlay,
      setOverlay,
      receipt,
      totalUsd,
      tokenUsd,
      dayChangeUsd,
      dayChangePct,
      pricesLive,
      marketSource,
      createAccount,
      updateAccount,
      updateTokenAmount,
      setCash,
      sendCrypto,
      buyCrypto,
      sellCrypto,
      convert,
      receiveCrypto,
      resetBag,
    }),
    [
      state,
      tab,
      overlay,
      receipt,
      totalUsd,
      tokenUsd,
      dayChangeUsd,
      dayChangePct,
      pricesLive,
      marketSource,
      createAccount,
      updateAccount,
      updateTokenAmount,
      setCash,
      sendCrypto,
      buyCrypto,
      sellCrypto,
      convert,
      receiveCrypto,
      resetBag,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp");
  return ctx;
}
