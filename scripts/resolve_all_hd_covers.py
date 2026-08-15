import os
import json
import re
import urllib.request
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# Match the DEMO_CATALOG array
pattern = r'const DEMO_CATALOG = (\[.*?\]\.map\(normalizeTrack\);)'
match = re.search(pattern, code, re.DOTALL)
if not match:
    # Try without .map
    pattern = r'const DEMO_CATALOG = (\[.*?\]);'
    match = re.search(pattern, code, re.DOTALL)
    if not match:
        print("Could not find DEMO_CATALOG in musicService.js")
        exit(1)

catalog_raw = match.group(1)

# Parse individual track objects
track_strings = re.findall(r'(\{\s*"id":\s*"[^"]+".*?\n  \})', catalog_raw, re.DOTALL)
print(f"Found {len(track_strings)} tracks to process.")

def resolve_hd_cover_for_track(track_str):
    title_match = re.search(r'"title":\s*"([^"]+)"', track_str)
    artist_match = re.search(r'"artist":\s*"([^"]+)"', track_str)
    cover_match = re.search(r'"cover":\s*"([^"]+)"', track_str)
    yt_match = re.search(r'"ytId":\s*"([^"]+)"', track_str)

    if not title_match or not artist_match:
        return track_str

    title = title_match.group(1)
    artist = artist_match.group(1)
    current_cover = cover_match.group(1) if cover_match else ''
    ytid = yt_match.group(1) if yt_match else ''

    # If already an mzstatic HD cover, keep it
    if 'mzstatic.com' in current_cover:
        return track_str

    clean_artist = artist.split(',')[0].split('&')[0].strip()
    term = urllib.parse.quote(f"{title} {clean_artist}")
    url = f"https://itunes.apple.com/search?term={term}&entity=song&limit=1"
    
    hd_cover = None
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            if data.get('results') and len(data['results']) > 0:
                art = data['results'][0].get('artworkUrl100')
                if art:
                    hd_cover = art.replace('100x100bb', '600x600bb')
    except Exception:
        pass

    if not hd_cover and ytid and len(ytid) == 11:
        hd_cover = f"https://i.ytimg.com/vi/{ytid}/hqdefault.jpg"

    if hd_cover:
        new_track_str = re.sub(r'"cover":\s*"[^"]+"', f'"cover": "{hd_cover}"', track_str)
        return new_track_str
    
    return track_str

print("Starting parallel resolution of authentic HD artwork for all tracks...")
t0 = time.time()
with ThreadPoolExecutor(max_workers=25) as executor:
    resolved_tracks = list(executor.map(resolve_hd_cover_for_track, track_strings))

print(f"Finished resolution in {time.time()-t0:.2f}s.")

# Rebuild catalog string
new_catalog_body = ",\n  ".join(resolved_tracks)
new_catalog_full = f"const DEMO_CATALOG = [\n  {new_catalog_body}\n].map(normalizeTrack);"

# Direct safe substring replacement without regex backslash issues
start_idx = code.find("const DEMO_CATALOG = [")
end_marker = "].map(normalizeTrack);"
end_idx = code.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    end_idx += len(end_marker)
    new_code = code[:start_idx] + new_catalog_full + code[end_idx:]
    with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("SUCCESS: Saved updated DEMO_CATALOG with authentic HD artwork into musicService.js!")
else:
    print("Error: Could not locate substring boundaries for DEMO_CATALOG")
