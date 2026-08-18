import re

# 1. Update index.html - Remove video button in fullscreen player header
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove toggle-video-modal-btn
html = re.sub(
    r'<button id="toggle-video-modal-btn"[^>]*>[\s\S]*?</button>\s*',
    '',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Removed video button from index.html header")

# 2. Update src/main.js - Clean up legacy lyrics block and wire to loadTrackLyrics
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Replace legacy loadTrackLyrics and renderLyricsDrawer (lines 3491-3668)
clean_drawer_lyrics = """
  function renderLyricsDrawer() {
    const track = state.currentTrack || (window.playbarController && typeof window.playbarController.getState === 'function' && window.playbarController.getState().currentTrack);
    if (track) {
      loadTrackLyrics(track);
    } else {
      updateLyricsUIEmpty();
    }
  }

  function updateLyricsProgress(currentTime) {
    if (typeof window.syncLiveLyrics === 'function') {
      window.syncLiveLyrics(currentTime);
    }
  }
"""

main_js = re.sub(
    r'async function loadTrackLyrics\(track\)\s*\{[\s\S]*?window\.seekToLyric = function\(secs\)[\s\S]*?\};\n',
    clean_drawer_lyrics,
    main_js
)

# Ensure openLyricsForTrack grabs track properly
main_js = main_js.replace(
    "if (!track) track = state.currentTrack;\n    if (!track) return;",
    "if (!track) track = state.currentTrack || (window.playbarController && typeof window.playbarController.getState === 'function' && window.playbarController.getState().currentTrack);\n    if (!track) return;"
)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)
print("[OK] Updated src/main.js lyrics drawer hooks")

# 3. Update src/playbarController.js - Call loadTrackLyrics when playing track
with open('src/playbarController.js', 'r', encoding='utf-8') as f:
    playbar_js = f.read()

if 'window.loadTrackLyrics' not in playbar_js:
    playbar_js = playbar_js.replace(
        'async function playTrack(track, seekSeconds = 0) {',
        'async function playTrack(track, seekSeconds = 0) {\n    if (track && typeof window.loadTrackLyrics === "function") window.loadTrackLyrics(track);\n'
    )

with open('src/playbarController.js', 'w', encoding='utf-8') as f:
    f.write(playbar_js)
print("[OK] Hooked loadTrackLyrics into playbarController.js")
