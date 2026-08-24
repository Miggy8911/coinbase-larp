# LARP wallet simulator

Unofficial Phantom / Exodus / Ledger / Coinbase skins for screenshots. **Amounts are fake. USD prices and 24h percents are live, read-only market data.** No keys, no broadcasts. Not affiliated with those companies.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:43123. Logo → **Skins**. Favicon/title follow the skin.

## Live quotes (read-only)

Every ~15s the app reads public feeds only:

- Binance 24h ticker (price + %)
- CoinGecko markets (backup + sparklines)
- Jupiter price for SOL
- Solana `getSlot` / ETH `eth_blockNumber` as a “network is live” hint

Nothing is signed or sent on-chain. You only edit how many coins the LARP bag shows.

## Sideloadly

On a Mac: `npm run cap:sync` then `npx cap open ios`, sign, archive an IPA, install with Sideloadly.
