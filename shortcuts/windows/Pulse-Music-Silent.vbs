Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
strRoot = strPath & "\..\.."
If CreateObject("Scripting.FileSystemObject").FileExists(strRoot & "\dist\win-app\Pulse Music-win32-x64\Pulse Music.exe") Then
    WshShell.Run """" & strRoot & "\dist\win-app\Pulse Music-win32-x64\Pulse Music.exe" & """", 1, False
Else
    WshShell.Run "cmd /c cd /d """ & strRoot & """ && npm run dev", 0, False
    WScript.Sleep 3000
    WshShell.Run "http://localhost:5173", 1, False
End If
