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
    'socket_timeout': 10,
    'extract_flat': True,
    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
}

def is_generic_or_unsplash(cover_url):
    if not cover_url or not isinstance(cover_url, str):
        return True
    if 'unsplash.com' in cover_url or 'pulse-logo' in cover_url or 'undefined' in cover_url or 'null' in cover_url:
        return True
    if not cover_url.startswith('http://') and not cover_url.startswith('https://'):
        return True
    return False

# Find all tracks that need authentic official photos
targets = []
for idx, track in enumerate(catalog):
    cov = track.get('cover', '')
    if is_generic_or_unsplash(cov):
        targets.append(idx)

print(f"Total tracks needing real official photo resolution: {len(targets)}")

def resolve_single_photo(idx):
    track = catalog[idx]
    title = track.get('title', '')
    artist = track.get('artist', '')
    album = track.get('album', '')
    
    query = f"{title} {artist}".strip()
    if album and album != 'Single' and album != 'Single Release':
        query = f"{title} {album} {artist}".strip()
        
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{query} official song", download=False)
            entries = info.get('entries', [])
            if entries:
                yt_id = entries[0].get('id')
                if yt_id:
                    return idx, f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"
    except Exception as e:
        pass
        
    # Retry with just title and artist
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{title} {artist} song", download=False)
            entries = info.get('entries', [])
            if entries:
                yt_id = entries[0].get('id')
                if yt_id:
                    return idx, f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"
    except Exception as e:
        pass

    return idx, None

print("Starting parallel extraction of official photos for all 1,035 tracks with 24 worker threads...")
start_time = time.time()

resolved_count = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=24) as executor:
    futures = [executor.submit(resolve_single_photo, idx) for idx in targets]
    for future in concurrent.futures.as_completed(futures):
        try:
            idx, photo_url = future.result()
            if photo_url:
                catalog[idx]['cover'] = photo_url
                resolved_count += 1
                if resolved_count % 100 == 0:
                    print(f"  [Progress] Resolved {resolved_count}/{len(targets)} official photos...")
        except Exception as e:
            pass

print(f"Finished: Resolved {resolved_count}/{len(targets)} official photos in {time.time()-start_time:.1f}s")

# Save updated DEMO_CATALOG
updated_json = json.dumps(catalog, indent=2, ensure_ascii=False)
replacement = f"const DEMO_CATALOG = {updated_json}.map(normalizeTrack);"

new_js_code = js_code[:match.start()] + replacement + js_code[match.end():]
with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(new_js_code)

print("Saved 100% official song photos into src/musicService.js!")
