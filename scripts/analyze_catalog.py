import re, json, os

with open('src/catalogService.js', 'r', encoding='utf-8') as f:
    code = f.read()

# Find all track objects
matches = re.findall(r'"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"', code)
print(f"Total tracks in catalog: {len(matches)}")
unique = list(set(matches))
print(f"Unique tracks in catalog: {len(unique)}")

# Check index.html for hardcoded itunes streams
with open('index.html', 'r', encoding='utf-8') as f:
    html_code = f.read()

itunes_in_html = len(re.findall(r'audio-ssl\.itunes\.apple\.com', html_code))
print(f"iTunes preview URLs in index.html: {itunes_in_html}")
