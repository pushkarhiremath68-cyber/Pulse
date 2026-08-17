import urllib.request
import urllib.parse
import json

def test_endpoints():
    print("Testing /api/saavn-search...")
    req = urllib.request.Request("http://localhost:3000/api/saavn-search?q=Mohit+Chauhan")
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        results = data.get('results', [])
        print(f"  Received {len(results)} results from /api/saavn-search")
        if results:
            print(f"  First result: {results[0].get('song')} ({results[0].get('singers')})")
            print(f"  Encrypted media url present: {bool(results[0].get('encrypted_media_url'))}")

    print("\nTesting /api/stream with redirect...")
    req2 = urllib.request.Request("http://localhost:3000/api/stream?q=Jasleen+Royal", headers={'User-Agent': 'Mozilla/5.0'})
    # Do not follow redirects to see 302 or test target
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None

    opener = urllib.request.build_opener(NoRedirect)
    try:
        resp2 = opener.open(req2, timeout=5)
        print(f"  Status: {resp2.status}")
    except urllib.error.HTTPError as e:
        if e.code == 302:
            print(f"  Status: 302 Redirect -> {e.headers.get('Location')[:70]}...")
        else:
            print(f"  HTTPError: {e.code}")

if __name__ == '__main__':
    test_endpoints()
