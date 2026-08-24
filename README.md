# Phantom-style LARP wallet simulator

A local, entertainment-only wallet UI in the style of Phantom. You type the balances you want, take screenshots, and run fake send/swap flows. **It never connects to a chain, never asks for a seed phrase, and cannot hold or move crypto.**

Not affiliated with Phantom.

## Run locally

```bash
npm install
npm run dev -- --port 43123
```

Open [http://localhost:43123](http://localhost:43123). On a phone, add to Home Screen from the browser for a fullscreen look.

## What it does

- Custom wallet name, display address, token amounts, and USD prices
- Simulated send / swap that only updates this browser (saved in `localStorage`)
- Dummy collectibles and activity
- Optional live USD prices for tokens that have a CoinGecko id (SOL, USDC, JUP, BONK, WIF)

## What it does not do

- No private keys, seed phrases, or wallet connect
- No real deposits, withdrawals, or signatures
- Do not use it to misrepresent holdings or solicit funds

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, React 19.
