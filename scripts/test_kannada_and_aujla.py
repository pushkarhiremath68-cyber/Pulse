import urllib.request
import urllib.parse

sample_tracks = [
    ("Singara Siriye (Kantara)", "kn-singara-siriye", "2kL3Wn6Jq1E"),
    ("Toofan (KGF 2)", "kn-toofan-kgf2", "vWbK4tJ_6qU"),
    ("Anisuthide (Mungaru Male)", "kn-anisuthide", "6x0s8m7v1q0"),
    ("Softly (Karan Aujla)", "pj-softly-karan-aujla", "cWMxCE2HTag"),
    ("Winning Speech (Karan Aujla)", "pj-winning-speech-karan-aujla", "6Pky_vXh_sQ"),
    ("Admiring You (Karan Aujla)", "pj-admiring-you-karan-aujla", "k4A3N-qF4pE"),
    ("52 Bars (Karan Aujla)", "pj-52-bars-karan-aujla", "1w7x_k9m_4g"),
]

print("Testing Audio Stream Resolution for Kannada & Karan Aujla Songs:")
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
