import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src', 'musicService.js'), 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);'
match = re.search(pattern, text, re.DOTALL)
if match:
    catalog_json = match.group(1)
    track_matches = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"(?:.*?)"cover":\s*"([^"]+)"', catalog_json, re.DOTALL)
    unsplash_samples = [t for t in track_matches if 'unsplash.com' in t[3]][:20]
    print(f"Sample of 20 tracks with unsplash covers:")
    for t in unsplash_samples:
        print(f"  - ID: {t[0]} | Title: {t[1]} | Artist: {t[2]}")
