import urllib.request
import json
import urllib.parse
import base64

url = "https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=" + urllib.parse.quote("Sabrina Carpenter Espresso")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        content = resp.read().decode('utf-8', errors='ignore')
        data = json.loads(content)
        results = data.get('results', [])
        print(f"JioSaavn Official API SUCCESS: Found {len(results)} songs!")
        for r in results[:3]:
            print(f"  Song: {r.get('song')} | Artist: {r.get('singers')} | Media URL: {r.get('media_preview_url')} | Encrypted: {r.get('encrypted_media_url')[:30]}...")
except Exception as e:
    print(f"Error: {e}")
