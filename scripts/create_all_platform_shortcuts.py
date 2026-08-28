"""
Pulse Music - Universal Cross-Platform Shortcut & Launcher Generator
Creates native shortcut files, launchers, and PWA install pages for ALL platforms.

Platforms:
  - Windows: .bat launcher, .vbs silent launcher, .url web shortcut, PowerShell desktop shortcut
  - macOS:   .command launcher, .webloc web shortcut, install script
  - Linux:   .desktop entry (FreeDesktop standard), .sh launcher
  - Android: PWA install page with Add-to-Homescreen instructions
  - iOS:     PWA install page with Add-to-Homescreen instructions
  - ChromeOS: Chrome bookmark import file
  - Web:     Universal HTML launcher page

Author: Pushkar Hiremath
"""

import os
import sys
import stat
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHORTCUTS_DIR = os.path.join(ROOT_DIR, 'shortcuts')
ICONS_DIR = os.path.join(ROOT_DIR, 'public', 'icons')
APP_NAME = 'Pulse Music'
APP_VERSION = '2.4.0'
APP_DESCRIPTION = 'High-Fidelity Cross-Platform Music Streaming'
APP_AUTHOR = 'Pushkar Hiremath'
APP_ID = 'app.pulsemusic.player'

DEPLOYED_URL = 'https://pushkarhiremath68-cyber.github.io/Pulse/'
LOCAL_DEV_URL = 'http://localhost:5173'


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def create_windows_shortcuts():
    win_dir = os.path.join(SHORTCUTS_DIR, 'windows')
    ensure_dir(win_dir)

    with open(os.path.join(win_dir, 'Launch-Pulse.bat'), 'w', newline='\r\n') as f:
        f.write(f'''@echo off
title {APP_NAME} - Launcher
color 0D
echo.
echo   ========================================
echo      {APP_NAME} v{APP_VERSION}
echo      {APP_DESCRIPTION}
echo      by {APP_AUTHOR}
echo   ========================================
echo.
set "APP_DIR=%~dp0..\\.."
cd /d "%APP_DIR%" 2>nul
if exist "dist\\win-app\\{APP_NAME}-win32-x64\\{APP_NAME}.exe" (
    echo   [*] Launching {APP_NAME} Desktop App...
    start "" "dist\\win-app\\{APP_NAME}-win32-x64\\{APP_NAME}.exe"
    exit /b 0
)
if exist "dist\\electron\\{APP_NAME} Setup {APP_VERSION}.exe" (
    echo   [*] Launching {APP_NAME} Installer...
    start "" "dist\\electron\\{APP_NAME} Setup {APP_VERSION}.exe"
    exit /b 0
)
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [*] Starting {APP_NAME} Dev Server...
    echo   [*] Open your browser to {LOCAL_DEV_URL}
    start "" "{LOCAL_DEV_URL}"
    npm run dev
    exit /b 0
)
echo   [*] Opening {APP_NAME} in your browser...
start "" "{DEPLOYED_URL}"
exit /b 0
''')

    with open(os.path.join(win_dir, 'Pulse-Music-Silent.vbs'), 'w', newline='\r\n') as f:
        f.write(f'''Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
strRoot = strPath & "\\..\\.."
If CreateObject("Scripting.FileSystemObject").FileExists(strRoot & "\\dist\\win-app\\{APP_NAME}-win32-x64\\{APP_NAME}.exe") Then
    WshShell.Run """" & strRoot & "\\dist\\win-app\\{APP_NAME}-win32-x64\\{APP_NAME}.exe" & """", 1, False
Else
    WshShell.Run "cmd /c cd /d """ & strRoot & """ && npm run dev", 0, False
    WScript.Sleep 3000
    WshShell.Run "{LOCAL_DEV_URL}", 1, False
End If
''')

    with open(os.path.join(win_dir, 'Pulse Music Web.url'), 'w', newline='\r\n') as f:
        f.write(f'''[InternetShortcut]
URL={DEPLOYED_URL}
IconIndex=0
IconFile={os.path.join(ICONS_DIR, 'icon.ico')}
HotKey=0
''')

    with open(os.path.join(win_dir, 'Create-Desktop-Shortcut.ps1'), 'w', newline='\r\n') as f:
        f.write('''# Pulse Music - Desktop Shortcut Creator for Windows
# Run: powershell -ExecutionPolicy Bypass -File Create-Desktop-Shortcut.ps1

$AppName = "Pulse Music"
$Desktop = [System.Environment]::GetFolderPath("Desktop")
$StartMenu = [System.Environment]::GetFolderPath("StartMenu")
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$ElectronExe = Join-Path $RootDir "dist\\win-app\\$AppName-win32-x64\\$AppName.exe"
$BatLauncher = Join-Path $PSScriptRoot "Launch-Pulse.bat"
$IconPath = Join-Path $RootDir "icons\\icon.ico"

if (Test-Path $ElectronExe) {
    $Target = $ElectronExe
} elseif (Test-Path $BatLauncher) {
    $Target = $BatLauncher
} else {
    $Target = "''' + DEPLOYED_URL + '''"
}

function New-Shortcut($Path, $Target, $Icon, $Description) {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($Path)
    $Shortcut.TargetPath = $Target
    $Shortcut.Description = $Description
    $Shortcut.WorkingDirectory = $RootDir
    if ($Icon -and (Test-Path $Icon)) {
        $Shortcut.IconLocation = "$Icon,0"
    }
    $Shortcut.Save()
    Write-Host "[+] Created shortcut: $Path" -ForegroundColor Green
}

$DesktopLnk = Join-Path $Desktop "$AppName.lnk"
New-Shortcut $DesktopLnk $Target $IconPath "High-Fidelity Cross-Platform Music Streaming"

$StartMenuDir = Join-Path $StartMenu "Programs\\$AppName"
if (-not (Test-Path $StartMenuDir)) { New-Item $StartMenuDir -ItemType Directory -Force | Out-Null }
$StartMenuLnk = Join-Path $StartMenuDir "$AppName.lnk"
New-Shortcut $StartMenuLnk $Target $IconPath "High-Fidelity Cross-Platform Music Streaming"

Write-Host ""
Write-Host "=== Pulse Music shortcuts created! ===" -ForegroundColor Cyan
Write-Host "  Desktop:    $DesktopLnk"
Write-Host "  Start Menu: $StartMenuLnk"
Write-Host ""
Read-Host "Press Enter to close"
''')

    print(f'  [Windows] Created 4 shortcut files in {win_dir}')


def create_macos_shortcuts():
    mac_dir = os.path.join(SHORTCUTS_DIR, 'macos')
    ensure_dir(mac_dir)

    cmd_path = os.path.join(mac_dir, 'Pulse Music.command')
    with open(cmd_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''#!/bin/bash
# {APP_NAME} macOS Launch Script
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

echo ""
echo "  ========================================"
echo "   🎵 {APP_NAME} v{APP_VERSION}"
echo "   {APP_DESCRIPTION}"
echo "   by {APP_AUTHOR}"
echo "  ========================================"
echo ""

for arch in universal arm64 x64; do
    APP="dist/mac-app/{APP_NAME}-darwin-$arch/{APP_NAME}.app"
    if [ -d "$APP" ]; then
        echo "  [*] Launching {APP_NAME} desktop app ($arch)..."
        open "$APP"
        exit 0
    fi
done

if command -v npm >/dev/null 2>&1; then
    echo "  [*] Starting {APP_NAME} Dev Server..."
    open "{LOCAL_DEV_URL}" &
    npm run dev
    exit 0
fi

echo "  [*] Opening {APP_NAME} in browser..."
open "{DEPLOYED_URL}"
''')
    try:
        os.chmod(cmd_path, os.stat(cmd_path).st_mode | stat.S_IEXEC)
    except Exception:
        pass

    with open(os.path.join(mac_dir, 'Pulse Music Web.webloc'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>URL</key>
    <string>{DEPLOYED_URL}</string>
</dict>
</plist>
''')

    sh_path = os.path.join(mac_dir, 'Install-to-Applications.sh')
    with open(sh_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''#!/bin/bash
# {APP_NAME} - macOS Application Installer
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
echo ""
echo "  🎵 {APP_NAME} macOS Installer"
echo ""

APP_FOUND=""
for arch in universal arm64 x64; do
    APP="$DIR/dist/mac-app/{APP_NAME}-darwin-$arch/{APP_NAME}.app"
    if [ -d "$APP" ]; then
        APP_FOUND="$APP"
        break
    fi
done

if [ -z "$APP_FOUND" ]; then
    echo "  [!] No {APP_NAME}.app found. Build first with: npm run dist:mac"
    echo "  Opening web version instead..."
    open "{DEPLOYED_URL}"
    exit 1
fi

echo "  [*] Installing to /Applications..."
cp -R "$APP_FOUND" /Applications/
echo "  [OK] Installed to /Applications/{APP_NAME}.app"
open "/Applications/{APP_NAME}.app"
''')
    try:
        os.chmod(sh_path, os.stat(sh_path).st_mode | stat.S_IEXEC)
    except Exception:
        pass

    print(f'  [macOS]   Created 3 shortcut files in {mac_dir}')


def create_linux_shortcuts():
    linux_dir = os.path.join(SHORTCUTS_DIR, 'linux')
    ensure_dir(linux_dir)

    icon_path = os.path.join(ICONS_DIR, 'icon-512.png').replace(os.sep, '/')

    with open(os.path.join(linux_dir, 'Pulse-Music.desktop'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''[Desktop Entry]
Version=1.0
Type=Application
Name={APP_NAME}
GenericName=Music Streaming Player
Comment={APP_DESCRIPTION} by {APP_AUTHOR}
Exec=bash -c 'DIR="$(dirname "$(readlink -f "%k")")/../.."; if [ -f "$DIR/dist/electron/{APP_NAME}-{APP_VERSION}.AppImage" ]; then "$DIR/dist/electron/{APP_NAME}-{APP_VERSION}.AppImage" %U; elif command -v npm >/dev/null 2>&1; then cd "$DIR" && xdg-open {LOCAL_DEV_URL} & npm run dev; else xdg-open {DEPLOYED_URL}; fi'
Icon={icon_path}
Terminal=false
StartupNotify=true
StartupWMClass=pulse-music-app
Categories=AudioVideo;Audio;Player;Music;
MimeType=audio/mpeg;audio/flac;audio/aac;audio/ogg;audio/wav;x-scheme-handler/pulse;
Keywords=music;stream;audio;lossless;karaoke;lyrics;pulse;
Actions=Search;Liked;Charts;WebApp;

[Desktop Action Search]
Name=Search Global Music
Exec=xdg-open "{DEPLOYED_URL}?view=search-view"

[Desktop Action Liked]
Name=Liked Songs
Exec=xdg-open "{DEPLOYED_URL}?view=library"

[Desktop Action Charts]
Name=Top Global Charts
Exec=xdg-open "{DEPLOYED_URL}?view=home"

[Desktop Action WebApp]
Name=Open Web App
Exec=xdg-open "{DEPLOYED_URL}"
''')

    sh_path = os.path.join(linux_dir, 'launch-pulse.sh')
    with open(sh_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''#!/bin/bash
# {APP_NAME} Linux Launch Script
DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$DIR"

echo ""
echo "  ========================================"
echo "   🎵 {APP_NAME} v{APP_VERSION}"
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
    xdg-open "{LOCAL_DEV_URL}" 2>/dev/null &
    npm run dev
    exit 0
fi

echo "  [*] Opening in browser..."
xdg-open "{DEPLOYED_URL}" 2>/dev/null
''')
    try:
        os.chmod(sh_path, os.stat(sh_path).st_mode | stat.S_IEXEC)
    except Exception:
        pass

    install_path = os.path.join(linux_dir, 'install-desktop-shortcut.sh')
    with open(install_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''#!/bin/bash
# {APP_NAME} - Linux Desktop Shortcut Installer
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_FILE="$SCRIPT_DIR/Pulse-Music.desktop"
USER_DESKTOP="$HOME/Desktop"
USER_APPS="$HOME/.local/share/applications"

echo "  🎵 {APP_NAME} Linux Shortcut Installer"

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
''')
    try:
        os.chmod(install_path, os.stat(install_path).st_mode | stat.S_IEXEC)
    except Exception:
        pass

    print(f'  [Linux]   Created 3 shortcut files in {linux_dir}')


def create_web_launcher():
    web_dir = os.path.join(SHORTCUTS_DIR, 'web')
    ensure_dir(web_dir)

    with open(os.path.join(web_dir, 'Launch-Pulse-Web.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{APP_NAME} - Launch</title>
  <meta name="description" content="{APP_DESCRIPTION} by {APP_AUTHOR}">
  <meta name="theme-color" content="#8b5cf6">
  <link rel="icon" type="image/png" sizes="192x192" href="../../public/icons/icon-192.png">
  <meta http-equiv="refresh" content="2; url={DEPLOYED_URL}">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      background: linear-gradient(135deg, #050508 0%, #0b0d14 40%, #1a0d2e 100%);
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100vh; overflow: hidden;
    }}
    .logo {{
      width: 120px; height: 120px; margin-bottom: 28px; border-radius: 24px;
      animation: pulse 2s infinite ease-in-out;
      filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
    }}
    @keyframes pulse {{
      0%, 100% {{ transform: scale(1); filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.4)); }}
      50% {{ transform: scale(1.06); filter: drop-shadow(0 0 40px rgba(139, 92, 246, 0.8)); }}
    }}
    h1 {{
      font-size: 28px; font-weight: 700; margin: 0 0 8px;
      background: linear-gradient(135deg, #fff, #c4b5fd);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }}
    .subtitle {{ color: #94a3b8; font-size: 14px; margin-bottom: 32px; }}
    .spinner {{
      width: 32px; height: 32px;
      border: 3px solid rgba(139, 92, 246, 0.2); border-top-color: #8b5cf6;
      border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px;
    }}
    @keyframes spin {{ to {{ transform: rotate(360deg); }} }}
    .status {{ color: #64748b; font-size: 13px; }}
    .link {{ margin-top: 24px; color: #8b5cf6; text-decoration: none; font-size: 13px; opacity: 0.7; }}
    .link:hover {{ opacity: 1; }}
  </style>
</head>
<body>
  <img class="logo" src="../../public/icons/icon-512.png" alt="{APP_NAME}"
       onerror="this.src='../../pulse-logo.png'">
  <h1>{APP_NAME}</h1>
  <p class="subtitle">{APP_DESCRIPTION}</p>
  <div class="spinner"></div>
  <p class="status">Redirecting to your music experience...</p>
  <a class="link" href="{DEPLOYED_URL}">Click here if not redirected</a>
  <script>setTimeout(function(){{ window.location.href = "{DEPLOYED_URL}"; }}, 1500);</script>
</body>
</html>
''')
    print(f'  [Web]     Created web launcher in {web_dir}')


def create_mobile_pwa_page():
    mobile_dir = os.path.join(SHORTCUTS_DIR, 'mobile')
    ensure_dir(mobile_dir)

    with open(os.path.join(mobile_dir, 'Install-Pulse-App.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>{APP_NAME} - Install App</title>
  <meta name="description" content="Install {APP_NAME} on your phone">
  <meta name="theme-color" content="#8b5cf6">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="icon" type="image/png" href="../../public/icons/icon-192.png">
  <link rel="apple-touch-icon" href="../../public/apple-touch-icon.png">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {{ margin: 0; padding: 0; box-sizing: border-box; }}
    body {{
      background: linear-gradient(180deg, #050508 0%, #0f0a1e 50%, #1a0d2e 100%);
      color: #fff; font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh; padding: 40px 20px;
    }}
    .header {{ text-align: center; margin-bottom: 40px; }}
    .logo {{
      width: 96px; height: 96px; border-radius: 22px; margin-bottom: 16px;
      filter: drop-shadow(0 0 24px rgba(139, 92, 246, 0.5));
    }}
    h1 {{
      font-size: 26px; font-weight: 700; margin-bottom: 6px;
      background: linear-gradient(135deg, #fff, #c4b5fd);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }}
    .tagline {{ color: #94a3b8; font-size: 14px; }}
    .open-btn {{
      display: block; width: 100%; max-width: 360px; margin: 24px auto;
      padding: 16px 24px; background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: #fff; border: none; border-radius: 14px; font-size: 17px; font-weight: 600;
      cursor: pointer; text-decoration: none; text-align: center;
      box-shadow: 0 4px 24px rgba(139, 92, 246, 0.4); transition: transform 0.2s;
    }}
    .open-btn:active {{ transform: scale(0.97); }}
    .section {{
      max-width: 420px; margin: 0 auto 32px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px; padding: 24px;
    }}
    .section h2 {{ font-size: 18px; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; gap: 10px; }}
    .steps {{ list-style: none; counter-reset: step; }}
    .steps li {{
      counter-increment: step; position: relative; padding-left: 36px;
      margin-bottom: 14px; font-size: 14px; line-height: 1.6; color: #cbd5e1;
    }}
    .steps li::before {{
      content: counter(step); position: absolute; left: 0; top: 1px;
      width: 24px; height: 24px; background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 600; color: #a78bfa;
    }}
    .steps li strong {{ color: #fff; }}
    .badge {{
      display: inline-block; padding: 2px 8px; background: rgba(139, 92, 246, 0.2);
      border-radius: 6px; font-size: 11px; color: #a78bfa; font-weight: 500;
    }}
    .features {{ max-width: 420px; margin: 0 auto; text-align: center; }}
    .features h3 {{ font-size: 15px; color: #94a3b8; margin-bottom: 12px; }}
    .fgrid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }}
    .feat {{
      background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px; padding: 14px 10px; font-size: 13px; color: #cbd5e1;
    }}
    .feat span {{ font-size: 20px; display: block; margin-bottom: 6px; }}
    .hidden {{ display: none; }}
  </style>
</head>
<body>
  <div class="header">
    <img class="logo" src="../../public/icons/icon-512.png" alt="{APP_NAME}"
         onerror="this.src='../../pulse-logo.png'">
    <h1>{APP_NAME}</h1>
    <p class="tagline">{APP_DESCRIPTION}</p>
  </div>
  <a class="open-btn" href="{DEPLOYED_URL}">🎵 Open {APP_NAME} Now</a>

  <div class="section hidden" id="android-section">
    <h2><span>🤖</span> Install on Android</h2>
    <ol class="steps">
      <li>Open <strong>{APP_NAME}</strong> in <strong>Chrome</strong></li>
      <li>Tap the <strong>⋮ menu</strong> (three dots) top-right</li>
      <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
      <li>Tap <strong>"Install"</strong> to confirm</li>
      <li>Find it on your home screen — works like a native app! <span class="badge">Full Screen</span></li>
    </ol>
  </div>

  <div class="section hidden" id="ios-section">
    <h2><span>🍎</span> Install on iPhone / iPad</h2>
    <ol class="steps">
      <li>Open <strong>{APP_NAME}</strong> in <strong>Safari</strong> (required)</li>
      <li>Tap the <strong>Share button</strong> (square with arrow) at the bottom</li>
      <li>Scroll down, tap <strong>"Add to Home Screen"</strong></li>
      <li>Tap <strong>"Add"</strong> in top-right</li>
      <li>Launch from home screen — full screen, no browser bars! <span class="badge">Native Feel</span></li>
    </ol>
  </div>

  <div class="section hidden" id="desktop-section">
    <h2><span>💻</span> Install on Desktop</h2>
    <ol class="steps">
      <li>Open <strong>{APP_NAME}</strong> in <strong>Chrome</strong> or <strong>Edge</strong></li>
      <li>Click the <strong>Install icon</strong> (⊕) in the address bar</li>
      <li>Click <strong>"Install"</strong> to add as a desktop app</li>
      <li>Find it in your Start Menu / Launchpad / Applications</li>
    </ol>
  </div>

  <div class="section hidden" id="apk-section">
    <h2><span>📦</span> Download Android APK</h2>
    <ol class="steps">
      <li><a href="{DEPLOYED_URL}downloads/Pulse-Music-v2.4.0.apk" style="color:#a78bfa;font-weight:600;">Download Pulse-Music-v2.4.0.apk</a></li>
      <li>Open the downloaded APK file</li>
      <li>Allow <strong>"Install from Unknown Sources"</strong> if prompted</li>
      <li>Tap <strong>Install</strong> and open {APP_NAME}!</li>
    </ol>
  </div>

  <div class="features">
    <h3>What you get</h3>
    <div class="fgrid">
      <div class="feat"><span>🎧</span>Lossless Audio</div>
      <div class="feat"><span>🎤</span>Synced Lyrics</div>
      <div class="feat"><span>📱</span>Background Play</div>
      <div class="feat"><span>🌍</span>All Languages</div>
    </div>
  </div>

  <script>
    (function() {{
      var ua = navigator.userAgent || '';
      var isAndroid = /android/i.test(ua);
      var isIOS = /iphone|ipad|ipod/i.test(ua);

      if (isAndroid) {{
        document.getElementById('android-section').classList.remove('hidden');
        document.getElementById('apk-section').classList.remove('hidden');
      }} else if (isIOS) {{
        document.getElementById('ios-section').classList.remove('hidden');
      }} else {{
        document.getElementById('desktop-section').classList.remove('hidden');
        document.getElementById('android-section').classList.remove('hidden');
        document.getElementById('ios-section').classList.remove('hidden');
      }}
    }})();
  </script>
</body>
</html>
''')
    print(f'  [Mobile]  Created PWA install guide in {mobile_dir}')


def create_chromeos_shortcut():
    chrome_dir = os.path.join(SHORTCUTS_DIR, 'chromeos')
    ensure_dir(chrome_dir)

    ts = str(int(time.time()))
    with open(os.path.join(chrome_dir, 'Pulse-Music-Bookmarks.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(f'''<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- {APP_NAME} Chrome Bookmark Import File -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="{ts}">Pulse Music</H3>
    <DL><p>
        <DT><A HREF="{DEPLOYED_URL}" ADD_DATE="{ts}">{APP_NAME}</A>
        <DT><A HREF="{DEPLOYED_URL}?view=search-view" ADD_DATE="{ts}">Pulse - Search</A>
        <DT><A HREF="{DEPLOYED_URL}?view=library" ADD_DATE="{ts}">Pulse - Library</A>
        <DT><A HREF="{DEPLOYED_URL}?view=home" ADD_DATE="{ts}">Pulse - Charts</A>
    </DL><p>
</DL><p>
''')
    print(f'  [ChromeOS] Created bookmark file in {chrome_dir}')


def main():
    print('')
    print('  ' + '=' * 46)
    print(f'   {APP_NAME} v{APP_VERSION}')
    print(f'   Cross-Platform Shortcut Generator')
    print(f'   by {APP_AUTHOR}')
    print('  ' + '=' * 46)
    print('')

    ensure_dir(SHORTCUTS_DIR)

    create_windows_shortcuts()
    create_macos_shortcuts()
    create_linux_shortcuts()
    create_web_launcher()
    create_mobile_pwa_page()
    create_chromeos_shortcut()

    print('')
    print('  All platform shortcuts created in:')
    print(f'     {SHORTCUTS_DIR}')
    print('')
    print('  Platforms covered:')
    print('    shortcuts/windows/   - .bat, .vbs, .url, .ps1')
    print('    shortcuts/macos/     - .command, .webloc, .sh')
    print('    shortcuts/linux/     - .desktop, .sh (x2)')
    print('    shortcuts/web/       - HTML redirect launcher')
    print('    shortcuts/mobile/    - PWA install guide (Android + iOS + APK)')
    print('    shortcuts/chromeos/  - Chrome bookmark import')
    print('')


if __name__ == '__main__':
    main()
