import re
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
with open(os.path.join(ROOT, 'src', 'musicService.js'), 'r', encoding='utf-8') as f:
    text = f.read()

covers = re.findall(r'"cover":\s*"([^"]+)"', text)
print('Total covers in DEMO_CATALOG:', len(covers))
print('Unsplash covers (blurred/generic stock photos):', sum(1 for c in covers if 'unsplash.com' in c))
print('Apple Music / mzstatic HD covers:', sum(1 for c in covers if 'mzstatic.com' in c))
print('YouTube HD covers:', sum(1 for c in covers if 'ytimg.com' in c))
print('Pulse logo placeholder covers:', sum(1 for c in covers if 'pulse-logo' in c))
