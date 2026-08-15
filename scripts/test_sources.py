import urllib.request
import urllib.parse
import json

def test_jiosaavn(song_name):
    # Official unofficial JioSaavn search API endpoints
    endpoints = [
        f"https://saavn.me/search/songs?query={urllib.parse.quote(song_name)}",
        f"https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query={urllib.parse.quote(song_name)}",
        f"https://jiosaavn-api.vercel.app/search/songs?query={urllib.parse.quote(song_name)}",
        f"https://saavn.dev/api/search/songs?query={urllib.parse.quote(song_name)}"
    ]
    for ep in endpoints:
        try:
            req = urllib.request.Request(ep, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode())
                print(f"SUCCESS {ep}: {data.get('status') or 'ok'}")
                return data
        except Exception as e:
            print(f"FAIL {ep}: {e}")
    return None

def test_itunes(song_name):
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(song_name)}&entity=song&limit=5"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            print(f"SUCCESS iTunes: {data.get('resultCount')} tracks found")
            if data.get('results'):
                for r in data['results'][:2]:
                    print("  ->", r.get('trackName'), "-", r.get('artistName'), "preview:", r.get('previewUrl')[:60])
            return data
    except Exception as e:
        print(f"FAIL iTunes: {e}")
    return None

def test_piped_invidious(query):
    instances = [
        f"https://pipedapi.kavin.rocks/search?q={urllib.parse.quote(query)}&filter=music_songs",
        f"https://api.piped.privacydev.net/search?q={urllib.parse.quote(query)}&filter=music_songs",
        f"https://invidious.privacydev.net/api/v1/search?q={urllib.parse.quote(query)}&type=video",
    ]
    for ep in instances:
        try:
            req = urllib.request.Request(ep, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
                print(f"SUCCESS {ep}")
                return data
        except Exception as e:
            print(f"FAIL {ep}: {e}")
    return None

print("--- Testing APIs ---")
test_jiosaavn("Shayad Arijit Singh")
test_itunes("Shayad Arijit Singh")
test_piped_invidious("Shayad Arijit Singh")
