import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

print('=== 1. DIV TAG BALANCE ===')
opens = len(re.findall(r'<div\b', html, re.I))
closes = len(re.findall(r'</div>', html, re.I))
print(f'Div balance: opens={opens}, closes={closes}, diff={opens - closes}')

print('\n=== 2. MODAL & OVERLAY ELEMENTS IN DOM ===')
overlays = re.findall(r'<div[^>]+(?:class|id)=[\'"][^\'"]*(?:modal|overlay|splash|backdrop|drawer)[^\'"]*[\'"][^>]*>', html, re.I)
for i, o in enumerate(overlays):
    print(f'{i+1}. {o[:120]}')

print('\n=== 3. SCRIPT TAGS & GLOBAL EVENT LISTENERS IN INDEX.HTML ===')
scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html, re.I)
for i, s in enumerate(scripts):
    s_clean = s.strip()
    if not s_clean: continue
    print(f'--- Inline Script {i+1} ---')
    for line in s_clean.split('\n'):
        if any(k in line for k in ['addEventListener', 'preventDefault', 'stopPropagation', 'pointerEvents', 'pointer-events', 'display', 'zIndex']):
            print('  ', line.strip()[:100])

print('\n=== 4. CSS OVERLAYS & Z-INDEX IN SRC/STYLE.CSS ===')
with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

fixed_rules = re.findall(r'([^{}]+)\{[^{}]*position:\s*fixed[^{}]*\}', css, re.I)
for r in fixed_rules[:15]:
    selector = r.strip().replace('\n', ' ')
    print(f'Fixed selector: {selector[:100]}')
