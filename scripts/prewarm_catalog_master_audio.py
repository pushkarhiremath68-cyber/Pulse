import os
import re
import json
import urllib.request
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')
os.makedirs(MUSIC_DIR, exist_ok=True)

with open(os.path.join(ROOT, 'server.py'), 'r', encoding='utf-8') as f:
    server_py = f.read()

# Parse TOP_SONGS
matches = re.findall(r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|None)\s*\)', server_py)
print(f"Total TOP_SONGS: {len(matches)}")

def find_local_audio(track_id):
    for ext in ['.m4a', '.mp4', '.webm', '.mp3', '.ogg', '.wav']:
        p = os.path.join(MUSIC_DIR, f"{track_id}{ext}")
        if os.path.exists(p) and os.path.getsize(p) > 50000:
            return p
    return None

def download_track(item):
    tid, title, artist, ytid = item
    if find_local_audio(tid):
        return (tid, "ALREADY_EXISTS")
    
    query = f"{title} {artist}"
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                preview_url = results[0].get('previewUrl')
                if preview_url:
                    dest = os.path.join(MUSIC_DIR, f"{tid}.m4a")
                    req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_audio, timeout=6) as audio_resp:
                        with open(dest, 'wb') as out_f:
                            out_f.write(audio_resp.read())
                    return (tid, f"DOWNLOADED: {results[0].get('trackName')} ({os.path.getsize(dest)} bytes)")
    except Exception as e:
        return (tid, f"ERROR: {e}")
    return (tid, "NO_RESULT")

print("Starting parallel pre-warm for missing tracks...")
missing = [m for m in matches if not find_local_audio(m[0])]
print(f"Found {len(missing)} missing tracks in storage/music.")

with ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(download_track, missing))

for tid, status in results:
    print(f"  {tid}: {status}")

print(f"\nPrewarm complete! Total files in storage/music: {len(os.listdir(MUSIC_DIR))}")
