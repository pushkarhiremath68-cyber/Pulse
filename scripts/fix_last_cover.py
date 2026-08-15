import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
catalog = json.loads(match.group(1))

for t in catalog:
    if t.get('id') == 'kn-kannu-hodiyaka' or not t.get('cover'):
        t['cover'] = 'https://i.ytimg.com/vi/4vQY5kEw0jI/hqdefault.jpg'

updated_json = json.dumps(catalog, indent=2, ensure_ascii=False)
replacement = f"const DEMO_CATALOG = {updated_json}.map(normalizeTrack);"

new_js_code = js_code[:match.start()] + replacement + js_code[match.end():]
with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(new_js_code)

print("Updated kn-kannu-hodiyaka cover!")
