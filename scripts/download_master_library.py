import urllib.request
import urllib.parse
import json
import os
import base64
import time
from Crypto.Cipher import DES
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')
os.makedirs(MUSIC_DIR, exist_ok=True)

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
                        # Try 160 first as it has 100% availability
                        for q_key in ['160', '320', '96']:
                            stream_url = dec[q_key]
                            try:
                                t_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'}, method='HEAD')
                                with urllib.request.urlopen(t_req, timeout=4) as t_resp:
                                    if t_resp.status in (200, 206, 302):
                                        return stream_url, int(r.get('duration', 210))
                            except Exception:
                                pass
    except Exception as e:
        pass
    return None, 0

# List of all preview tracks that need full length audio
PREVIEW_TRACKS_TO_FIX = [
    ("en-espresso", "Espresso", "Sabrina Carpenter"),
    ("en-arcade", "Arcade", "Duncan Laurence"),
    ("en-august-taylor-swift", "August", "Taylor Swift"),
    ("en-bad-habits-ed-sheeran", "Bad Habits", "Ed Sheeran"),
    ("en-bones", "Bones", "Imagine Dragons"),
    ("en-die-for-you-the-weeknd", "Die For You", "The Weeknd"),
    ("en-enemy", "Enemy", "Imagine Dragons"),
    ("en-starboy-the-weeknd", "Starboy", "The Weeknd"),
    ("es-calma", "Calma", "Pedro Capo"),
    ("es-despacito", "Despacito", "Luis Fonsi"),
    ("gu-char-bangadi", "Char Char Bangadi", "Kinjal Dave"),
    ("gu-chogada", "Chogada", "Darshan Raval"),
    ("gu-khalasi", "Khalasi Gotilo", "Aditya Gadhvi"),
    ("gu-nagada-sang-dhol", "Nagada Sang Dhol", "Shreya Ghoshal"),
    ("dev-hanuman-chalisa-gulshan", "Shree Hanuman Chalisa", "Gulshan Kumar"),
    ("dev-shiv-tandav-stotram", "Shiv Tandav Stotram", "Shankar Mahadevan"),
    ("dev-namo-namo", "Namo Namo", "Amit Trivedi"),
    ("dev-achyutam-keshavam", "Achyutam Keshavam", "Madhuraa Bhattacharya"),
    ("dev-har-har-shambhu", "Har Har Shambhu", "Abhilipsa Panda"),
    ("dev-aigiri-nandini", "Aigiri Nandini", "Brodha V"),
    ("dev-ram-aayenge", "Ram Aayenge", "Swasti Mehul"),
    ("dev-mere-ghar-ram", "Mere Ghar Ram Aaye Hain", "Jubin Nautiyal"),
    ("dev-shri-krishna-govind", "Shri Krishna Govind", "Jubin Nautiyal"),
    ("dev-shri-ram-chandra-kripalu", "Shri Ram Chandra Kripalu", "Anup Jalota"),
    ("dev-kaal-bhairav-ashtakam", "Kaal Bhairav Ashtakam", "Ramesh Bhai Ojha"),
    ("dev-maha-mrityunjaya-mantra", "Maha Mrityunjaya Mantra", "Shankar Sahney"),
    ("dev-kn-bhagyada-lakshmi", "Bhagyada Lakshmi Baramma", "Bhimsen Joshi"),
    ("dev-kn-jagadodharana", "Jagadodharana", "M.S. Subbulakshmi"),
    ("dev-kn-krishna-nee-begane", "Krishna Nee Begane Baaro", "Colonial Cousins"),
    ("dev-kn-pillangoviya-cheluva", "Pillangoviya Cheluva", "Puttur Narasimha Nayak"),
    ("dev-te-brahmamokkate", "Brahmamokkate", "M.S. Subbulakshmi"),
    ("dev-te-kondalalo-nelakonna", "Kondalalo Nelakonna", "S.P. Balasubrahmanyam"),
    ("dev-te-muddugare-yashoda", "Muddugare Yashoda", "M.S. Subbulakshmi"),
    ("dev-te-govinda-namalu", "Govinda Namalu", "S.P. Balasubrahmanyam"),
    ("dev-pj-mool-mantar", "Mool Mantar Ik Onkar", "Bhai Harjinder Singh"),
    ("dev-pj-waheguru-simran", "Waheguru Simran", "Bhai Joginder Singh Riar"),
    ("dev-pj-lakh-khushian", "Lakh Khushian Patshahian", "Bhai Harjinder Singh"),
    ("dev-mr-vitthal-vitthal", "Vitthal Vitthal", "Suresh Wadkar"),
    ("dev-mr-majhe-maher-pandhari", "Majhe Maher Pandhari", "Bhimsen Joshi"),
    ("dev-gu-vaishnav-jan-to", "Vaishnav Jan To", "Sachin-Jigar"),
    ("dev-khwaja-mere-khwaja", "Khwaja Mere Khwaja", "A.R. Rahman"),
    ("dev-kun-faya-kun", "Kun Faya Kun", "A.R. Rahman"),
]

def download_track(item):
    tid, title, artist = item
    query = f"{title} {artist}"
    
    # Check existing file size
    for ext in ['.mp4', '.m4a', '.mp3']:
        fp = os.path.join(MUSIC_DIR, f"{tid}{ext}")
        if os.path.exists(fp) and os.path.getsize(fp) > 2000000:
            print(f"[ALREADY FULL] {title} ({os.path.getsize(fp)/1024/1024:.2f} MB)")
            return True

    stream_url, dur = fetch_master_stream_url(query)
    if not stream_url:
        print(f"[NOT FOUND] {title} by {artist}")
        return False
        
    dest_path = os.path.join(MUSIC_DIR, f"{tid}.mp4")
    try:
        t0 = time.time()
        req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
            with open(dest_path, 'wb') as out_f:
                out_f.write(data)
        
        # Clean up any existing small .m4a or .mp3 preview files
        for ext in ['.m4a', '.mp3']:
            old_p = os.path.join(MUSIC_DIR, f"{tid}{ext}")
            if os.path.exists(old_p) and old_p != dest_path and os.path.getsize(old_p) < 1500000:
                try:
                    os.remove(old_p)
                except Exception:
                    pass
                    
        elapsed = time.time() - t0
        print(f"[DOWNLOADED {elapsed:.1f}s] {title} -> {len(data)/1024/1024:.2f} MB (Full length: {dur}s)")
        return True
    except Exception as e:
        print(f"[ERROR] {title}: {e}")
        return False

print(f"Starting parallel download of {len(PREVIEW_TRACKS_TO_FIX)} preview tracks with full length audio...")
with ThreadPoolExecutor(max_workers=6) as executor:
    results = list(executor.map(download_track, PREVIEW_TRACKS_TO_FIX))

print(f"\nCompleted: {sum(1 for r in results if r)} / {len(PREVIEW_TRACKS_TO_FIX)} tracks now full length!")
