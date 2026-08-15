import urllib.request
import urllib.parse

sample_tracks = [
    ("Lover (Diljit Dosanjh)", "pj-lover-diljit", "mH_LFkWxpI0"),
    ("G.O.A.T. (Diljit Dosanjh)", "pj-goat-diljit", "cl0a3i2wFcc"),
    ("Naina (Diljit Dosanjh)", "pj-naina-crew", "8g76Z8Y8j8Y"),
    ("Excuses (AP Dhillon)", "pj-excuses-ap", "vX2cDW8up2g"),
    ("Insane (AP Dhillon)", "pj-insane-ap", "4zJg8M1jG2w"),
    ("With You (AP Dhillon)", "pj-with-you-ap", "Qv6j2b8m14c"),
    ("Summer High (AP Dhillon)", "pj-summer-high-ap", "W7M60N7w_Z0"),
]

print("Testing Audio Stream Resolution for Diljit Dosanjh & AP Dhillon Songs:")
for name, track_id, ytid in sample_tracks:
    q_enc = urllib.parse.quote(name)
    url = f"http://localhost:3000/api/stream?id={track_id}&ytId={ytid}&q={q_enc}"
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-2048'
        })
        res = urllib.request.urlopen(req, timeout=15)
        ctype = res.headers.get('Content-Type')
        crange = res.headers.get('Content-Range')
        bytes_len = len(res.read())
        print(f"[PASS {res.status}] {name} -> {ctype} | Range: {crange} | Bytes: {bytes_len}")
    except Exception as e:
        print(f"[FAIL] {name} -> {e}")
