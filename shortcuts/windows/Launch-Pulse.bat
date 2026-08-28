@echo off
title Pulse Music - Launcher
color 0D
echo.
echo   ========================================
echo      Pulse Music v2.4.0
echo      High-Fidelity Cross-Platform Music Streaming
echo      by Pushkar Hiremath
echo   ========================================
echo.
set "APP_DIR=%~dp0..\.."
cd /d "%APP_DIR%" 2>nul
if exist "dist\win-app\Pulse Music-win32-x64\Pulse Music.exe" (
    echo   [*] Launching Pulse Music Desktop App...
    start "" "dist\win-app\Pulse Music-win32-x64\Pulse Music.exe"
    exit /b 0
)
if exist "dist\electron\Pulse Music Setup 2.4.0.exe" (
    echo   [*] Launching Pulse Music Installer...
    start "" "dist\electron\Pulse Music Setup 2.4.0.exe"
    exit /b 0
)
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [*] Starting Pulse Music Dev Server...
    echo   [*] Open your browser to http://localhost:5173
    start "" "http://localhost:5173"
    npm run dev
    exit /b 0
)
echo   [*] Opening Pulse Music in your browser...
start "" "https://pushkarhiremath68-cyber.github.io/Pulse/"
exit /b 0
