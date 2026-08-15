import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(ROOT, 'src', 'musicService.js'), 'r', encoding='utf-8') as f:
    content = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\]);', content, re.DOTALL)
if match:
    catalog_json = match.group(1)
    # Parse track objects
    track_matches = re.findall(r'\{\s*"id":\s*"([^"]+)"(?:.*?),?\s*"title":\s*"([^"]+)"(?:.*?),?\s*"artist":\s*"([^"]+)"', catalog_json)
    print(f"Total tracks parsed: {len(track_matches)}")
    
    # Check fields in raw catalog
    with_ytid = len(re.findall(r'"ytId":\s*"([^"]+)"', catalog_json))
    with_ytquery = len(re.findall(r'"ytSearchQuery":\s*"([^"]+)"', catalog_json))
    print(f"Tracks with ytId: {with_ytid}")
    print(f"Tracks with ytSearchQuery: {with_ytquery}")
    print(f"Tracks without ytId: {len(track_matches) - with_ytid}")
