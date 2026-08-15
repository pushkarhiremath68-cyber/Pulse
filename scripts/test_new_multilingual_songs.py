import urllib.request
import urllib.parse

multilingual_sample = [
    ("Naatu Naatu (Telugu)", "te-naatu-naatu", "OsU0CGZoV8E"),
    ("Khalasi (Gujarati)", "gu-khalasi", "q10_gJg3wYQ"),
    ("Zingaat (Marathi)", "mr-zingaat", "8g76Z8Y8j8Y"),
    ("Despacito (Spanish)", "es-despacito", "kJQP7kiw5Fk"),
    ("Dernière Danse (French)", "fr-derniere-danse", "K5KAc5CoCuk"),
    ("Birds of a Feather (English)", "en-birds-of-a-feather", "d5gf9dXbPi0"),
    ("Jhoome Jo Pathaan (Hindi)", "in-jhoome-jo-pathaan", "YxWlaYCA8MU"),
]

print("Testing Audio Stream Resolution for Newly Added Multilingual Songs:")
for name, track_id, ytid in multilingual_sample:
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
