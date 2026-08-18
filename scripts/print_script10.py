import re

with open('docs/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html, re.I)
if len(scripts) >= 10:
    print(scripts[9])
