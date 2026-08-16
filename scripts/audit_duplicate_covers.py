import os
import json
import re
import urllib.request
import urllib.parse
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS_PATH = os.path.join(ROOT, 'src', 'musicService.js')

with open(MS_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Find duplicate covers
covers_to_tracks = defaultdict(list)
for m in re.finditer(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)",\s*"album":\s*"([^"]+)",\s*"cover":\s*"([^"]+)"', content):
    tid, title, artist, album, cover = m.groups()
    covers_to_tracks[cover].append((tid, title, artist, album))

duplicates = {c: trs for c, trs in covers_to_tracks.items() if len(trs) > 1 and not c.startswith('data:') and not 'pulse-logo' in c}
print(f"Found {len(duplicates)} duplicate cover URLs assigned across multiple songs:")
for c, trs in list(duplicates.items())[:10]:
    print(f"\nCover URL: {c[:80]}...")
    for tid, title, artist, album in trs:
        print(f"  - [{tid}] {title} by {artist} ({album})")
