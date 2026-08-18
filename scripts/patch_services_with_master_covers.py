import re

with open('scratch/master_covers.js', 'r', encoding='utf-8') as f:
    master_covers_js = f.read()

# 1. Patch src/musicService.js
with open('src/musicService.js', 'r', encoding='utf-8') as f:
    music_js = f.read()

# Insert MASTER_OFFICIAL_COVERS before normalizeTrack
if 'const MASTER_OFFICIAL_COVERS' not in music_js:
    music_js = music_js.replace(
        '  function normalizeTrack(raw) {',
        f'{master_covers_js}\n  function normalizeTrack(raw) {{\n    if (!raw) return null;\n    const officialCover = getOfficialCover(raw.title || raw.name, raw.artist || raw.singers);\n    if (officialCover) raw.cover = officialCover;\n'
    )
else:
    # Replace existing
    music_js = re.sub(r'const MASTER_OFFICIAL_COVERS = \{[\s\S]*?\}\n', master_covers_js, music_js)

# Update STARTER_HITS with complete 100% covers
music_js = music_js.replace(
    "{ id: 'global-8', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', duration: '3:24', category: 'rock', language: 'English' }",
    "{ id: 'global-8', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg', streamUrl: 'https://aac.saavncdn.com/248/46944eb7b4b31f5b0abf5eb2e1be2d2a_320.mp4', duration: '3:24', category: 'rock', language: 'English' }"
)

with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(music_js)
print("[OK] Patched src/musicService.js with master official covers.")

# 2. Patch src/catalogService.js
with open('src/catalogService.js', 'r', encoding='utf-8') as f:
    cat_js = f.read()

if 'const MASTER_OFFICIAL_COVERS' not in cat_js:
    cat_js = cat_js.replace(
        '  function normalizeCatalogTrack(raw) {',
        f'{master_covers_js}\n  function normalizeCatalogTrack(raw) {{\n    if (!raw) return null;\n    const officialCover = getOfficialCover(raw.title || raw.name, raw.artist || raw.artist_name);\n    if (officialCover) raw.cover = officialCover;\n'
    )
else:
    cat_js = re.sub(r'const MASTER_OFFICIAL_COVERS = \{[\s\S]*?\}\n', master_covers_js, cat_js)

with open('src/catalogService.js', 'w', encoding='utf-8') as f:
    f.write(cat_js)
print("[OK] Patched src/catalogService.js with master official covers.")

# 3. Patch src/main.js
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Update createMusicCardHTML
main_js = main_js.replace(
    "const cover = track.cover || track.coverUrl || track.coverArt || (window.generateTrackCover ? window.generateTrackCover(title, track.artist) : './pulse-logo.png');",
    "const cover = (window.getOfficialCover && window.getOfficialCover(title, track.artist)) || track.cover || track.coverUrl || track.coverArt || (window.generateTrackCover ? window.generateTrackCover(title, track.artist) : './pulse-logo.png');"
)

# Export getOfficialCover globally
if 'window.getOfficialCover' not in main_js:
    main_js = master_covers_js + "\nwindow.getOfficialCover = getOfficialCover;\n" + main_js

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)
print("[OK] Patched src/main.js with global official cover resolver.")
