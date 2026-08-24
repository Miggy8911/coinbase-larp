# Coinbase-style LARP simulator

Unofficial Coinbase lookalike. Live prices and stats. Fake balances, sends, and trades. Not affiliated with Coinbase.

## Run in a browser

```bash
npm install
npm run dev
```

http://localhost:43123

Prices stream from Coinbase’s public ticker websocket (REST fallback). Home has a portfolio chart (1H–ALL) that moves with live prices, movers, watchlist. In Account, set a portfolio value like `1 thousand` and it splits across BTC, ETH, SOL, and the rest.

## Sideload an .ipa (iPhone)

Apple only lets Xcode compile iPhone apps on macOS. This Linux preview cannot emit an IPA, and a macOS VM on non-Apple hardware is not allowed.

### Online Mac (GitHub Actions)

GitHub gives you a real Mac runner. That is the hosted build.

1. Create a GitHub repository (private is fine)
2. Push this project to `main`
3. Open **Actions** → **Build Sideloadly IPA** → **Run workflow**
4. When it finishes, download the **CoinbaseLARP** artifact
5. Unzip it to get `CoinbaseLARP.ipa`

Then Sideloadly:

1. Install [Sideloadly](https://sideloadly.io/)
2. Plug in the iPhone and tap Trust
3. IPA = `CoinbaseLARP.ipa`
4. Apple ID = yours (free is fine)
5. Start

On the phone: Settings → General → VPN & Device Management → trust the developer.

Free Apple IDs expire in 7 days; run Sideloadly again when the app won’t open.

### Local Mac

```bash
npm install
npm run ipa
```

That writes `dist/CoinbaseLARP.ipa`. Same Sideloadly steps.

Simulator labels stay off unless you enable them in Account.
