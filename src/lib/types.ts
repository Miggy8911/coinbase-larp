export type Token = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  coingeckoId: string;
  binanceSymbol?: string;
  priceUsd: number;
  change24h: number;
  change1h: number;
  change7d: number;
  change30d: number;
  change1y: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  ath: number;
  atl: number;
  rank: number;
  circSupply: number;
  sparkline: number[];
  color: string;
};

export type TxKind = "send" | "receive" | "buy" | "sell" | "convert";

export type ActivityItem = {
  id: string;
  kind: TxKind;
  title: string;
  subtitle: string;
  amountLabel: string;
  usdLabel: string;
  at: string;
  txId: string;
  status: "Completed";
};

export type Account = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
};

export type AppState = {
  account: Account | null;
  cashUsd: number;
  tokens: Token[];
  activity: ActivityItem[];
  showDisclaimers: boolean;
  editMode: boolean;
  disclaimerSeen: boolean;
};

export type Tab = "home" | "markets" | "trade" | "pay" | "assets";

export type Overlay =
  | "none"
  | "send"
  | "receive"
  | "buy"
  | "sell"
  | "convert"
  | "profile"
  | "balances"
  | "receipt"
  | "asset";
