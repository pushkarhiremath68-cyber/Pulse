import os
import json
import urllib.request
import urllib.parse
import re
import base64
from Crypto.Cipher import DES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')
SCRATCH_DIR = os.path.join(ROOT, 'scratch')
os.makedirs(MUSIC_DIR, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)

def decrypt_saavn_url(encrypted_url):
    try:
        key = b"38346591"
        cipher = DES.new(key, DES.MODE_ECB)
        dec = cipher.decrypt(base64.b64decode(encrypted_url))
        pad_len = dec[-1]
        if 1 <= pad_len <= 8:
            dec = dec[:-pad_len]
        url = dec.decode('utf-8')
        return {
            '320': url.replace("_96.mp4", "_320.mp4").replace(".mp4", "_320.mp4") if not url.endswith("_320.mp4") else url,
            '160': url.replace("_96.mp4", "_160.mp4"),
            '96': url
        }
    except Exception:
        return None

def resolve_and_download_track(tid, query, expected_title, expected_artist, expected_album):
    print(f"\n--- Resolving: {tid} ({query}) ---")
    clean_q = re.sub(r'[()\[\]{}"\'|]', ' ', query).strip()
    url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(clean_q)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            if results:
                best = results[0]
                title = best.get('song') or best.get('title')
                singers = best.get('singers') or best.get('primary_artists')
                album = best.get('album')
                raw_image = best.get('image', '')
                hd_image = raw_image.replace('150x150', '500x500').replace('50x50', '500x500')
                duration = best.get('duration', '210')
                
                print(f"Found Saavn: '{title}' by '{singers}' | Album: '{album}'")
                print(f"Artwork: {hd_image}")
                
                enc = best.get('encrypted_media_url')
                dec = decrypt_saavn_url(enc)
                if dec:
                    for q_key in ['320', '160', '96']:
                        stream_url = dec[q_key]
                        dest = os.path.join(MUSIC_DIR, f"{tid}.mp4")
                        try:
                            dl_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
                            with urllib.request.urlopen(dl_req, timeout=20) as a_resp:
                                data_bytes = a_resp.read()
                                with open(dest, 'wb') as f:
                                    f.write(data_bytes)
                            print(f"[SUCCESS] Downloaded full track {dest} ({len(data_bytes)/1024/1024:.2f} MB)")
                            return {
                                'id': tid,
                                'title': expected_title or title,
                                'artist': expected_artist or singers,
                                'album': expected_album or album,
                                'cover': hd_image,
                                'duration': f"{int(duration)//60}:{int(duration)%60:02d}" if duration and str(duration).isdigit() else '3:30',
                                'storagePath': f"{tid}.mp4",
                                'verified': True
                            }
                        except Exception as e:
                            print(f"Notice on downloading stream: {e}")
    except Exception as e:
        print(f"Error fetching saavn data: {e}")
    return None

test_tracks = [
    ("in-udi-udi-jaye", "Udi Udi Jaye Raees Sukhwinder Singh", "Udi Udi Jaye", "Sukhwinder Singh, Bhoomi Trivedi, Ram Sampath", "Raees"),
    ("in-itni-si-baat-hai", "Itni Si Baat Hain Azhar Arijit Singh Antara Mitra", "Itni Si Baat Hai", "Arijit Singh, Antara Mitra", "Azhar"),
    ("in-kesariya", "Kesariya Brahmastra Arijit Singh", "Kesariya", "Arijit Singh, Pritam", "Brahmastra"),
    ("in-chaleya", "Chaleya Jawan Arijit Singh Shilpa Rao", "Chaleya", "Arijit Singh, Shilpa Rao", "Jawan"),
    ("pj-wavy-karan-aujla", "Wavy Karan Aujla", "Wavy", "Karan Aujla", "Four Me"),
    ("in-shayad", "Shayad Love Aaj Kal Arijit Singh", "Shayad", "Arijit Singh, Pritam", "Love Aaj Kal"),
    ("pj-softly-karan-aujla", "Softly Karan Aujla", "Softly", "Karan Aujla", "Making Memories"),
    ("en-save-your-tears", "Save Your Tears The Weeknd", "Save Your Tears", "The Weeknd", "After Hours"),
    ("te-srivalli-telugu", "Srivalli Pushpa Sid Sriram", "Srivalli (Telugu)", "Sid Sriram, Devi Sri Prasad", "Pushpa"),
    ("kn-singara-siriye", "Singara Siriye Kantara Vijay Prakash", "Singara Siriye", "Vijay Prakash, Ananya Bhat", "Kantara"),
    ("hr-52-gaj-ka-daman", "52 Gaj Ka Daman Renuka Panwar", "52 Gaj Ka Daman", "Renuka Panwar", "52 Gaj Ka Daman")
]

resolved = {}
for tid, query, exp_t, exp_a, exp_alb in test_tracks:
    res = resolve_and_download_track(tid, query, exp_t, exp_a, exp_alb)
    if res:
        resolved[tid] = res

print("\n--- Summary of Resolved Master Tracks ---")
for k, v in resolved.items():
    print(f"[{k}] {v['title']} by {v['artist']} ({v['album']}) -> {v['storagePath']}")

with open(os.path.join(SCRATCH_DIR, 'resolved_test_tracks.json'), 'w', encoding='utf-8') as f:
    json.dump(resolved, f, indent=2)
