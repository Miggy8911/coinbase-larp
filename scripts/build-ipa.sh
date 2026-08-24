#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  cat <<'TXT'
This environment cannot compile an iPhone IPA (needs macOS + Xcode).

On a Mac:
  npm install
  npm run ipa

Then open Sideloadly, choose dist/CoinbaseLARP.ipa, sign with your Apple ID, install on the phone.
Free Apple IDs expire after 7 days; re-sideload when that happens.
TXT
  exit 1
fi

export CAPACITOR=1
npx next build
npx cap sync ios
mkdir -p dist
cd ios/App
xcodebuild -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath "$ROOT/dist/App.xcarchive" \
  CODE_SIGNING_ALLOWED=NO \
  archive
APP="$(find "$ROOT/dist/App.xcarchive/Products/Applications" -name '*.app' | head -1)"
rm -rf "$ROOT/dist/Payload"
mkdir -p "$ROOT/dist/Payload"
cp -R "$APP" "$ROOT/dist/Payload/"
(cd "$ROOT/dist" && rm -f CoinbaseLARP.ipa && zip -r CoinbaseLARP.ipa Payload)
echo "Wrote $ROOT/dist/CoinbaseLARP.ipa"
