import subprocess

res = subprocess.run(["git", "show", "HEAD~10:src/main.js"], capture_output=True, text=True, errors='ignore')
content = res.stdout

print(f"HEAD~10 src/main.js length: {len(content)} characters, {len(content.splitlines())} lines")

# Check all critical functions
funcs = [
    'bindElements', 'initApp', 'attachEventListeners', 'setTrack', 'togglePlayPause',
    'playNextTrack', 'playPrevTrack', 'seekTo', 'seekRelative', 'setVolume',
    'toggleMute', 'toggleShuffle', 'toggleRepeat', 'formatTime', 'parseDurationSeconds',
    'updatePlayPauseUI', 'updateProgressTimeline', 'renderAllHomeGrids', 'renderLikedTracksView',
    'renderHistoryView', 'executeSearch', 'loginUser', 'logoutUser'
]

for fn in funcs:
    if f"function {fn}" in content or f"const {fn}" in content:
        print(f"  {fn:25}: PRESENT")
    else:
        print(f"  {fn:25}: MISSING")
