import os
import json
import urllib.request
import urllib.parse
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

def download_itunes_track(query, track_id):
    try:
        t0 = time.time()
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if not results:
                return None
            preview_url = results[0].get('previewUrl')
            if not preview_url:
                return None
            
            dest_path = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
            # Download preview
            req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req_audio, timeout=6) as audio_resp:
                with open(dest_path, 'wb') as f:
                    f.write(audio_resp.read())
            
            print(f"[Downloaded in {time.time()-t0:.2f}s] {track_id} -> {results[0].get('trackName')} ({os.path.getsize(dest_path)} bytes)")
            return dest_path
    except Exception as e:
        print(f"Error for {query}: {e}")
        return None

# Test on previously corrupted songs
test_tracks = [
    ("Born to Shine Diljit Dosanjh", "pj-born-to-shine"),
    ("Insane AP Dhillon", "pj-insane-ap"),
    ("Belageddu Vijay Prakash", "kn-belageddu"),
    ("Zingaat Ajay Atul", "mr-zingaat"),
    ("Khalasi Aditya Gadhvi", "gu-khalasi"),
    ("Despacito Luis Fonsi", "es-despacito"),
    ("With You AP Dhillon", "pj-with-you-ap"),
    ("Singara Siriye Vijay Prakash", "kn-singara-siriye"),
    ("Srivalli Sid Sriram", "te-srivalli"),
]

for q, tid in test_tracks:
    download_itunes_track(q, tid)
