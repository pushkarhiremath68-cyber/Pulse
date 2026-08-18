import re

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

print('=== POINTER EVENTS RULES IN CSS ===')
pe_rules = re.findall(r'([^{}]+)\{[^{}]*pointer-events:[^{}]*\}', css, re.I)
for r in pe_rules:
    print('  ', r.strip().replace('\n', ' ')[:100])

print('\n=== HIGH Z-INDEX RULES IN CSS (>100) ===')
z_rules = re.findall(r'([^{}]+)\{[^{}]*z-index:\s*(\d{3,})[^{}]*\}', css, re.I)
for sel, z in z_rules:
    print(f'   z-index={z}: {sel.strip().replace(chr(10), " ")[:100]}')

print('\n=== CHECKING INDEX.HTML TOP & INLINE SCRIPTS ===')
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check for any fixed overlays that lack .hidden
fixed_divs = re.findall(r'<div[^>]+(?:class|id)=[\'"][^\'"]*[\'"][^>]*>', html, re.I)
for d in fixed_divs:
    if any(k in d for k in ['modal', 'splash', 'overlay', 'backdrop', 'drawer', 'popup']):
        print('  Overlay element in DOM:', d[:120])
