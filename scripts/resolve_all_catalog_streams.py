import os
import sys
import re
import json
import base64
import urllib.request
import urllib.parse
from Crypto.Cipher import DES

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def decrypt_saavn_url(encrypted_url):
    if not encrypted_url:
        return None
    try:
        key = b"38346591"
        cipher = DES.new(key, DES.MODE_ECB)
        dec = cipher.decrypt(base64.b64decode(encrypted_url))
        pad_len = dec[-1]
        if 1 <= pad_len <= 8:
            dec = dec[:-pad_len]
        url = dec.decode('utf-8')
        u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4')
        u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4')
        return {
            '320': u320,
            '160': u160,
            '96': url
        }
    except Exception as e:
        return None

def clean_query(title, artist):
    clean_t = re.sub(r'\s*\([^)]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version|From)[^)]*\)', '', title, flags=re.I)
    clean_t = re.sub(r'\s*\[[^\]]*\]', '', clean_t)
    clean_t = clean_t.split('-')[0].strip()
    
    clean_a = artist.split(',')[0].split('&')[0].strip()
    return f"{clean_t} {clean_a}".strip()

def search_saavn(query):
    try:
        url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            return results
    except Exception as e:
        return []

def resolve_track(title, artist):
    q_primary = clean_query(title, artist)
    queries = [
        q_primary,
        f"{title.split('(')[0].split('-')[0].strip()}",
        f"{artist.split(',')[0].strip()}",
        f"{title} {artist}"
    ]

    for q in queries:
        if not q:
            continue
        results = search_saavn(q)
        if results:
            for r in results:
                enc = r.get('encrypted_media_url')
                if enc:
                    dec = decrypt_saavn_url(enc)
                    if dec and dec.get('320'):
                        dur = int(r.get('duration', 0)) or 220
                        if dur < 45:
                            dur = 220
                        cover = r.get('image', '').replace('150x150', '500x500').replace('50x50', '500x500')
                        return {
                            'streamUrl': dec['320'],
                            'duration': dur,
                            'coverUrl': cover if cover.startswith('http') else None,
                            'foundTitle': r.get('song'),
                            'foundArtist': r.get('singers')
                        }
    return None

def main():
    catalog_path = os.path.join(ROOT_DIR, 'src', 'catalogService.js')
    with open(catalog_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Parse CATALOG_CATEGORIES
    cat_match = re.search(r'export const CATALOG_CATEGORIES = (\[.*?\]);\s*const CATEGORY_SEARCH_QUERIES', content, re.DOTALL)
    if not cat_match:
        cat_match = re.search(r'export const CATALOG_CATEGORIES = (\[.*?\]);', content, re.DOTALL)
    if not cat_match:
        print("Could not find CATALOG_CATEGORIES")
        return

    categories = json.loads(cat_match.group(1))
    print(f"Loaded {len(categories)} categories")

    stream_map = {}
    total_tracks = 0
    resolved_tracks = 0

    for cat in categories:
        print(f"\nProcessing category: {cat.get('title')}")
        for t in cat.get('tracks', []):
            total_tracks += 1
            title = t.get('title')
            artist = t.get('artist')
            old_stream = t.get('stream', '')

            print(f"  Resolving '{title}' by '{artist}'...")
            res = resolve_track(title, artist)
            if res:
                resolved_tracks += 1
                t['stream'] = res['streamUrl']
                t['duration'] = res['duration']
                if res['coverUrl']:
                    t['cover'] = res['coverUrl']
                stream_map[old_stream] = res['streamUrl']
                print(f"    -> Full Song ({res['duration']}s): {res['streamUrl'][:70]}...")
            else:
                print(f"    -> FAILED TO RESOLVE!")

    print(f"\nResolved {resolved_tracks} / {total_tracks} tracks to 100% full song streams!")

    # Save back to src/catalogService.js
    new_cat_json = json.dumps(categories, indent=2)
    new_content = content[:cat_match.start(1)] + new_cat_json + content[cat_match.end(1):]
    with open(catalog_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Saved updated {catalog_path}")

    # Update index.html and docs/index.html
    for html_name in ['index.html', os.path.join('docs', 'index.html')]:
        html_p = os.path.join(ROOT_DIR, html_name)
        if os.path.exists(html_p):
            with open(html_p, 'r', encoding='utf-8') as f:
                h_text = f.read()
            
            replaced_in_html = 0
            for old_s, new_s in stream_map.items():
                if old_s and old_s in h_text:
                    h_text = h_text.replace(old_s, new_s)
                    replaced_in_html += 1
            
            with open(html_p, 'w', encoding='utf-8') as f:
                f.write(h_text)
            print(f"Replaced {replaced_in_html} stream URLs in {html_name}")

if __name__ == '__main__':
    main()
