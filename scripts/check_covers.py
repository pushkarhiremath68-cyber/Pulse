import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog_json_str = match.group(1)
catalog = json.loads(catalog_json_str)

print(f"Total songs in catalog: {len(catalog)}")
missing_cover = 0
yt_thumbnails = 0
apple_covers = 0
other_covers = 0

for t in catalog:
    cov = t.get('cover')
    if not cov:
        missing_cover += 1
    elif 'ytimg.com' in cov:
        yt_thumbnails += 1
    elif 'mzstatic.com' in cov or 'apple.com' in cov:
        apple_covers += 1
    else:
        other_covers += 1

print(f"Summary of covers in catalog:")
print(f"  - Apple Music 600x600 HD covers: {apple_covers}")
print(f"  - YouTube HQ Thumbnails: {yt_thumbnails}")
print(f"  - Other Verified / Dynamic covers: {other_covers}")
print(f"  - Missing covers: {missing_cover}")
