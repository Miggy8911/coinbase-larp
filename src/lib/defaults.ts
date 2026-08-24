import type { Token } from "./types";

function t(
  partial: Omit<Token, "priceUsd" | "change24h" | "sparkline"> & { amount: number }
): Token {
  return { ...partial, priceUsd: 0, change24h: 0, sparkline: [] };
}

export const CATALOG: Token[] = [
  t({ id: "btc", symbol: "BTC", name: "Bitcoin", amount: 214.82, coingeckoId: "bitcoin", binanceSymbol: "BTCUSDT", color: "#F7931A" }),
  t({ id: "eth", symbol: "ETH", name: "Ethereum", amount: 6120.4, coingeckoId: "ethereum", binanceSymbol: "ETHUSDT", color: "#627EEA" }),
  t({ id: "sol", symbol: "SOL", name: "Solana", amount: 128400, coingeckoId: "solana", binanceSymbol: "SOLUSDT", color: "#9945FF" }),
  t({ id: "bnb", symbol: "BNB", name: "BNB", amount: 18400, coingeckoId: "binancecoin", binanceSymbol: "BNBUSDT", color: "#F3BA2F" }),
  t({ id: "xrp", symbol: "XRP", name: "XRP", amount: 8_200_000, coingeckoId: "ripple", binanceSymbol: "XRPUSDT", color: "#23292F" }),
  t({ id: "ada", symbol: "ADA", name: "Cardano", amount: 4_800_000, coingeckoId: "cardano", binanceSymbol: "ADAUSDT", color: "#0033AD" }),
  t({ id: "doge", symbol: "DOGE", name: "Dogecoin", amount: 42_000_000, coingeckoId: "dogecoin", binanceSymbol: "DOGEUSDT", color: "#C2A633" }),
  t({ id: "avax", symbol: "AVAX", name: "Avalanche", amount: 62000, coingeckoId: "avalanche-2", binanceSymbol: "AVAXUSDT", color: "#E84142" }),
  t({ id: "link", symbol: "LINK", name: "Chainlink", amount: 84000, coingeckoId: "chainlink", binanceSymbol: "LINKUSDT", color: "#2A5ADA" }),
  t({ id: "sui", symbol: "SUI", name: "Sui", amount: 910000, coingeckoId: "sui", binanceSymbol: "SUIUSDT", color: "#4DA2FF" }),
  t({ id: "wif", symbol: "WIF", name: "dogwifhat", amount: 1_200_000, coingeckoId: "dogwifcoin", binanceSymbol: "WIFUSDT", color: "#E8A87C" }),
  t({ id: "pepe", symbol: "PEPE", name: "Pepe", amount: 88_000_000_000, coingeckoId: "pepe", binanceSymbol: "PEPEUSDT", color: "#3D9A4A" }),
  t({ id: "usdc", symbol: "USDC", name: "USD Coin", amount: 4_250_000, coingeckoId: "usd-coin", binanceSymbol: "USDCUSDT", color: "#2775CA" }),
  t({ id: "usdt", symbol: "USDT", name: "Tether", amount: 1_800_000, coingeckoId: "tether", color: "#26A17B" }),
];
