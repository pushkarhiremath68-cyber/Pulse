import json
import re
import concurrent.futures
import yt_dlp
import time

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog = json.loads(match.group(1))
print(f"Loaded {len(catalog)} songs from DEMO_CATALOG")

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'default_search': 'ytsearch1:',
    'socket_timeout': 8,
    'extract_flat': True,
    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
}

def resolve_photo(track):
    # If it already has an authentic Apple Music 600x600 cover, keep it!
    existing = track.get('cover')
    if existing and ('mzstatic.com' in existing or 'spotifycdn.com' in existing):
        return existing
        
    title = track.get('title', '')
    artist = track.get('artist', '')
    query = f"{title} {artist}".strip()
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{query} official", download=False)
            entries = info.get('entries', [])
            if entries:
                first = entries[0]
                yt_id = first.get('id')
                # High-definition thumbnail
                return f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"
    except Exception as e:
        pass
    
    return existing

print("Resolving official HD photo artwork for all songs in catalog...")
start_time = time.time()

# Identify tracks that need photo covers
indices_to_update = []
for i, t in enumerate(catalog):
    c = t.get('cover')
    if not c or 'i.ytimg.com/vi/undefined' in c or 'i.ytimg.com/vi/null' in c:
        indices_to_update.append(i)

print(f"Resolving photos for {len(indices_to_update)} tracks without high-res covers...")

def worker(idx):
    t = catalog[idx]
    photo = resolve_photo(t)
    return idx, photo

resolved_count = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=16) as executor:
    futures = [executor.submit(worker, idx) for idx in indices_to_update]
    for future in concurrent.futures.as_completed(futures):
        try:
            idx, photo = future.result()
            if photo:
                catalog[idx]['cover'] = photo
                resolved_count += 1
        except Exception as e:
            pass

print(f"Resolved official HD photo covers for {resolved_count}/{len(indices_to_update)} tracks in {time.time()-start_time:.1f}s")

# Re-serialize into src/musicService.js
updated_json = json.dumps(catalog, indent=2, ensure_ascii=False)
replacement = f"const DEMO_CATALOG = {updated_json}.map(normalizeTrack);"

new_js_code = js_code[:match.start()] + replacement + js_code[match.end():]
with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(new_js_code)

print("Successfully saved all official song photo covers into src/musicService.js!")
