Set WshShell = CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
strPrograms = WshShell.SpecialFolders("Programs")

' Create Desktop Shortcut
Set oLink = WshShell.CreateShortcut(strDesktop & "\Pulse Music.lnk")
oLink.TargetPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
oLink.Arguments = "--app=https://pushkarhiremath68-cyber.github.io/Pulse/"
oLink.IconLocation = "C:\Users\pushk\.gemini\antigravity-ide\scratch\pulse-music-app\public\icons\icon.ico,0"
oLink.Description = "Pulse Music - by Pushkar Hiremath"
oLink.Save

' Create Start Menu Shortcut
Set oLinkStart = WshShell.CreateShortcut(strPrograms & "\Pulse Music.lnk")
oLinkStart.TargetPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
oLinkStart.Arguments = "--app=https://pushkarhiremath68-cyber.github.io/Pulse/"
oLinkStart.IconLocation = "C:\Users\pushk\.gemini\antigravity-ide\scratch\pulse-music-app\public\icons\icon.ico,0"
oLinkStart.Description = "Pulse Music - by Pushkar Hiremath"
oLinkStart.Save

WScript.Echo "PULSE_SHORTCUTS_CREATED"
