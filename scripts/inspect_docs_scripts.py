import re

with open('docs/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

scripts = re.findall(r'<script[\s\S]*?</script>', html)
print(f'Total script tags: {len(scripts)}')
for i, s in enumerate(scripts):
    src = re.findall(r'src=[\'"]([^\'"]+)[\'"]', s)
    t = re.findall(r'type=[\'"]([^\'"]+)[\'"]', s)
    preview = s.replace('\n', ' ')[:100]
    print(f'Script {i+1}: src={src}, type={t}, preview={preview}')
