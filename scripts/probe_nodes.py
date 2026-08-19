import urllib.request
import urllib.parse
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

CANDIDATES = [
    'https://pipedapi.adminforge.de',
    'https://pipedapi.r4fo.com',
    'https://pa.il.ax',
    'https://pipedapi.drgns.space',
    'https://piped-api.lunar.icu',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.smnz.de',
    'https://pipedapi.leptons.xyz',
    'https://invidious.nerdvpn.de',
    'https://inv.tux.pizza',
    'https://invidious.private.coffee',
    'https://invidious.jing.rocks',
    'https://invidious.einfachzocken.eu',
    'https://vid.priv.au',
    'https://inv.nadeko.net'
]

test_id = "fHI8X4OXluQ" # Blinding Lights

print("Probing active public stream extractor nodes...")
active_piped = []
active_invidious = []

for node in CANDIDATES:
    # Test Piped endpoint
    if 'piped' in node or node in ['https://pa.il.ax']:
        try:
            url = f"{node}/streams/{test_id}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    streams = data.get('audioStreams', [])
                    if streams:
                        print(f"[ACTIVE PIPED] {node} -> {len(streams)} audio streams (First: {streams[0].get('codec')}, {streams[0].get('bitrate')})")
                        active_piped.append(node)
        except Exception as e:
            pass
    else:
        # Test Invidious endpoint
        try:
            url = f"{node}/api/v1/videos/{test_id}?fields=title,adaptiveFormats"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
            with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    formats = [f for f in data.get('adaptiveFormats', []) if f.get('type', '').startswith('audio/')]
                    if formats:
                        print(f"[ACTIVE INVIDIOUS] {node} -> {len(formats)} audio formats")
                        active_invidious.append(node)
        except Exception as e:
            pass

print("\nSummary:")
print("Active Piped Nodes:", active_piped)
print("Active Invidious Nodes:", active_invidious)
