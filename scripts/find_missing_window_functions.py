import re

html = open('index.html', encoding='utf-8').read()
main_js = open('src/main.js', encoding='utf-8').read()
playbar_js = open('src/playbarController.js', encoding='utf-8').read()
gemini_js = open('src/geminiService.js', encoding='utf-8').read()
lyrics_js = open('src/lyricsService.js', encoding='utf-8').read()
catalog_js = open('src/catalogService.js', encoding='utf-8').read()

all_js = main_js + playbar_js + gemini_js + lyrics_js + catalog_js

# Find window.functionName calls in index.html
matches = re.findall(r'window\.([a-zA-Z0-9_]+)\s*\(', html)
unique_funcs = sorted(set(matches))

print(f"Total {len(unique_funcs)} unique window functions called in index.html:")
missing = []
for f in unique_funcs:
    if f in ['history', 'scrollTo']:
        continue # built-in window functions
    # Check if window.f or function f is in JS
    pattern = rf'(window\.{f}\s*=|function\s+{f}\b|{f}\s*:)'
    if re.search(pattern, all_js):
        print(f"  [OK] {f}")
    else:
        print(f"  [MISSING!] {f}")
        missing.append(f)

print(f"\nMissing functions ({len(missing)}):")
for m in missing:
    print(f"  - {m}")
