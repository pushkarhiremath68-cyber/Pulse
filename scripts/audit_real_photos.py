import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog = json.loads(match.group(1))

real_photos = 0
not_real_photos = []

for i, t in enumerate(catalog):
    c = t.get('cover', '')
    if c and (c.startswith('http://') or c.startswith('https://')) and ('mzstatic.com' in c or 'ytimg.com' in c or 'spotify' in c or 'google' in c or 'wikimedia' in c or 'jiosaavn' in c or 'saavn' in c or 'deezer' in c or 'ggpht.com' in c or '.jpg' in c or '.jpeg' in c or '.png' in c or '.webp' in c):
        real_photos += 1
    else:
        not_real_photos.append((i, t))

print(f"Total songs: {len(catalog)}")
print(f"Songs WITH REAL official photos: {real_photos}")
print(f"Songs WITHOUT real photos (SVG or generated): {len(not_real_photos)}")

print("\nSample songs without real photo covers:")
for i, t in not_real_photos[:15]:
    print(f" - [{t.get('id')}] '{t.get('title')}' by '{t.get('artist')}' (cover: {str(t.get('cover'))[:30]})")
