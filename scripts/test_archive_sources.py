import urllib.request
import urllib.parse
import json

# Test fetching full Sabrina Carpenter Espresso audio from Deezer / JioSaavn / Internet Archive / Audiomack / Piped
urls_to_test = [
    f"https://archive.org/advancedsearch.php?q={urllib.parse.quote('Sabrina Carpenter Espresso')}&fl[]=identifier,title,mediatype&output=json",
    f"https://api.audiomack.com/v1/search?q={urllib.parse.quote('Sabrina Carpenter Espresso')}&limit=3",
]

for u in urls_to_test:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            print(f"SUCCESS {u[:40]}: {str(data)[:200]}")
    except Exception as e:
        print(f"FAIL: {e}")
