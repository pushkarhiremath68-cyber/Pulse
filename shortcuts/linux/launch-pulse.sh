#!/bin/bash
# Pulse Music Linux Launch Script
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

echo ""
echo "  ========================================"
echo "   🎵 Pulse Music v2.4.0"
echo "  ========================================"
echo ""

for f in dist/electron/*.AppImage *.AppImage public/downloads/*.AppImage; do
    if [ -f "$f" ]; then
        echo "  [*] Launching AppImage: $f"
        chmod +x "$f" 2>/dev/null
        "$f" &
        exit 0
    fi
done

if command -v npm >/dev/null 2>&1; then
    echo "  [*] Starting dev server..."
    xdg-open "http://localhost:5173" 2>/dev/null &
    npm run dev
    exit 0
fi

echo "  [*] Opening in browser..."
xdg-open "https://pushkarhiremath68-cyber.github.io/Pulse/" 2>/dev/null
