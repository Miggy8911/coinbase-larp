export type Token = {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  coingeckoId: string;
  priceUsd: number;
  change24h: number;
  color: string;
};

export type Collectible = {
  id: string;
  name: string;
  collection: string;
  color: string;
};

export type ActivityItem = {
  id: string;
  kind: "send" | "receive" | "swap";
  title: string;
  subtitle: string;
  amountLabel: string;
  usdLabel: string;
  at: string;
};

export type WalletState = {
  walletName: string;
  address: string;
  tokens: Token[];
  collectibles: Collectible[];
  activity: ActivityItem[];
};

export type Screen =
  | "home"
  | "swap"
  | "nfts"
  | "activity"
  | "send"
  | "receive"
  | "editor";
