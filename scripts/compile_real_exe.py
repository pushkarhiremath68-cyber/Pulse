import os
import subprocess
import shutil

def compile_windows_binary():
    csc = r"C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
    src = os.path.abspath(r"scripts\PulseLauncher.cs")
    icon = os.path.abspath(r"public\icons\icon.ico")
    out_exe = os.path.abspath(r"downloads\Pulse-Music-Setup-2.4.0.exe")
    
    os.makedirs(os.path.dirname(out_exe), exist_ok=True)
    
    cmd = [
        csc,
        "/target:winexe",
        "/platform:x64",
        f"/win32icon:{icon}",
        f"/out:{out_exe}",
        src
    ]
    
    print("Running command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Exit code:", res.returncode)
    print("STDOUT:", res.stdout)
    print("STDERR:", res.stderr)
    
    if res.returncode == 0 and os.path.exists(out_exe):
        size = os.path.getsize(out_exe)
        print(f"SUCCESS: Compiled real Windows PE binary: {out_exe} ({size} bytes)")
        
        # Copy to all Windows download alias files
        aliases = [
            r"downloads\Pulse-Music-2.4.0.exe",
            r"downloads\Pulse-Music-Windows-Setup.exe",
            r"downloads\Pulse-Setup.exe",
            r"storage\downloads\Pulse-Music-Setup-2.4.0.exe",
            r"storage\downloads\Pulse-Music-2.4.0.exe",
            r"storage\downloads\Pulse-Music-Windows-Setup.exe",
            r"storage\downloads\Pulse-Setup.exe",
            r"docs\downloads\Pulse-Music-Setup-2.4.0.exe",
            r"docs\downloads\Pulse-Music-2.4.0.exe",
            r"docs\downloads\Pulse-Music-Windows-Setup.exe",
            r"docs\downloads\Pulse-Setup.exe"
        ]
        
        for a in aliases:
            dest = os.path.abspath(a)
            os.makedirs(os.path.dirname(dest), exist_ok=True)
            shutil.copy2(out_exe, dest)
            print(f"  Copied to: {a}")
            
if __name__ == "__main__":
    compile_windows_binary()
