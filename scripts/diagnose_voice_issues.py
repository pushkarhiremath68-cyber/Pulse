import os
import re
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(ROOT, 'src', 'main.js'), 'r', encoding='utf-8') as f:
    main_js = f.read()

with open(os.path.join(ROOT, 'src', 'musicService.js'), 'r', encoding='utf-8') as f:
    music_js = f.read()

# Extract YOUTUBE_TRACKS_MAP
map_match = re.search(r'const YOUTUBE_TRACKS_MAP = \{([^}]+)\};', main_js)
yt_map = {}
if map_match:
    for line in map_match.group(1).splitlines():
        m = re.search(r'[\'\"]([^\'\"]+)[\'\"]:\s*[\'\"]([^\'\"]+)[\'\"]', line)
        if m:
            yt_map[m.group(1)] = m.group(2)

print(f"YOUTUBE_TRACKS_MAP entries: {len(yt_map)}")

# Extract tracks from musicService.js
raw_tracks = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', music_js)
print(f"Found {len(raw_tracks)} tracks in musicService.js")

mismatches = 0
for tid, title, artist in raw_tracks:
    clean_title = re.sub(r'[^a-z0-9]', '', title.lower())
    matched_key = None
    if tid in yt_map:
        matched_key = tid
    else:
        for k in yt_map:
            clean_k = re.sub(r'[^a-z0-9]', '', k.replace('in-', ''))
            if clean_k and (clean_title in clean_k or clean_k in clean_title) and len(clean_title) >= 2:
                matched_key = k
                break
    if matched_key and matched_key != tid:
        mismatches += 1
        if mismatches <= 25:
            print(f"MISMATCH: '{title}' by {artist} (id: {tid}) -> matched '{matched_key}' (yid: {yt_map[matched_key]})")

print(f"\nTotal fuzzy mismatches across catalog: {mismatches} out of {len(raw_tracks)} tracks!")
