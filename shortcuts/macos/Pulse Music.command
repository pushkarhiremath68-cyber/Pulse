#!/bin/bash
# Pulse Music macOS Launch Script
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

echo ""
echo "  ========================================"
echo "   🎵 Pulse Music v2.4.0"
echo "   High-Fidelity Cross-Platform Music Streaming"
echo "   by Pushkar Hiremath"
echo "  ========================================"
echo ""

for arch in universal arm64 x64; do
    APP="dist/mac-app/Pulse Music-darwin-$arch/Pulse Music.app"
    if [ -d "$APP" ]; then
        echo "  [*] Launching Pulse Music desktop app ($arch)..."
        open "$APP"
        exit 0
    fi
done

if command -v npm >/dev/null 2>&1; then
    echo "  [*] Starting Pulse Music Dev Server..."
    open "http://localhost:5173" &
    npm run dev
    exit 0
fi

echo "  [*] Opening Pulse Music in browser..."
open "https://pushkarhiremath68-cyber.github.io/Pulse/"
