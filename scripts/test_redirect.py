import urllib.request
import json

# Test /api/stream with redirect handling
opener = urllib.request.build_opener(urllib.request.HTTPRedirectHandler)
req = urllib.request.Request('http://localhost:3000/api/stream?q=Kesariya%20Arijit%20Singh', headers={'User-Agent': 'Mozilla/5.0'})
try:
    resp = opener.open(req, timeout=10)
    print("Final URL:", resp.geturl()[:80])
    print("Status:", resp.status)
    print("Content-Type:", resp.headers.get('Content-Type'))
    print("Bytes:", len(resp.read(1024)))
except Exception as e:
    print("Redirect test error:", e)
