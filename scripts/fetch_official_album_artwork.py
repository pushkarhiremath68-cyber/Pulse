import json
import re
import urllib.request
import urllib.parse
import concurrent.futures
import time

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog = json.loads(match.group(1))
print(f"Loaded {len(catalog)} songs from DEMO_CATALOG")

# Cache to avoid duplicate network queries for same title+artist
artwork_cache = {}

def get_official_artwork(track):
    title = track.get('title', '')
    artist = track.get('artist', '')
    query_key = f"{title} {artist}".strip().lower()
    
    if query_key in artwork_cache:
        return artwork_cache[query_key]
    
    # If it already has an authentic 600x600 mzstatic cover, keep it!
    existing = track.get('cover', '')
    if existing and 'mzstatic.com' in existing and '600x600' in existing:
        artwork_cache[query_key] = existing
        return existing
        
    search_term = f"{title} {artist.split(',')[0].split('ft.')[0]}".strip()
    url = f"https://itunes.apple.com/search?term={urllib.parse.quote(search_term)}&entity=song&limit=3"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (PulseMusic/2.0)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode('utf-8'))
                results = data.get('results', [])
                if results:
                    best = results[0]
                    art100 = best.get('artworkUrl100', '')
                    if art100:
                        art600 = art100.replace('100x100bb', '600x600bb')
                        artwork_cache[query_key] = art600
                        return art600
    except Exception as e:
        pass
        
    # Fallback search with just title
    try:
        url2 = f"https://itunes.apple.com/search?term={urllib.parse.quote(title)}&entity=song&limit=2"
        req2 = urllib.request.Request(url2, headers={'User-Agent': 'Mozilla/5.0 (PulseMusic/2.0)'})
        with urllib.request.urlopen(req2, timeout=5) as resp2:
            if resp2.status == 200:
                data2 = json.loads(resp2.read().decode('utf-8'))
                results2 = data2.get('results', [])
                if results2:
                    art100 = results2[0].get('artworkUrl100', '')
                    if art100:
                        art600 = art100.replace('100x100bb', '600x600bb')
                        artwork_cache[query_key] = art600
                        return art600
    except Exception as e:
        pass

    return existing or None

print("Fetching authentic 600x600 HD album artwork from Apple Music / iTunes...")
start_time = time.time()

# Process in parallel thread pool
updated_count = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    future_to_index = {executor.submit(get_official_artwork, t): i for i, t in enumerate(catalog)}
    for future in concurrent.futures.as_completed(future_to_index):
        idx = future_to_index[future]
        try:
            art = future.result()
            if art:
                catalog[idx]['cover'] = art
                updated_count += 1
        except Exception as e:
            pass

print(f"Fetched official artwork for {updated_count}/{len(catalog)} tracks in {time.time()-start_time:.1f}s")

# Re-serialize catalog into musicService.js
updated_json = json.dumps(catalog, indent=2, ensure_ascii=False)
replacement = f"const DEMO_CATALOG = {updated_json}.map(normalizeTrack);"

# Update musicService.js
new_js_code = js_code[:match.start()] + replacement + js_code[match.end():]
with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(new_js_code)

print("Saved updated DEMO_CATALOG with authentic HD artwork into src/musicService.js!")
