import urllib.request
import urllib.parse
import json
import time

test_songs = [
    ("in-vashmalle", "Vashmalle", "Arijit Singh"),
    ("in-zaalima", "Zaalima", "Arijit Singh, Harshdeep Kaur"),
    ("in-ullu-ka-pattha", "Ullu Ka Pattha", "Arijit Singh, Nikhita Gandhi"),
    ("in-galti-se-mistake", "Galti Se Mistake", "Arijit Singh, Amit Mishra"),
    ("in-manchala", "Manchala", "Shafqat Amanat Ali, Nupur Pant"),
    ("in-bahara", "Bahara", "Shreya Ghoshal, Sona Mohapatra"),
    ("in-satrangi-re", "Satrangi Re", "Sonu Nigam, Kavita Krishnamurthy"),
    ("in-kaho-naa-pyaar-hai", "Kaho Naa Pyaar Hai", "Udit Narayan, Alka Yagnik"),
    ("en-irreplaceable-beyonc", "Irreplaceable", "Beyonce"),
    ("en-watermelon-sugar", "Watermelon Sugar", "Harry Styles"),
]

def fetch_hd_cover(title, artist):
    clean_artist = artist.split(',')[0].split('&')[0].strip()
    term = urllib.parse.quote(f"{title} {clean_artist}")
    url = f"https://itunes.apple.com/search?term={term}&entity=song&limit=1"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode())
            if data.get('results') and len(data['results']) > 0:
                art = data['results'][0].get('artworkUrl100')
                if art:
                    return art.replace('100x100bb', '600x600bb')
    except Exception as e:
        print(f"Error {title}: {e}")
    return None

print("Testing iTunes HD artwork search for sample songs:")
for tid, title, artist in test_songs:
    t0 = time.time()
    cover = fetch_hd_cover(title, artist)
    print(f"[{'OK' if cover else 'FAIL'} {time.time()-t0:.2f}s] {title} ({artist}) -> {cover}")
