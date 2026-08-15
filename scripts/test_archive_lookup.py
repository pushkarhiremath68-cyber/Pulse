import urllib.request
import urllib.parse
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

def search_archive_audio(title, artist):
    query = f"{title} {artist}".strip()
    try:
        url = f"https://archive.org/advancedsearch.php?q={urllib.parse.quote(query)}+AND+mediatype:(audio)&fl[]=identifier,title,mediatype&output=json"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            docs = data.get('response', {}).get('docs', [])
            if docs:
                ident = docs[0].get('identifier')
                meta_url = f"https://archive.org/metadata/{ident}"
                m_req = urllib.request.Request(meta_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(m_req, timeout=5) as m_resp:
                    m_data = json.loads(m_resp.read().decode())
                    for f in m_data.get('files', []):
                        fn = f.get('name', '')
                        sz = int(f.get('size', 0) or 0)
                        if (fn.endswith('.mp3') or fn.endswith('.m4a')) and sz > 2000000 and 'sample' not in fn.lower():
                            dl_url = f"https://archive.org/download/{ident}/{urllib.parse.quote(fn)}"
                            return dl_url, sz
    except Exception as e:
        pass
    return None, 0

print("Testing Archive.org search for top tracks:")
test_tracks = [
    ("Espresso", "Sabrina Carpenter"),
    ("Despacito", "Luis Fonsi"),
    ("Blinding Lights", "The Weeknd"),
    ("Shape of You", "Ed Sheeran"),
    ("Hanuman Chalisa", "Gulshan Kumar"),
    ("Shiv Tandav Stotram", "Shankar Mahadevan"),
]

for t, a in test_tracks:
    url, sz = search_archive_audio(t, a)
    print(f"[{'FOUND' if url else 'NONE'}] {t} by {a} -> {sz/1024/1024:.2f} MB ({url})")
