#!/bin/bash
# Pulse Music - macOS Application Installer
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo ""
echo "  🎵 Pulse Music macOS Installer"
echo ""

APP_FOUND=""
for arch in universal arm64 x64; do
    APP="$DIR/dist/mac-app/Pulse Music-darwin-$arch/Pulse Music.app"
    if [ -d "$APP" ]; then
        APP_FOUND="$APP"
        break
    fi
done

if [ -z "$APP_FOUND" ]; then
    echo "  [!] No Pulse Music.app found. Build first with: npm run dist:mac"
    echo "  Opening web version instead..."
    open "https://pushkarhiremath68-cyber.github.io/Pulse/"
    exit 1
fi

echo "  [*] Installing to /Applications..."
cp -R "$APP_FOUND" /Applications/
echo "  [OK] Installed to /Applications/Pulse Music.app"
open "/Applications/Pulse Music.app"
