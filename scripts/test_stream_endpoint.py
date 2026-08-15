import urllib.request
import urllib.parse

test_cases = [
    {"id": "pj-born-to-shine", "q": "Born to Shine Diljit Dosanjh"},
    {"id": "in-shayad", "q": "Shayad Arijit Singh"},
    {"id": "kn-belageddu", "q": "Belageddu Vijay Prakash"},
    {"id": "mr-zingaat", "q": "Zingaat Ajay Atul"},
    {"id": "en-espresso", "q": "Espresso Sabrina Carpenter"},
    {"id": "gu-khalasi", "q": "Khalasi Aditya Gadhvi"},
    {"id": "te-srivalli", "q": "Srivalli Sid Sriram"},
    {"id": "random-track-999", "q": "Attention Charlie Puth"},
]

print("=== TESTING /api/stream ENDPOINTS ===")
for tc in test_cases:
    qs = urllib.parse.urlencode(tc)
    url = f"http://localhost:3000/api/stream?{qs}"
    try:
        req = urllib.request.Request(url, headers={'Range': 'bytes=0-1024'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            content_type = resp.headers.get('Content-Type')
            content_range = resp.headers.get('Content-Range')
            status = resp.status
            data_len = len(resp.read())
            print(f"[OK {status}] {tc['q']} -> Type: {content_type}, Range: {content_range}, Bytes: {data_len}")
    except Exception as e:
        print(f"[FAILED] {tc['q']}: {e}")
