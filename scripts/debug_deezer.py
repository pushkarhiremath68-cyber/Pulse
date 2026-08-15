import urllib.request
import json

try:
    req = urllib.request.Request('https://api.deezer.com/search?q=watermelon+sugar', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=5) as r:
        data = json.loads(r.read())
        print("Deezer:", data['data'][0]['album']['cover_xl'])
except Exception as e:
    print("Deezer error:", e)
