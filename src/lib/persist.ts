import { CATALOG } from "./defaults";
import { DISCLAIMER_KEY } from "./ids";
import type { Account, ActivityItem, AppState, Tab, Token } from "./types";

export const STORAGE_KEY = "coinbase-larp-v1";

export type Snapshot = {
  v: 2;
  account: Account | null;
  cashUsd: number;
  tokens: { id: string; amount: number }[];
  activity: ActivityItem[];
  showDisclaimers: boolean;
  editMode: boolean;
  disclaimerSeen: boolean;
  tab: Tab;
};

function asTab(v: unknown): Tab {
  return v === "markets" || v === "trade" || v === "pay" || v === "assets" || v === "home" ? v : "home";
}

export function slimState(state: AppState, tab: Tab): Snapshot {
  return {
    v: 2,
    account: state.account,
    cashUsd: state.cashUsd,
    tokens: state.tokens.map((t) => ({ id: t.id, amount: t.amount })),
    activity: state.activity.slice(0, 50),
    showDisclaimers: state.showDisclaimers === true,
    editMode: state.editMode === true,
    disclaimerSeen: state.disclaimerSeen === true,
    tab,
  };
}

type LooseSnap = Partial<Omit<Snapshot, "tokens">> & {
  tokens?: Array<{ id?: string; amount?: number }> | Token[] | null;
};

export function tokensFromSnapshot(parsed: LooseSnap | null): Token[] {
  const rows = parsed?.tokens ?? [];
  const amounts = new Map<string, number>();
  for (const row of rows) {
    if (!row || typeof row !== "object" || !("id" in row)) continue;
    const id = String((row as { id: string }).id);
    const amount = Number((row as { amount?: number }).amount);
    if (Number.isFinite(amount)) amounts.set(id, amount);
  }
  return CATALOG.map((tok) => ({
    ...tok,
    amount: amounts.has(tok.id) ? (amounts.get(tok.id) as number) : tok.amount,
  }));
}

export function normalizeSnapshot(parsed: LooseSnap | null): {
  state: AppState;
  tab: Tab;
} | null {
  if (!parsed || typeof parsed !== "object") return null;
  const disclaimerSeen =
    parsed.disclaimerSeen === true ||
    !!parsed.account ||
    (typeof window !== "undefined" &&
      (localStorage.getItem(DISCLAIMER_KEY) === "1" || sessionStorage.getItem("cb-larp-ok") === "1"));
  return {
    state: {
      account: parsed.account ?? null,
      cashUsd: typeof parsed.cashUsd === "number" && Number.isFinite(parsed.cashUsd) ? parsed.cashUsd : 0,
      tokens: tokensFromSnapshot(parsed),
      activity: Array.isArray(parsed.activity) ? parsed.activity.slice(0, 50) : [],
      showDisclaimers: parsed.showDisclaimers === true,
      editMode: parsed.editMode === true,
      disclaimerSeen,
    },
    tab: asTab(parsed.tab),
  };
}

export function readLocal(): ReturnType<typeof normalizeSnapshot> {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeSnapshot(JSON.parse(raw) as Partial<Snapshot>);
  } catch {
    return null;
  }
}

export function writeLocal(state: AppState, tab: Tab) {
  if (typeof window === "undefined") return;
  const raw = JSON.stringify(slimState(state, tab));
  try {
    localStorage.setItem(STORAGE_KEY, raw);
    if (state.disclaimerSeen) localStorage.setItem(DISCLAIMER_KEY, "1");
  } catch {
    // quota / private mode
  }
  void writeNative(raw);
}

async function writeNative(raw: string) {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key: STORAGE_KEY, value: raw });
  } catch {
    // web preview or plugin missing
  }
}

export async function readNative(): Promise<ReturnType<typeof normalizeSnapshot>> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (!value) return null;
    return normalizeSnapshot(JSON.parse(value) as Partial<Snapshot>);
  } catch {
    return null;
  }
}
