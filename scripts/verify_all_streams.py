import urllib.request
import urllib.parse
import json

# Test /api/stream with a sample of Devotional, English, Hindi, Telugu, Kannada, Gujarati, Punjabi tracks
test_ids = [
    "en-espresso",
    "dev-hanuman-chalisa-gulshan",
    "dev-shiv-tandav-stotram",
    "in-kesariya",
    "te-naatu-naatu",
    "kn-belageddu",
    "gu-khalasi",
    "pj-lover-diljit",
    "mr-zingaat",
]

print("=== RUNNING AUTOMATED AUDIO STREAM VERIFICATION ===")
for tid in test_ids:
    url = f"http://localhost:3000/api/stream?id={tid}"
    try:
        req = urllib.request.Request(url, headers={'Range': 'bytes=0-1023'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            status = resp.status
            ctype = resp.headers.get('Content-Type')
            crange = resp.headers.get('Content-Range')
            clen = resp.headers.get('Content-Length')
            print(f"[OK] {tid}: HTTP {status} | Type: {ctype} | Range: {crange} | Length: {clen} bytes")
    except Exception as e:
        print(f"[FAIL] {tid}: {e}")

print("=== ALL STREAMS TESTED ===")
