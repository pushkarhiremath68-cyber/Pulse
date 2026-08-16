import os
import json
import re
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MS_PATH = os.path.join(ROOT, 'src', 'musicService.js')
DOCS_MS_PATH = os.path.join(ROOT, 'docs', 'src', 'musicService.js')

with open(MS_PATH, 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG in musicService.js")
    exit(1)

catalog = json.loads(match.group(1))
print(f"Total catalog entries to process: {len(catalog)}")

SPECIAL_FIXES = {
    'in-udi-udi-jaye': {
        'cover': 'https://c.saavncdn.com/334/Raees-Hindi-2016-20200430093124-500x500.webp',
        'album': 'Raees',
        'artist': 'Sukhwinder Singh, Bhoomi Trivedi, Ram Sampath',
        'duration': '4:15',
        'storagePath': 'in-udi-udi-jaye.mp4'
    },
    'in-itni-si-baat-hai': {
        'cover': 'https://c.saavncdn.com/633/Azhar-1-Hindi-2016-500x500.jpg',
        'album': 'Azhar',
        'artist': 'Arijit Singh, Antara Mitra',
        'duration': '4:54',
        'storagePath': 'in-itni-si-baat-hai.mp4'
    },
    'in-kesariya': {
        'cover': 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.webp',
        'album': 'Brahmastra',
        'artist': 'Arijit Singh, Pritam',
        'duration': '4:28',
        'storagePath': 'in-kesariya.mp4'
    },
    'in-chaleya': {
        'cover': 'https://c.saavncdn.com/047/Jawan-Hindi-2023-20230921190854-500x500.webp',
        'album': 'Jawan',
        'artist': 'Arijit Singh, Shilpa Rao',
        'duration': '3:20',
        'storagePath': 'in-chaleya.mp4'
    },
    'pj-wavy-karan-aujla': {
        'cover': 'https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.webp',
        'album': 'Four Me',
        'artist': 'Karan Aujla',
        'duration': '2:48',
        'storagePath': 'pj-wavy-karan-aujla.mp4'
    }
}

# Ensure Itni Si Baat Hai and Wavy are in catalog
has_itni = any(t['id'] == 'in-itni-si-baat-hai' for t in catalog)
if not has_itni:
    catalog.insert(0, {
        "id": "in-itni-si-baat-hai",
        "title": "Itni Si Baat Hai",
        "artist": "Arijit Singh, Antara Mitra",
        "album": "Azhar",
        "cover": "https://c.saavncdn.com/633/Azhar-1-Hindi-2016-500x500.jpg",
        "duration": "4:54",
        "category": "romantic",
        "ytId": "sUv_aB0yKqA",
        "ytSearchQuery": "Itni Si Baat Hai Azhar Arijit Singh",
        "storagePath": "in-itni-si-baat-hai.mp4",
        "source": "Pulse Music Engine"
    })

has_wavy = any(t['id'] == 'pj-wavy-karan-aujla' for t in catalog)
if not has_wavy:
    catalog.insert(0, {
        "id": "pj-wavy-karan-aujla",
        "title": "Wavy",
        "artist": "Karan Aujla",
        "album": "Four Me",
        "cover": "https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.webp",
        "duration": "2:48",
        "category": "punjabi",
        "ytId": "LK7-_dgAVQE",
        "ytSearchQuery": "Wavy Karan Aujla",
        "storagePath": "pj-wavy-karan-aujla.mp4",
        "source": "Pulse Music Engine"
    })

def resolve_single_track(track):
    tid = track.get('id', '')
    if tid in SPECIAL_FIXES:
        for k, v in SPECIAL_FIXES[tid].items():
            track[k] = v
        return track
    
    title = track.get('title', '')
    artist = track.get('artist', '')
    clean_title = re.sub(r'\s*\([^)]*\)', '', title).strip()
    clean_artist = artist.split(',')[0].split('&')[0].strip()
    q = f"{clean_title} {clean_artist}".strip()
    
    cover = track.get('cover', '')
    # Check if needs resolution
    if not cover or 'hqdefault.jpg' in cover or (cover == 'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/600x600bb.jpg' and tid != 'in-kesariya'):
        try:
            url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=2&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(q)
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode('utf-8', errors='ignore'))
                results = data.get('results', [])
                if results and results[0].get('image'):
                    track['cover'] = results[0]['image'].replace('150x150', '500x500').replace('50x50', '500x500')
        except Exception:
            pass
    return track

print("Resolving tracks in parallel...")
with ThreadPoolExecutor(max_workers=20) as ex:
    resolved_catalog = list(ex.map(resolve_single_track, catalog))

# Format and write back
formatted_json = json.dumps(resolved_catalog, indent=2)
new_js_code = js_code[:match.start(1)] + formatted_json + js_code[match.end(1):]

with open(MS_PATH, 'w', encoding='utf-8') as f:
    f.write(new_js_code)
print(f"[SUCCESS] Updated {MS_PATH}")

if os.path.exists(DOCS_MS_PATH):
    with open(DOCS_MS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_js_code)
    print(f"[SUCCESS] Synced {DOCS_MS_PATH}")
