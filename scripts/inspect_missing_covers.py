import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
catalog = json.loads(match.group(1))

missing = [t for t in catalog if not t.get('cover')]
print(f"Total missing covers: {len(missing)}")
for t in missing[:25]:
    print(f" - [{t.get('id')}] {t.get('title')} by {t.get('artist')}")
