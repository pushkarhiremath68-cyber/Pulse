import urllib.request
import urllib.parse
import json

# Test JioSaavn full track audio stream endpoints
test_endpoints = [
    "https://saavn.me/api/search/songs?query=",
    "https://jiosaavn-api-privatecvc2.vercel.app/api/search/songs?query=",
    "https://jiosaavn-api-2.vercel.app/api/search/songs?query=",
    "https://jiosaavn-api-sigma.vercel.app/api/search/songs?query=",
    "https://jiosavan-api.vercel.app/api/search/songs?query=",
    "https://saavn-api.vercel.app/api/search/songs?query=",
]

q = "Espresso Sabrina Carpenter"
for ep in test_endpoints:
    try:
        url = ep + urllib.parse.quote(q)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            print(f"SUCCESS {ep}: {data.keys()}")
    except Exception as e:
        print(f"FAIL {ep}: {e}")
