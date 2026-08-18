import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Find all overlay / modal / splash divs
divs = re.findall(r'<div[^>]+id=["\']([^"\']+)["\'][^>]*class=["\']([^"\']+)["\']', html)
print("Found IDs and classes:")
for did, dcls in divs:
    if 'overlay' in dcls or 'modal' in dcls or 'splash' in dcls or 'loading' in dcls:
        print(f"ID: {did:30} Class: {dcls}")
