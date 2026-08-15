import urllib.request
import json

BASE_URL = "http://127.0.0.1:3000"

print("==========================================================")
print("TESTING SECURE BINARY DOWNLOAD API ENDPOINTS")
print("==========================================================")

# 1. Test /api/download/info
info_url = f"{BASE_URL}/api/download/info"
req = urllib.request.Request(info_url)
with urllib.request.urlopen(req, timeout=3) as resp:
    assert resp.status == 200
    data = json.loads(resp.read().decode('utf-8'))
    assert data.get('success') is True
    packages = data.get('packages', {})
    assert 'windows' in packages
    assert 'mac' in packages
    assert 'android' in packages
    assert 'linux' in packages
    assert 'ios' in packages
    print(f"[PASS] 1. /api/download/info returned manifest (v{data.get('version')}) with all 5 platforms!")
    for os_key, pkg in packages.items():
        print(f"       -> {pkg['platform']:<8}: {pkg['filename']} ({pkg['size_display']}) SHA256: {pkg['sha256'][:16]}...")

# 2. Test /api/download/windows
win_url = f"{BASE_URL}/api/download/windows"
req_win = urllib.request.Request(win_url)
with urllib.request.urlopen(req_win, timeout=3) as resp_win:
    assert resp_win.status == 200
    ctype = resp_win.headers.get('Content-Type')
    cdisp = resp_win.headers.get('Content-Disposition')
    nosniff = resp_win.headers.get('X-Content-Type-Options')
    etag = resp_win.headers.get('ETag')
    assert 'application/vnd.microsoft.portable-executable' in ctype
    assert 'attachment' in cdisp
    assert nosniff == 'nosniff'
    payload = resp_win.read()
    assert len(payload) > 10000
    print(f"[PASS] 2. /api/download/windows successfully streamed signed installer ({len(payload)} bytes) with headers: Content-Type={ctype}, Content-Disposition={cdisp}, ETag={etag}")

# 3. Test /api/download/android
apk_url = f"{BASE_URL}/api/download/android"
with urllib.request.urlopen(apk_url, timeout=3) as resp_apk:
    assert resp_apk.status == 200
    ctype_apk = resp_apk.headers.get('Content-Type')
    assert 'application/vnd.android.package-archive' in ctype_apk
    payload_apk = resp_apk.read()
    assert len(payload_apk) > 10000
    print(f"[PASS] 3. /api/download/android streamed APK ({len(payload_apk)} bytes) with MIME: {ctype_apk}")

print("\n[ALL DOWNLOAD API TESTS PASSED SUCCESSFULLY!]")
