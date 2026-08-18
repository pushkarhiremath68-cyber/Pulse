import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

onclicks = set(re.findall(r'onclick=["\']([^"\']+)["\']', html))
print(f"Total distinct onclick handlers in index.html: {len(onclicks)}")
for oc in sorted(onclicks):
    print(" -", oc[:100])
