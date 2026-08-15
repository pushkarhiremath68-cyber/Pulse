import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = 'const DEMO_CATALOG = ['
end_marker = '].map(normalizeTrack);'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    catalog_str = content[start_idx + len(start_marker) - 1 : end_idx + 1]
    try:
        catalog = json.loads(catalog_str)
        print(f"Successfully loaded {len(catalog)} tracks from DEMO_CATALOG!")
    except Exception as e:
        print(f"Parse error: {e}")
else:
    print("Could not find markers.")
