import re

with open('docs/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)</script>', html, re.I)
for i, s in enumerate(scripts):
    s_clean = s.strip()
    if s_clean:
        print(f"=== INLINE SCRIPT {i+1} ({len(s_clean)} chars) ===")
        print(s_clean[:400])
        print("...\n")
