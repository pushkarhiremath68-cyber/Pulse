import urllib.request, urllib.parse, json, base64
from Crypto.Cipher import DES

def decrypt_saavn(enc_url):
    key = b'38346591'
    enc = base64.b64decode(enc_url.strip())
    cipher = DES.new(key, DES.MODE_ECB)
    dec = cipher.decrypt(enc)
    pad = dec[-1]
    if isinstance(pad, int):
        dec = dec[:-pad]
    raw = dec.decode('utf-8').strip()
    return raw.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4')

queries = [
    ('softly', 'Softly Karan Aujla Ikky'),
    ('wavy', 'Wavy Karan Aujla Four Me'),
    ('lover', 'Lover Diljit Dosanjh'),
    ('kesariya', 'Kesariya Brahmastra Arijit Singh'),
    ('apna bana le', 'Apna Bana Le Bhediya Arijit Singh'),
    ('tum hi ho', 'Tum Hi Ho Aashiqui 2 Arijit Singh'),
    ('chaleya', 'Chaleya Jawan Arijit Singh'),
    ('kal ho naa ho', 'Kal Ho Naa Ho Sonu Nigam'),
    ('tujhe dekha toh', 'Tujhe Dekha Toh DDLJ Kumar Sanu'),
    ('chaiyya chaiyya', 'Chaiyya Chaiyya Dil Se Sukhwinder'),
    ('excuses', 'Excuses AP Dhillon'),
    ('brown munde', 'Brown Munde AP Dhillon'),
    ('295', '295 Sidhu Moose Wala'),
    ('born to shine', 'Born to Shine Diljit Dosanjh'),
    ('white brown black', 'White Brown Black Karan Aujla'),
    ('mi amor', 'Mi Amor Sharn')
]

headers = {'User-Agent': 'Mozilla/5.0'}
direct_map = {}

for name, q in queries:
    url = f'https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q={urllib.parse.quote(q)}'
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as r:
            d = json.loads(r.read().decode('utf-8'))
            results = d.get('results', [])
            if results:
                top = results[0]
                enc = top.get('encrypted_media_url')
                stream_url = decrypt_saavn(enc) if enc else None
                img = top.get('image', '').replace('150x150', '500x500')
                song_name = top.get('song') or top.get('title')
                artist_name = top.get('primary_artists') or top.get('singers')
                direct_map[name.lower()] = {
                    'title': song_name,
                    'artist': artist_name,
                    'streamUrl': stream_url,
                    'cover': img
                }
                print(f"'{name.lower()}': {{ title: '{song_name}', artist: '{artist_name}', streamUrl: '{stream_url}', cover: '{img}' }},")
    except Exception as e:
        print(f"Error {name}: {e}")

with open('scratch/direct_master_map.json', 'w') as f:
    json.dump(direct_map, f, indent=2)
