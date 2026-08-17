import urllib.request
import urllib.parse
import json

q = 'Ishq Ka Safar Aditya Rikhari'
url = 'http://localhost:3000/api/saavn-search?q=' + urllib.parse.quote(q)
req = urllib.request.Request(url)
with urllib.request.urlopen(req, timeout=5) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    results = data.get('results', [])
    print(f'Results for "{q}": {len(results)}')
    for r in results:
        print('  Song:', r.get('song'), '| Encrypted:', bool(r.get('encrypted_media_url')))
