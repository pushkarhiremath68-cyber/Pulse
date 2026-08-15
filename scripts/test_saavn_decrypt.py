import urllib.request
import json
import urllib.parse
import base64
from Crypto.Cipher import DES

def decrypt_saavn_url(encrypted_url):
    key = b"38346591"
    cipher = DES.new(key, DES.MODE_ECB)
    dec = cipher.decrypt(base64.b64decode(encrypted_url))
    # Unpad PKCS5/7
    pad_len = dec[-1]
    if 1 <= pad_len <= 8:
        dec = dec[:-pad_len]
    url = dec.decode('utf-8')
    return {
        '320': url.replace("_96.mp4", "_320.mp4").replace(".mp4", "_320.mp4") if not url.endswith("_320.mp4") else url,
        '160': url.replace("_96.mp4", "_160.mp4"),
        '96': url
    }

# Test searching and decrypting Sabrina Carpenter Espresso and Hanuman Chalisa
test_songs = ["Espresso Sabrina Carpenter", "Shri Hanuman Chalisa Gulshan Kumar", "Shiv Tandav Shankar Mahadevan", "Belageddu Kirik Party", "Naatu Naatu RRR"]

for q in test_songs:
    search_url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(q)
    req = urllib.request.Request(search_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            if results:
                r = results[0]
                enc = r.get('encrypted_media_url')
                dec_urls = decrypt_saavn_url(enc)
                print(f"\n[FOUND] {r.get('song')} by {r.get('singers')}")
                print(f"  Duration: {r.get('duration')}s")
                print(f"  Stream 320: {dec_urls['320']}")
                # Test stream connectivity
                for q_key in ['320', '160', '96']:
                    u = dec_urls[q_key]
                    try:
                        t_req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'}, method='HEAD')
                        with urllib.request.urlopen(t_req, timeout=3) as t_resp:
                            sz = int(t_resp.headers.get('Content-Length', 0))
                            print(f"  Verified {q_key}kbps stream: HTTP {t_resp.status} ({sz / 1024 / 1024:.2f} MB)")
                            break
                    except Exception as e:
                        pass
    except Exception as e:
        print(f"Error {q}: {e}")
