import subprocess

res = subprocess.run(["git", "show", "HEAD~10:src/main.js"], capture_output=True, text=True, errors='ignore')
content = res.stdout

for fn in ['formatTime', 'setTrack', 'updatePlayPauseUI', 'renderAllHomeGrids', 'parseDurationSeconds']:
    pos = content.find(f"function {fn}")
    if pos != -1:
        print(f"Found function {fn} in git history (pos {pos})")
    else:
        print(f"Not found: function {fn}")
