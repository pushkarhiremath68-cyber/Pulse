import re
import os

with open('docs/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script\b[^>]*>[\s\S]*?</script>', html, re.I)
print(f'Total script tags in docs/index.html: {len(scripts)}')
for i, s in enumerate(scripts):
    src = re.search(r'src=[\'"]([^\'"]+)[\'"]', s)
    src_val = src.group(1) if src else 'INLINE'
    type_m = re.search(r'type=[\'"]([^\'"]+)[\'"]', s)
    type_val = type_m.group(1) if type_m else 'standard'
    print(f'Script {i+1}: src={src_val}, type={type_val}')
    if src_val.startswith('.'):
        path = os.path.join('docs', src_val.lstrip('./'))
        exists = os.path.exists(path)
        size = os.path.getsize(path) if exists else 0
        print(f'   -> File: {path}, Exists: {exists}, Size: {size} bytes')
