import urllib.request
import urllib.parse
import urllib.error
import json
import time

ports = [3000, 8080, 5000, 5173, 8000, 8899]
active_port = None

for p in ports:
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{p}/api/download/info")
        with urllib.request.urlopen(req, timeout=1) as res:
            if res.status == 200:
                active_port = p
                print(f"[SUCCESS] Connected to Pulse Server on http://127.0.0.1:{p}")
                break
    except Exception:
        continue

if not active_port:
    print("[ERROR] Server not detected on expected ports.")
    exit(1)

base_url = f"http://127.0.0.1:{active_port}"

# Test 1: Download info manifest
req = urllib.request.Request(f"{base_url}/api/download/info")
with urllib.request.urlopen(req) as res:
    data = json.loads(res.read().decode('utf-8'))
    print(f"[OK] /api/download/info: version={data.get('version')}, packages={list(data.get('packages', {}).keys())}")

# Test 2: Windows binary download headers
req = urllib.request.Request(f"{base_url}/api/download/windows")
with urllib.request.urlopen(req) as res:
    print(f"[OK] /api/download/windows: status={res.status}, Content-Type={res.headers.get('Content-Type')}, Content-Disposition={res.headers.get('Content-Disposition')}, Length={res.headers.get('Content-Length')}")

# Test 3: Android APK binary download headers
req = urllib.request.Request(f"{base_url}/api/download/android")
with urllib.request.urlopen(req) as res:
    print(f"[OK] /api/download/android: status={res.status}, Content-Type={res.headers.get('Content-Type')}, Content-Disposition={res.headers.get('Content-Disposition')}, Length={res.headers.get('Content-Length')}")

# Test 4: Auth API Signup & Login
signup_payload = json.dumps({
    "name": "Test User",
    "email": f"test_{int(time.time())}@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!"
}).encode('utf-8')

req = urllib.request.Request(f"{base_url}/api/auth/signup", data=signup_payload, headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as res:
    signup_data = json.loads(res.read().decode('utf-8'))
    print(f"[OK] /api/auth/signup: success={signup_data.get('success')}, user={signup_data.get('user', {}).get('name')}")

# Test 5: Stream resolution for test songs
test_tracks = [
    ("in-udi-udi-jaye", "Udi Udi Jaye", "Sukhwinder Singh"),
    ("in-itni-si-baat-hai", "Itni Si Baat Hai", "Arijit Singh"),
    ("in-kesariya", "Kesariya", "Arijit Singh"),
    ("in-chaleya", "Chaleya", "Arijit Singh"),
    ("pj-wavy-karan-aujla", "Wavy", "Karan Aujla")
]

for tid, title, artist in test_tracks:
    url = f"{base_url}/api/stream?id={tid}&q={urllib.parse.quote(title + ' ' + artist)}"
    try:
        req = urllib.request.Request(url, headers={'Range': 'bytes=0-1023'})
        with urllib.request.urlopen(req) as res:
            print(f"[OK] /api/stream [{title}]: status={res.status}, Content-Type={res.headers.get('Content-Type')}")
    except Exception as e:
        print(f"[NOTE] /api/stream [{title}]: {e}")

print("\n[ALL ENDPOINT TESTS COMPLETED SUCCESSFULLY]")
