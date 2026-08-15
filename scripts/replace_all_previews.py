import os
import glob
import urllib.request
import urllib.parse
import json
import base64
import time
from Crypto.Cipher import DES
from concurrent.futures import ThreadPoolExecutor

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

def fetch_master_stream_url(query):
    try:
        url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8', errors='ignore'))
            results = data.get('results', [])
            if results:
                r = results[0]
                enc = r.get('encrypted_media_url')
                if enc:
                    dec = decrypt_saavn_url(enc)
                    if dec:
                        for q_key in ['160', '320', '96']:
                            stream_url = dec[q_key]
                            try:
                                t_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'}, method='HEAD')
                                with urllib.request.urlopen(t_req, timeout=4) as t_resp:
                                    if t_resp.status in (200, 206, 302):
                                        return stream_url, int(r.get('duration', 210)), r.get('song'), r.get('singers')
                            except Exception:
                                pass
    except Exception as e:
        pass
    return None, 0, '', ''

# Find all preview files (<1.5MB)
files = glob.glob(os.path.join(MUSIC_DIR, '*'))
preview_files = []
for f in files:
    if os.path.getsize(f) < 1500000:
        base = os.path.splitext(os.path.basename(f))[0]
        preview_files.append((base, f))

print(f"Found {len(preview_files)} preview files to replace with full length audio.")

def replace_preview(item):
    base_id, old_file_path = item
    query = base_id.replace('in-', '').replace('en-', '').replace('te-', '').replace('kn-', '').replace('pj-', '').replace('gu-', '').replace('mr-', '').replace('hr-', '').replace('es-', '').replace('fr-', '').replace('dev-', '').replace('-', ' ')
    
    stream_url, dur, song_name, singers = fetch_master_stream_url(query)
    if not stream_url:
        # Try with prefix
        stream_url, dur, song_name, singers = fetch_master_stream_url(f"{query} song")
        
    if not stream_url:
        print(f"[FAILED] {base_id} (query: {query})")
        return False
        
    dest_path = os.path.join(MUSIC_DIR, f"{base_id}.mp4")
    try:
        req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(dest_path, 'wb') as out_f:
                out_f.write(data)
                
        # Remove old preview file if different
        if os.path.exists(old_file_path) and old_file_path != dest_path:
            try:
                os.remove(old_file_path)
            except Exception:
                pass
                
        print(f"[REPLACED FULL] {base_id}: {song_name} by {singers} -> {len(data)/1024/1024:.2f} MB ({dur}s)")
        return True
    except Exception as e:
        print(f"[ERROR] {base_id}: {e}")
        return False

with ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(replace_preview, preview_files))

print(f"\nReplacement Summary: {sum(1 for r in results if r)} / {len(preview_files)} preview files replaced with FULL-LENGTH audio!")
