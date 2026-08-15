import urllib.request

test_ids = [
    "en-espresso",
    "dev-hanuman-chalisa-gulshan",
    "dev-shiv-tandav-stotram",
    "in-kesariya",
    "te-naatu-naatu",
    "kn-belageddu",
    "gu-khalasi",
    "pj-lover-diljit",
]

for tid in test_ids:
    url = f"http://127.0.0.1:3000/api/stream?id={tid}"
    try:
        req = urllib.request.Request(url, headers={'Range': 'bytes=0-1023'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            print(f"[OK] {tid}: Status {resp.status} | Content-Type: {resp.headers.get('Content-Type')} | Content-Range: {resp.headers.get('Content-Range')}")
    except Exception as e:
        print(f"[FAIL] {tid}: {e}")
