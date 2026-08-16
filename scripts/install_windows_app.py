import os
import subprocess

def install_app():
    desktop = os.path.expanduser("~/OneDrive/Desktop")
    if not os.path.exists(desktop):
        desktop = os.path.expanduser("~/Desktop")
    
    start_menu = os.path.expanduser("~/AppData/Roaming/Microsoft/Windows/Start Menu/Programs")
    icon_path = os.path.abspath("public/icons/icon.ico")
    app_url = "https://pushkarhiremath68-cyber.github.io/Pulse/"
    
    edge_paths = [
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    ]
    
    browser_exe = None
    for p in edge_paths:
        if os.path.exists(p):
            browser_exe = p
            break
            
    if not browser_exe:
        browser_exe = "msedge.exe"
        
    ps_script = f'''
$WshShell = New-Object -ComObject WScript.Shell
$desktopShortcut = $WshShell.CreateShortcut("{desktop}\\Pulse Music.lnk")
$desktopShortcut.TargetPath = "{browser_exe}"
$desktopShortcut.Arguments = '--app={app_url}'
$desktopShortcut.IconLocation = "{icon_path},0"
$desktopShortcut.Description = "Pulse Music - by Pushkar Hiremath"
$desktopShortcut.Save()

if (Test-Path "{start_menu}") {{
    $startShortcut = $WshShell.CreateShortcut("{start_menu}\\Pulse Music.lnk")
    $startShortcut.TargetPath = "{browser_exe}"
    $startShortcut.Arguments = '--app={app_url}'
    $startShortcut.IconLocation = "{icon_path},0"
    $startShortcut.Description = "Pulse Music - by Pushkar Hiremath"
    $startShortcut.Save()
}}
Write-Host "SHORTCUT_CREATED_SUCCESSFULLY"
'''
    
    res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True, text=True)
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)

if __name__ == "__main__":
    install_app()
