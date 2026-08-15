import os
import urllib.request
import urllib.parse
import json
import base64
from Crypto.Cipher import DES

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

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

def download_track(tid, query):
    url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8', errors='ignore'))
        results = data.get('results', [])
        if results:
            r = results[0]
            enc = r.get('encrypted_media_url')
            dec = decrypt_saavn_url(enc)
            for q_key in ['160', '320', '96']:
                stream_url = dec[q_key]
                dest = os.path.join(MUSIC_DIR, f"{tid}.mp4")
                try:
                    dl_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(dl_req, timeout=15) as a_resp:
                        data_bytes = a_resp.read()
                        with open(dest, 'wb') as f:
                            f.write(data_bytes)
                    print(f"SUCCESS: Saved {dest} ({len(data_bytes)/1024/1024:.2f} MB)")
                    for ext in ['.m4a', '.mp3']:
                        old_p = os.path.join(MUSIC_DIR, f"{tid}{ext}")
                        if os.path.exists(old_p) and old_p != dest:
                            try:
                                os.remove(old_p)
                            except Exception:
                                pass
                    return True
                except Exception as e:
                    pass
    return False

download_track("in-tujhe-kitna-chahein-aur", "Tujhe Kitna Chahne Lage Arijit Singh")
download_track("pj-peaches-diljit", "Peaches Diljit Dosanjh")
download_track("pj-tere-te-ap", "Tere Te AP Dhillon")
download_track("pj-old-skool-ap", "Old Skool Prem Dhillon Sidhu Moose Wala")
download_track("pj-goat-ap", "GOAT AP Dhillon")
download_track("pj-true-stories-ap", "True Stories AP Dhillon")
