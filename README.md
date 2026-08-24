# Phantom-style LARP wallet simulator

Entertainment-only wallet UI. Custom balances, three home layouts, simulated send/swap. **No keys, no chain, no real funds.** Not affiliated with Phantom.

## Run in a browser

```bash
npm install
npm run dev
```

Open http://localhost:43123. Tap the ghost / account / gear to open **Settings** and pick a layout:

- **Larpz list** — black token cards, Home / Trade / Explore, Cash row
- **Halo ring** — gradient glass cards and an allocation ring
- **Pulse markets** — Transfer / Swap / Buy plus market chips

## Sideload on iPhone (Sideloadly)

Sideloadly installs an **.ipa**. Building that file needs a Mac with Xcode and a free Apple ID. This Linux/web preview cannot sign an IPA for you.

1. On a Mac: `npm install` then `npm run cap:sync`
2. `npx cap open ios` (opens the Xcode project in `ios/`)
3. In Xcode, select the **App** target → **Signing & Capabilities** → check **Automatically manage signing** → Team = your Apple ID
4. Set the bundle id if needed (default `com.larpsim.wallet`)
5. **Product → Archive**, then **Distribute App → Custom → Debugging** (or Ad Hoc) to export an `.ipa`
6. Open [Sideloadly](https://sideloadly.io/) on Windows or Mac, pick that IPA, your Apple ID, and your device

Apple’s 7-day free-dev certificate applies. Re-sideload when it expires.

### Without Sideloadly

On iPhone Safari, open the deployed or local site → Share → **Add to Home Screen**. That is a PWA, not a native IPA.

## What it does not do

No seed phrases, wallet connect, or real transfers. Do not use it to misrepresent holdings or solicit funds.
