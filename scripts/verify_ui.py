import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

required_ids = [
    "player-bar",
    "playbar-lyrics-btn",
    "mobile-playbar-lyrics-btn",
    "mobile-prev-btn",
    "mobile-next-btn",
    "playbar-play-btn",
    "playbar-maximize-btn",
    "fullscreen-player",
    "btn-fs-minimize",
    "fs-toggle-lyrics-btn",
    "fs-btn-like",
    "fs-album-art",
    "fs-track-title",
    "fs-track-artist",
    "fs-switch-lyrics-pill",
    "fs-lyrics-panel",
    "fs-lyrics-scroll-box",
    "fs-time-current",
    "fs-time-total",
    "fs-seek-slider",
    "fs-btn-shuffle",
    "fs-btn-prev",
    "fs-play-pause-btn",
    "fs-btn-next",
    "fs-btn-repeat"
]

all_passed = True
for elem_id in required_ids:
    pattern = rf'id=["\']{elem_id}["\']'
    if re.search(pattern, html):
        print(f"  [PASS] #{elem_id}")
    else:
        print(f"  [FAIL] #{elem_id} NOT found!")
        all_passed = False

if all_passed:
    print("\nSUCCESS: All playbar, fullscreen player, and live lyrics elements are present!")
else:
    print("\nFAILURE: Some elements are missing.")
