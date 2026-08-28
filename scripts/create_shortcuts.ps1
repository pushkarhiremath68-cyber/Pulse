$rootDir = (Resolve-Path "$PSScriptRoot\..").Path
$exePath = Join-Path $rootDir "dist\win-app\Pulse Music-win32-x64\Pulse Music.exe"
$iconPath = Join-Path $rootDir "public\icons\icon.ico"
$workingDir = Join-Path $rootDir "dist\win-app\Pulse Music-win32-x64"

if (-not (Test-Path $exePath)) {
    Write-Error "Pulse Music.exe not found at $exePath"
    exit 1
}

$desktop1 = [Environment]::GetFolderPath('Desktop')
$desktop2 = "C:\Users\pushk\Desktop"
$startMenu = [Environment]::GetFolderPath('Programs')

$targets = @()
if ($desktop1 -and (Test-Path $desktop1)) {
    $targets += (Join-Path $desktop1 "Pulse Music.lnk")
}
if ($desktop2 -and (Test-Path $desktop2) -and ($desktop2 -ne $desktop1)) {
    $targets += (Join-Path $desktop2 "Pulse Music.lnk")
}
$targets += (Join-Path $rootDir "Pulse Music.lnk")

$WshShell = New-Object -ComObject WScript.Shell

foreach ($target in $targets) {
    try {
        $Shortcut = $WshShell.CreateShortcut($target)
        $Shortcut.TargetPath = $exePath
        $Shortcut.WorkingDirectory = $workingDir
        $Shortcut.IconLocation = "$iconPath,0"
        $Shortcut.Description = "Pulse Music - High-Fidelity Streaming App"
        $Shortcut.Save()
        Write-Host "Created shortcut: $target"
    } catch {
        Write-Warning "Could not create shortcut at $target : $_"
    }
}

if ($startMenu -and (Test-Path $startMenu)) {
    $startMenuTarget = Join-Path $startMenu "Pulse Music.lnk"
    try {
        Copy-Item (Join-Path $rootDir "Pulse Music.lnk") $startMenuTarget -Force
        Write-Host "Created Start Menu shortcut: $startMenuTarget"
    } catch {
        Write-Warning "Could not copy shortcut to Start Menu: $_"
    }
}

Write-Host "`nAll shortcuts successfully created with Pulse logo icon!"
