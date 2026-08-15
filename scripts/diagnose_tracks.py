import os
import json
import time
import re
import urllib.request
import yt_dlp

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Load musicService.js and extract DEMO_CATALOG
with open(os.path.join(ROOT, 'src', 'musicService.js'), 'r', encoding='utf-8') as f:
    content = f.read()

# Extract catalog
match = re.search(r'const DEMO_CATALOG = (\[.*?\]);', content, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog_json = match.group(1)
try:
    catalog = json.loads(catalog_json)
except Exception as e:
    # Try regex parsing if strict json fails
    print("JSON parse error:", e)
    # Parse individual objects
    track_blocks = re.findall(r'\{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"artist":\s*"([^"]+)"(?:.*?)\}', catalog_json, re.DOTALL)
    catalog = [{'id': t[0], 'title': t[1], 'artist': t[2]} for t in track_blocks]

print(f"Loaded {len(catalog)} tracks from DEMO_CATALOG.")

# Sample 25 tracks across different categories and genres
sample_indices = [0, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 40, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000]
samples = [catalog[i] for i in sample_indices if i < len(catalog)]

ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'default_search': 'ytsearch1:',
    'socket_timeout': 8,
}

print("\nTesting audio stream resolution for sample tracks:")
failed = []
passed = []

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    for idx, track in enumerate(samples):
        track_id = track.get('id', '')
        title = track.get('title', '')
        artist = track.get('artist', '')
        yt_id = track.get('ytId', '')
        
        target = None
        if yt_id and len(yt_id) == 11:
            target = f"https://www.youtube.com/watch?v={yt_id}"
        else:
            target = f"{title} {artist} song"
            
        t0 = time.time()
        try:
            info = ydl.extract_info(target, download=False)
            if 'entries' in info and len(info['entries']) > 0:
                info = info['entries'][0]
            url = info.get('url')
            elapsed = time.time() - t0
            if url:
                print(f"[PASS {elapsed:.2f}s] {title} ({artist}) -> {info.get('title', '')[:50]}")
                passed.append((track_id, title))
            else:
                print(f"[FAIL {elapsed:.2f}s] {title} ({artist}) -> No URL")
                failed.append((track_id, title, artist, yt_id, "No URL"))
        except Exception as e:
            elapsed = time.time() - t0
            print(f"[FAIL {elapsed:.2f}s] {title} ({artist}) -> ERROR: {e}")
            failed.append((track_id, title, artist, yt_id, str(e)))

print(f"\nResults: {len(passed)} passed, {len(failed)} failed out of {len(samples)} tested.")
if failed:
    print("Failures:")
    for f in failed:
        print(f"  - {f[1]} by {f[2]} (ytId: {f[3]}): {f[4]}")
