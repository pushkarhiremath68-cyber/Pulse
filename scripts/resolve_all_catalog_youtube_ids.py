import json
import re
import urllib.request
import urllib.parse
import time
from concurrent.futures import ThreadPoolExecutor

def fetch_yt_id(query):
    try:
        url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        })
        with urllib.request.urlopen(req, timeout=4) as res:
            html = res.read().decode('utf-8', errors='ignore')
            m = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
            if m:
                return m.group(1)
    except Exception:
        pass
    return None

def resolve_all():
    with open('src/musicService.js', 'r', encoding='utf-8') as f:
        content = f.read()

    start_marker = 'const DEMO_CATALOG = ['
    end_marker = '].map(normalizeTrack);'
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker, start_idx)

    catalog_str = content[start_idx + len(start_marker) - 1 : end_idx + 1]
    catalog = json.loads(catalog_str)

    need_yt = [t for t in catalog if not t.get('ytId')]
    print(f"Total tracks in catalog: {len(catalog)}. Needing YT: {len(need_yt)}")

    if not need_yt:
        print("All tracks already have YouTube IDs!")
        return

    targets = need_yt[:600]
    print(f"Resolving batch of {len(targets)} tracks in parallel...")

    def process(t):
        q = t.get('ytSearchQuery') or f"{t.get('title')} {t.get('artist')}"
        vid = fetch_yt_id(q)
        if vid:
            t['ytId'] = vid
            return t['id'], vid
        return t['id'], None

    with ThreadPoolExecutor(max_workers=32) as executor:
        results = list(executor.map(process, targets))

    resolved_count = sum(1 for _, vid in results if vid)
    print(f"Resolved {resolved_count} tracks in this batch!")

    # Write back updated catalog to musicService.js
    new_catalog_str = json.dumps(catalog, indent=2, ensure_ascii=False)
    new_music_service = content[:start_idx + len(start_marker) - 1] + new_catalog_str + content[end_idx + 1:]
    with open('src/musicService.js', 'w', encoding='utf-8') as f:
        f.write(new_music_service)

    # Also extract all mapped ytIds and update YOUTUBE_TRACKS_MAP in main.js
    all_mapped = {t['id']: t['ytId'] for t in catalog if t.get('ytId')}
    with open('src/main.js', 'r', encoding='utf-8') as f:
        main_content = f.read()

    map_lines = [f"    '{k}': '{v}'," for k, v in all_mapped.items()]
    new_map_str = "const YOUTUBE_TRACKS_MAP = {\n" + "\n".join(map_lines) + "\n  };"
    new_main_content = re.sub(r'const YOUTUBE_TRACKS_MAP = \{([^}]+)\};', new_map_str, main_content)
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(new_main_content)

    print(f"Updated musicService.js and main.js with {len(all_mapped)} mapped YouTube tracks!")

if __name__ == '__main__':
    resolve_all()
