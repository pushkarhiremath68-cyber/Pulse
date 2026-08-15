import urllib.request
import json
import urllib.parse

# Test piped API instances
piped_instances = [
    "https://pipedapi.kavin.rocks",
    "https://api.piped.privacy.com.de",
    "https://piped-api.lunar.icu",
    "https://api.piped.yt",
    "https://pipedapi.tokhmi.xyz"
]

yt_id = "lOVPUbSNSUk" # Sabrina Carpenter Espresso
for p in piped_instances:
    try:
        url = f"{p}/streams/{yt_id}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read().decode())
            audio_streams = data.get('audioStreams', [])
            print(f"SUCCESS {p}: Found {len(audio_streams)} audio streams!")
            if audio_streams:
                best = audio_streams[0]
                print(f"  Stream URL: {best.get('url')[:60]}... bitrate: {best.get('bitrate')}")
                break
    except Exception as e:
        print(f"FAIL {p}: {e}")
