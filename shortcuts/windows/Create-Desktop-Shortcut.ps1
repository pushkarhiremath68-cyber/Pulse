# Pulse Music - Desktop Shortcut Creator for Windows
# Run: powershell -ExecutionPolicy Bypass -File Create-Desktop-Shortcut.ps1

$AppName = "Pulse Music"
$Desktop = [System.Environment]::GetFolderPath("Desktop")
$StartMenu = [System.Environment]::GetFolderPath("StartMenu")
$RootDir = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$ElectronExe = Join-Path $RootDir "dist\win-app\$AppName-win32-x64\$AppName.exe"
$BatLauncher = Join-Path $PSScriptRoot "Launch-Pulse.bat"
$IconPath = Join-Path $RootDir "icons\icon.ico"

if (Test-Path $ElectronExe) {
    $Target = $ElectronExe
} elseif (Test-Path $BatLauncher) {
    $Target = $BatLauncher
} else {
    $Target = "https://pushkarhiremath68-cyber.github.io/Pulse/"
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

$StartMenuDir = Join-Path $StartMenu "Programs\$AppName"
if (-not (Test-Path $StartMenuDir)) { New-Item $StartMenuDir -ItemType Directory -Force | Out-Null }
$StartMenuLnk = Join-Path $StartMenuDir "$AppName.lnk"
New-Shortcut $StartMenuLnk $Target $IconPath "High-Fidelity Cross-Platform Music Streaming"

Write-Host ""
Write-Host "=== Pulse Music shortcuts created! ===" -ForegroundColor Cyan
Write-Host "  Desktop:    $DesktopLnk"
Write-Host "  Start Menu: $StartMenuLnk"
Write-Host ""
Read-Host "Press Enter to close"
