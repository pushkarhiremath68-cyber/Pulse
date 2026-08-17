import urllib.request
import urllib.parse
import json
import base64
import re
from Crypto.Cipher import DES

def decrypt_saavn_url(encrypted_url):
    key = b'38346591'
    cipher = DES.new(key, DES.MODE_ECB)
    dec = cipher.decrypt(base64.b64decode(encrypted_url))
    pad_len = dec[-1]
    if 1 <= pad_len <= 8:
        dec = dec[:-pad_len]
    url = dec.decode('utf-8')
    return {
        '320': url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4'),
        '160': url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4'),
        '96': url
    }

def clean_query(title, artist):
    clean_t = re.sub(r'[()\[\]{}"\'|]', ' ', title).strip()
    clean_t = re.sub(r'\s+', ' ', clean_t)
    return f'{clean_t} {artist}'.strip()

samples = [
    ('Zindagi (Guzarish)', 'Mohit Chauhan'),
    ('Saiyaan Bina', 'Jasleen Royal'),
    ('Humsafar Deewani', 'Jasleen Royal'),
    ('Ishq (Ka Safar)', 'Aditya Rikhari'),
    ('Dua (Guzarish)', 'Lucky Ali'),
    ('Deewana (Jaisi)', 'Sonu Nigam'),
    ('Saiyaan Ki Raat', 'Pritam'),
    ('Yaad Ke Pal', 'Lata Mangeshkar'),
    ('Pyaar Taraana', 'Shreya Ghoshal'),
    ('Safar Ki Raat', 'Shreya Ghoshal')
]

for title, artist in samples:
    q = clean_query(title, artist)
    url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=2&p=1&_marker=0&ctx=android&q=' + urllib.parse.quote(q)
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                r = results[0]
                enc = r.get('encrypted_media_url')
                dec = decrypt_saavn_url(enc) if enc else None
                mp4 = dec['320'] if dec else None
                print(f'MATCH: "{title}" by {artist} -> "{r.get("song")}" ({r.get("singers")})')
                print(f'       Stream: {mp4[:65] if mp4 else "None"}...')
            else:
                # Search by artist popular songs
                url_artist = 'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=1&p=1&_marker=0&ctx=android&q=' + urllib.parse.quote(artist)
                with urllib.request.urlopen(urllib.request.Request(url_artist, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})) as resp_a:
                    data_a = json.loads(resp_a.read().decode('utf-8'))
                    res_a = data_a.get('results', [])
                    if res_a:
                        ra = res_a[0]
                        enc = ra.get('encrypted_media_url')
                        dec = decrypt_saavn_url(enc) if enc else None
                        print(f'ARTIST MATCH: "{title}" by {artist} -> "{ra.get("song")}" ({ra.get("singers")})')
                        print(f'       Stream: {dec["320"][:65] if dec else "None"}...')
    except Exception as e:
        print(f'ERROR for {title}: {e}')
