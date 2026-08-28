#!/bin/bash
# Pulse Music - Linux Desktop Shortcut Installer
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_FILE="$SCRIPT_DIR/Pulse-Music.desktop"
USER_DESKTOP="$HOME/Desktop"
USER_APPS="$HOME/.local/share/applications"

echo "  🎵 Pulse Music Linux Shortcut Installer"

if [ -f "$DESKTOP_FILE" ]; then
    if [ -d "$USER_DESKTOP" ]; then
        cp "$DESKTOP_FILE" "$USER_DESKTOP/"
        chmod +x "$USER_DESKTOP/Pulse-Music.desktop" 2>/dev/null
        echo "  [OK] Added to Desktop"
    fi
    mkdir -p "$USER_APPS"
    cp "$DESKTOP_FILE" "$USER_APPS/"
    echo "  [OK] Added to App Menu"
    update-desktop-database "$USER_APPS" 2>/dev/null
    echo "  Done! 🎵"
else
    echo "  [!] Pulse-Music.desktop not found"
fi
