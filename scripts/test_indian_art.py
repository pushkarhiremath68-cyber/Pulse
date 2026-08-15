import urllib.request
import urllib.parse
import json

sample_indian_songs = [
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
]

print("Testing iTunes search with &country=IN:")
for title in sample_indian_songs:
    term = urllib.parse.quote(title)
    url = f"https://itunes.apple.com/search?term={term}&country=IN&entity=song&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            if data.get('results') and len(data['results']) > 0:
                art = data['results'][0].get('artworkUrl100')
                if art:
                    hd = art.replace('100x100bb', '600x600bb')
                    print(f"[OK] {title} -> {hd}")
                else:
                    print(f"[NO ART] {title}")
            else:
                print(f"[NOT FOUND] {title}")
    except Exception as e:
        print(f"[ERR] {title}: {e}")
