import urllib.request
import os

instances = [
    "https://yewtu.be",
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://invidious.drgns.space",
    "https://yt.artemislena.eu",
    "https://invidious.jing.rocks",
    "https://iv.melmac.space",
    "https://invidious.einfachzocken.eu",
]

yt_id = "lOVPUbSNSUk" # Espresso Sabrina Carpenter
print(f"Testing direct full-length audio stream for Espresso ({yt_id})...")

for inst in instances:
    try:
        url = f"{inst}/latest_version?id={yt_id}&itag=140"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            content_length = resp.headers.get('Content-Length')
            content_type = resp.headers.get('Content-Type')
            print(f"SUCCESS {inst}: Status={resp.status}, Type={content_type}, Size={content_length} bytes (~{int(content_length or 0)/(1024*1024):.2f} MB)")
            # Download full Espresso
            dest = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music', 'en-espresso.m4a')
            with open(dest, 'wb') as f:
                f.write(resp.read())
            print(f"SAVED full Espresso to {dest}: {os.path.getsize(dest)} bytes!")
            break
    except Exception as e:
        print(f"Failed {inst}: {e}")
