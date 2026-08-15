import os
import json
import urllib.request
import urllib.parse
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

tracks_to_retry = [
    ("mr-yad-lagla", "Yad Lagla Ajay Gogavale"),
    ("mr-apsara-aali", "Apsara Aali Bela Shende"),
    ("mr-bai-ga", "Bai Ga Aarya Ambekar"),
    ("gu-char-bangadi", "Char Char Bangadi Vadi Gadi Kinjal Dave"),
    ("mr-chandra", "Chandra Shreya Ghoshal Chandramukhi"),
]

for tid, query in tracks_to_retry:
    time.sleep(1.5)
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                p_url = results[0].get('previewUrl')
                if p_url:
                    dest = os.path.join(MUSIC_DIR, f"{tid}.m4a")
                    req_audio = urllib.request.Request(p_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_audio, timeout=6) as a_resp:
                        with open(dest, 'wb') as f:
                            f.write(a_resp.read())
                    print(f"SUCCESS {tid} -> {results[0].get('trackName')} ({os.path.getsize(dest)} bytes)")
                    continue
        print(f"NO RESULT {tid} ({query})")
    except Exception as e:
        print(f"ERROR {tid}: {e}")
