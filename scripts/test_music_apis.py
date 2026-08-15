import urllib.request
import urllib.parse
import json

test_tracks = [
    "Tera Rastaa Chhodoon Na",
    "Subhanallah",
    "Ajj Din Chadheya",
    "Bheegi Si Bhaagi Si",
    "Chand Sifarish",
    "Main Yahaan Tu Wahaan",
    "Yeh Ladka Hai Allah",
    "Mitwa",
    "Noor E Khuda",
    "Humko Humise Chura Lo",
    "Jiya Jale",
    "Tu Hi Re",
    "Udi Udi Jaye",
    "Aye Udi Udi Udi",
    "Watermelon Sugar",
    "Irreplaceable Beyonce",
]

def search_deezer(query):
    try:
        url = f"https://api.deezer.com/search?q={urllib.parse.quote(query)}&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            if data.get('data') and len(data['data']) > 0:
                item = data['data'][0]
                return item.get('album', {}).get('cover_xl') or item.get('album', {}).get('cover_big') or item.get('album', {}).get('cover_medium')
    except Exception as e:
        pass
    return None

def search_saavn(query):
    try:
        url = f"https://saavn.dev/api/search/songs?query={urllib.parse.quote(query)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            results = data.get('data', {}).get('results', [])
            if results and len(results) > 0:
                imgs = results[0].get('image', [])
                if imgs and len(imgs) > 0:
                    return imgs[-1].get('url') or imgs[0].get('url')
    except Exception as e:
        pass
    return None

print("Testing Deezer & Saavn APIs for Indian & Global Songs:")
for t in test_tracks:
    art = search_deezer(t)
    src = 'Deezer'
    if not art:
        art = search_saavn(t)
        src = 'Saavn'
    print(f"[{src if art else 'FAIL'}] {t} -> {art}")
