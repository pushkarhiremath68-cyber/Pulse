import urllib.request

preview_url = "https://preview.saavncdn.com/111/Stlde9Ljg87A3G3rgwYzTnYhNwO27Uvj1EMI_96_p.mp4"

variants = [
    preview_url.replace("preview.saavncdn.com", "aac.saavncdn.com").replace("_96_p.mp4", "_320.mp4"),
    preview_url.replace("preview.saavncdn.com", "aac.saavncdn.com").replace("_96_p.mp4", "_160.mp4"),
    preview_url.replace("preview.saavncdn.com", "aac.saavncdn.com").replace("_96_p.mp4", "_96.mp4"),
    preview_url.replace("preview.saavncdn.com", "aac.saavncdn.com").replace("_96_p.mp4", "_320.mp3"),
    preview_url.replace("_96_p.mp4", "_320.mp4"),
]

for v in variants:
    try:
        req = urllib.request.Request(v, headers={'User-Agent': 'Mozilla/5.0'}, method='HEAD')
        with urllib.request.urlopen(req, timeout=4) as resp:
            print(f"SUCCESS: {v} -> HTTP {resp.status}, Content-Length: {resp.headers.get('Content-Length')}")
    except Exception as e:
        print(f"FAIL: {v} -> {e}")
