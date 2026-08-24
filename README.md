# Coinbase-style LARP simulator

Unofficial Coinbase lookalike. Live prices and stats. Fake balances, sends, and trades. Not affiliated with Coinbase.

## Run in a browser

```bash
npm install
npm run dev
```

http://localhost:43123

Prices stream from Coinbase’s public ticker websocket (REST fallback). Home has a portfolio chart (1H–ALL), movers, watchlist. Open an asset for market cap, volume, ATH/ATL, 24h range, and period returns.

## Sideload an .ipa (iPhone)

An IPA **must be compiled on a Mac with Xcode**. This Linux preview cannot produce a installable iOS binary.

On a Mac:

```bash
npm install
npm run ipa
```

That writes `dist/CoinbaseLARP.ipa`.

1. Install [Sideloadly](https://sideloadly.io/)
2. Plug in the iPhone, trust the computer
3. IPA = `dist/CoinbaseLARP.ipa`
4. Apple ID = yours (free is fine)
5. Start

On the phone: Settings → General → VPN & Device Management → trust the developer.

Free Apple IDs expire in 7 days; run Sideloadly again when the app won’t open.

Simulator labels stay off unless you enable them in Account.
