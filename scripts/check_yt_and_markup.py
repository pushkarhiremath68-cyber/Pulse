import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

yt_scripts = re.findall(r'<script[^>]*youtube[\s\S]*?</script>', html, re.I)
print(f'YouTube script tags in index.html: {len(yt_scripts)}')

yt_containers = re.findall(r'<div[^>]+id=[\'"][^\'"]*youtube[^\'"]*[\'"][^>]*>', html, re.I)
print(f'YouTube containers in index.html: {len(yt_containers)}')
for c in yt_containers:
    print('  ', c)

clear_btns = re.findall(r'<button[^>]+id=[\'"]clear-search-btn[\'"][^>]*>[\s\S]*?</button>', html, re.I)
print(f'clear-search-btn markup:')
for b in clear_btns:
    print('  ', b)
