#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "$(uname -s)" != "Darwin" ]]; then
  cat <<'TXT'
This computer is not macOS, so it cannot compile an iPhone IPA.

Use GitHub’s online Mac (free for public repos):
  1. Create a GitHub repo and push this project
  2. GitHub → Actions → “Build Sideloadly IPA” → Run workflow
  3. Download CoinbaseLARP.ipa from the run
  4. Sideloadly → that IPA → your Apple ID

Or on a real Mac:
  npm install
  npm run ipa
TXT
  exit 1
fi

export CAPACITOR=1
npx next build
npx cap sync ios
mkdir -p dist

SIGN=(
  CODE_SIGN_IDENTITY=
  CODE_SIGNING_REQUIRED=NO
  CODE_SIGNING_ALLOWED=NO
  DEVELOPMENT_TEAM=
)

xcodebuild \
  -project "$ROOT/ios/App/App.xcodeproj" \
  -scheme App \
  -configuration Release \
  -sdk iphoneos \
  -destination "generic/platform=iOS" \
  -archivePath "$ROOT/dist/App.xcarchive" \
  -skipPackagePluginValidation \
  -skipMacroValidation \
  "${SIGN[@]}" \
  archive

APP="$(find "$ROOT/dist/App.xcarchive/Products/Applications" -name '*.app' | head -1 || true)"
if [[ -z "${APP:-}" ]]; then
  echo "Archive had no .app; falling back to a device build"
  xcodebuild \
    -project "$ROOT/ios/App/App.xcodeproj" \
    -scheme App \
    -configuration Release \
    -sdk iphoneos \
    -destination "generic/platform=iOS" \
    -derivedDataPath "$ROOT/dist/DerivedData" \
    -skipPackagePluginValidation \
    -skipMacroValidation \
    "${SIGN[@]}" \
    build
  APP="$(find "$ROOT/dist/DerivedData/Build/Products/Release-iphoneos" -maxdepth 1 -name '*.app' | head -1)"
fi

if [[ -z "${APP:-}" || ! -d "$APP" ]]; then
  echo "Could not find App.app after xcodebuild" >&2
  exit 1
fi

rm -rf "$ROOT/dist/Payload"
mkdir -p "$ROOT/dist/Payload"
cp -R "$APP" "$ROOT/dist/Payload/"
(cd "$ROOT/dist" && rm -f CoinbaseLARP.ipa && zip -qry CoinbaseLARP.ipa Payload)
echo "Wrote $ROOT/dist/CoinbaseLARP.ipa"
ls -lh "$ROOT/dist/CoinbaseLARP.ipa"
