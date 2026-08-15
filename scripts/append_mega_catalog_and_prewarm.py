import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')
INDEX_PATH = os.path.join(ROOT, 'index.html')

from generate_devotional_catalog import DEVOTIONAL_TRACKS
from generate_multilingual_500 import MULTILINGUAL_TRACKS

ALL_NEW_TRACKS = DEVOTIONAL_TRACKS + MULTILINGUAL_TRACKS
print(f"Total New Tracks to integrate: {len(ALL_NEW_TRACKS)}")

# Read musicService.js
with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    ms_content = f.read()

# Find DEMO_CATALOG end
end_pattern = r'(\n\s*\}\s*\n)(\s*\]\.map\(normalizeTrack\);)'
match = re.search(end_pattern, ms_content)
if not match:
    print("Could not find end of DEMO_CATALOG array")
    exit(1)

# Extract existing IDs
existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', ms_content))
print(f"Existing tracks in catalog: {len(existing_ids)}")

tracks_to_add = []
for tid, title, artist, album, duration, category, lang, query in ALL_NEW_TRACKS:
    if tid not in existing_ids:
        track_obj = {
            "id": tid,
            "title": title,
            "artist": artist,
            "album": album,
            "duration": duration,
            "category": category,
            "ytId": "",
            "ytSearchQuery": query,
            "storagePath": f"{tid}.mp3",
            "source": f"Pulse {category.title()} Vault"
        }
        tracks_to_add.append(track_obj)
        existing_ids.add(tid)

print(f"Adding {len(tracks_to_add)} unique new tracks to musicService.js...")

# Format as JSON string for inclusion in DEMO_CATALOG
formatted_new_tracks = ",\n" + ",\n".join([f"  {json.dumps(t, indent=2)}" for t in tracks_to_add])

# Insert before closing bracket
updated_ms_content = ms_content[:match.end(1)] + formatted_new_tracks + "\n" + ms_content[match.start(2):]

with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
    f.write(updated_ms_content)

print(f"Updated {MUSIC_SERVICE_PATH} successfully! Total tracks now: {len(existing_ids)}")
