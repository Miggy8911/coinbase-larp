"use client";

import { allocatePortfolio } from "./allocate";
import { CATALOG } from "./defaults";
import { startLiveFeed } from "./live";
import { coinbaseRef, hexTx, nowLabel, uid } from "./ids";
import { readLocal, readNative, writeLocal } from "./persist";
import { livePrice, seedQuotesFromTokens } from "./quotes-store";
import type { Account, ActivityItem, AppState, Overlay, Tab, TxKind } from "./types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const useBrowserLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Receipt = ActivityItem | null;

type Ctx = {
  ready: boolean;
  state: AppState;
  tab: Tab;
  setTab: (t: Tab) => void;
  acceptDisclaimer: () => void;
  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  assetId: string | null;
  openAsset: (id: string) => void;
  receipt: Receipt;
  createAccount: (account: Account) => void;
  updateAccount: (patch: Partial<Account>) => void;
  updateTokenAmount: (id: string, amount: number) => void;
  setCash: (n: number) => void;
  setPortfolioValue: (usd: number) => void;
  sendCrypto: (tokenId: string, amount: number, to: string) => ActivityItem;
  buyCrypto: (tokenId: string, usd: number) => ActivityItem;
  sellCrypto: (tokenId: string, amount: number) => ActivityItem;
  convert: (fromId: string, toId: string, amount: number) => ActivityItem;
  receiveCrypto: (tokenId: string, amount: number) => ActivityItem;
  resetBag: () => void;
  setShowDisclaimers: (v: boolean) => void;
  setEditMode: (v: boolean) => void;
};

const AppCtx = createContext<Ctx | null>(null);

const EMPTY: AppState = {
  account: null,
  cashUsd: 2_875_420.18,
  tokens: CATALOG,
  activity: [],
  showDisclaimers: false,
  editMode: false,
  disclaimerSeen: false,
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
  const [ready, setReady] = useState(false);
  const [tab, setTabState] = useState<Tab>("home");
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [assetId, setAssetId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt>(null);
  const latest = useRef({ state: EMPTY, tab: "home" as Tab });
  latest.current = { state, tab };

  const persist = useCallback((next: AppState, nextTab: Tab) => {
    writeLocal(next, nextTab);
  }, []);

  const setTab = useCallback((t: Tab) => {
    setTabState(t);
    persist(latest.current.state, t);
  }, [persist]);

  useBrowserLayoutEffect(() => {
    const loaded = readLocal();
    if (loaded) {
      setState(loaded.state);
      setTabState(loaded.tab);
      seedQuotesFromTokens(loaded.state.tokens);
    } else {
      seedQuotesFromTokens(CATALOG);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void readNative().then((native) => {
      if (cancelled || !native?.state.account) return;
      const local = readLocal();
      if (local?.state.account) return;
      setState(native.state);
      setTabState(native.tab);
      seedQuotesFromTokens(native.state.tokens);
      writeLocal(native.state, native.tab);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useBrowserLayoutEffect(() => {
    if (!ready) return;
    persist(state, tab);
  }, [ready, state, tab, persist]);

  useEffect(() => {
    if (!ready) return;
    const flush = () => writeLocal(latest.current.state, latest.current.tab);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    return startLiveFeed(CATALOG);
  }, [ready]);

  const openAsset = useCallback((id: string) => {
    setAssetId(id);
    setOverlay("asset");
  }, []);

  const finish = useCallback((item: ActivityItem) => {
    setReceipt(item);
    setOverlay("receipt");
  }, []);

  const acceptDisclaimer = useCallback(() => {
    setState((s) => {
      const next = { ...s, disclaimerSeen: true };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const createAccount = useCallback((account: Account) => {
    setState((s) => {
      const next = { ...s, account };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const updateAccount = useCallback((patch: Partial<Account>) => {
    setState((s) => {
      const next = {
        ...s,
        account: s.account ? { ...s.account, ...patch } : (patch as Account),
      };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const updateTokenAmount = useCallback((id: string, amount: number) => {
    setState((s) => {
      const next = {
        ...s,
        tokens: s.tokens.map((t) => (t.id === id ? { ...t, amount } : t)),
      };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const setCash = useCallback((n: number) => {
    setState((s) => {
      const next = { ...s, cashUsd: n };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const setPortfolioValue = useCallback((usd: number) => {
    setState((s) => {
      const allocated = allocatePortfolio(usd, s.tokens, livePrice);
      const next = { ...s, cashUsd: allocated.cashUsd, tokens: allocated.tokens };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const sendCrypto = useCallback(
    (tokenId: string, amount: number, to: string) => {
      let created!: ActivityItem;
      setState((s) => {
        const token = s.tokens.find((x) => x.id === tokenId);
        if (!token) return s;
        const usd = amount * livePrice(token);
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
        persist(next, latest.current.tab);
        return next;
      });
      if (created) finish(created);
      return created;
    },
    [finish, persist]
  );

  const buyCrypto = useCallback(
    (tokenId: string, usd: number) => {
      let created!: ActivityItem;
      setState((s) => {
        const token = s.tokens.find((x) => x.id === tokenId);
        const px = token ? livePrice(token) : 0;
        if (!token || px <= 0) return s;
        const qty = usd / px;
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
        persist(next, latest.current.tab);
        return next;
      });
      if (created) finish(created);
      return created;
    },
    [finish, persist]
  );

  const sellCrypto = useCallback(
    (tokenId: string, amount: number) => {
      let created!: ActivityItem;
      setState((s) => {
        const token = s.tokens.find((x) => x.id === tokenId);
        if (!token) return s;
        const usd = amount * livePrice(token);
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
        persist(next, latest.current.tab);
        return next;
      });
      if (created) finish(created);
      return created;
    },
    [finish, persist]
  );

  const convert = useCallback(
    (fromId: string, toId: string, amount: number) => {
      let created!: ActivityItem;
      setState((s) => {
        const from = s.tokens.find((x) => x.id === fromId);
        const to = s.tokens.find((x) => x.id === toId);
        if (!from || !to) return s;
        const fromPx = livePrice(from);
        const toPx = livePrice(to);
        if (fromPx <= 0 || toPx <= 0) return s;
        const usd = amount * fromPx;
        const got = usd / toPx;
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
        persist(next, latest.current.tab);
        return next;
      });
      if (created) finish(created);
      return created;
    },
    [finish, persist]
  );

  const receiveCrypto = useCallback(
    (tokenId: string, amount: number) => {
      let created!: ActivityItem;
      setState((s) => {
        const token = s.tokens.find((x) => x.id === tokenId);
        if (!token) return s;
        const usd = amount * livePrice(token);
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
        persist(next, latest.current.tab);
        return next;
      });
      if (created) finish(created);
      return created;
    },
    [finish, persist]
  );

  const resetBag = useCallback(() => {
    setState((s) => {
      const next = {
        ...EMPTY,
        account: s.account,
        showDisclaimers: s.showDisclaimers,
        editMode: s.editMode,
        disclaimerSeen: s.disclaimerSeen,
      };
      persist(next, latest.current.tab);
      return next;
    });
  }, [persist]);

  const setShowDisclaimers = useCallback((v: boolean) => {
    setState((s) => ({ ...s, showDisclaimers: v }));
  }, []);

  const setEditMode = useCallback((v: boolean) => {
    setState((s) => ({ ...s, editMode: v }));
    if (!v) setOverlay((o) => (o === "balances" ? "profile" : o));
  }, []);

  const value = useMemo(
    () => ({
      ready,
      state,
      tab,
      setTab,
      acceptDisclaimer,
      overlay,
      setOverlay,
      assetId,
      openAsset,
      receipt,
      createAccount,
      updateAccount,
      updateTokenAmount,
      setCash,
      setPortfolioValue,
      sendCrypto,
      buyCrypto,
      sellCrypto,
      convert,
      receiveCrypto,
      resetBag,
      setShowDisclaimers,
      setEditMode,
    }),
    [
      ready,
      state,
      tab,
      setTab,
      acceptDisclaimer,
      overlay,
      assetId,
      openAsset,
      receipt,
      createAccount,
      updateAccount,
      updateTokenAmount,
      setCash,
      setPortfolioValue,
      sendCrypto,
      buyCrypto,
      sellCrypto,
      convert,
      receiveCrypto,
      resetBag,
      setShowDisclaimers,
      setEditMode,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp");
  return ctx;
}
