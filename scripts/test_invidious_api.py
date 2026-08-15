import urllib.request
import json
import os

instances = [
    "https://inv.nadeko.net",
    "https://invidious.nerdvpn.de",
    "https://invidious.drgns.space",
    "https://yt.artemislena.eu",
    "https://invidious.jing.rocks",
    "https://iv.melmac.space",
    "https://invidious.einfachzocken.eu",
    "https://invidious.privacyredirect.com",
    "https://inv.tux.pizza"
]

yt_id = "lOVPUbSNSUk" # Sabrina Carpenter Espresso
for inst in instances:
    try:
        url = f"{inst}/api/v1/videos/{yt_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode())
            formats = data.get('adaptiveFormats', [])
            audio_formats = [f for f in formats if f.get('type', '').startswith('audio/')]
            print(f"SUCCESS {inst}: Found {len(audio_formats)} audio formats for Espresso! Length: {data.get('lengthSeconds')}s")
            if audio_formats:
                best_audio = sorted(audio_formats, key=lambda x: int(x.get('bitrate', 0)), reverse=True)[0]
                audio_url = best_audio.get('url')
                print(f"  Best audio: {best_audio.get('type')}, bitrate: {best_audio.get('bitrate')}")
                if audio_url:
                    dest = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music', 'en-espresso.m4a')
                    audio_req = urllib.request.Request(audio_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(audio_req, timeout=10) as a_resp:
                        with open(dest, 'wb') as f:
                            f.write(a_resp.read())
                    print(f"  SAVED full length Espresso to {dest}: {os.path.getsize(dest)} bytes (~{os.path.getsize(dest)/(1024*1024):.2f} MB)")
                    break
    except Exception as e:
        print(f"FAIL {inst}: {e}")
