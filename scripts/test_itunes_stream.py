import urllib.request
import urllib.parse
import json

test_queries = [
    'Shayad Arijit Singh',
    'Kesariya Arijit Singh',
    'Brown Munde AP Dhillon',
    'Excuses AP Dhillon',
    'Insane AP Dhillon',
    'With You AP Dhillon',
    'Lover Diljit Dosanjh',
    'Kinni Kinni Diljit Dosanjh',
    'Singara Siriye Vijay Prakash',
    'Srivalli Sid Sriram',
    '52 Gaj Ka Daman Renuka Panwar',
    'Zingaat Ajay Atul',
    'Khalasi Aditya Gadhvi',
    'Blinding Lights The Weeknd',
    'Shape of You Ed Sheeran',
    'Espresso Sabrina Carpenter',
    'Die With A Smile Lady Gaga Bruno Mars',
    'Despacito Luis Fonsi'
]

success = 0
for q in test_queries:
    try:
        url = f'https://itunes.apple.com/search?term={urllib.parse.quote(q)}&entity=song&limit=1'
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            if data.get('results'):
                r = data['results'][0]
                p = r.get('previewUrl')
                print(f"[OK] {q} -> \"{r.get('trackName')}\" by {r.get('artistName')} (Preview: {p is not None})")
                success += 1
            else:
                print(f"[NO RESULT] {q}")
    except Exception as e:
        print(f"[ERR] {q}: {e}")

print(f"\nTotal Success: {success}/{len(test_queries)}")
