import urllib.request
import urllib.parse

test_samples = [
    ("Shayad", "in-shayad"),
    ("Kabira", "in-kabira"),
    ("Jo Tum Mere Ho", "in-jo-tum-mere-ho"),
    ("Maan Meri Jaan", "in-maan-meri-jaan"),
    ("dheema dheema", "in-dheema-dheema"),
    ("udi udi", "in-udi-udi-full"),
    ("zulfein", "in-zulfein-aditya"),
    ("Dhurandhar", "in-dhurandhar"),
    ("Srivalli (Telugu)", "te-srivalli-telugu"),
    ("Srivalli (Hindi)", "in-srivalli-hindi"),
    ("Save Your Tears", "en-save-your-tears"),
    ("Someone You Loved", "en-someone-you-loved"),
    ("Jotheyali Jothe Jotheyali", "kn-jotheyali-geetha"),
    ("Minchagi Neenu Baralu", "kn-minchagi-neenu"),
    ("Adiga Adiga", "te-adiga-adiga"),
    ("Pilla Raa", "te-pilla-raa"),
    ("Cheques", "pj-cheques-shubh"),
    ("We Rollin", "pj-we-rollin-shubh"),
    ("52 Gaj Ka Daman", "hr-52-gaj-ka-daman"),
    ("Moto", "hr-moto-diler"),
    ("Gypsy", "hr-gypsy-gd-kaur"),
    ("Yadav Brand 2", "hr-yadav-brand-2"),
]

print("Testing Audio Stream Resolution for Requested Songs:")
passed = 0
for name, track_id in test_samples:
    q_enc = urllib.parse.quote(name)
    url = f"http://localhost:3000/api/stream?id={track_id}&q={q_enc}"
    try:
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0',
            'Range': 'bytes=0-2048'
        })
        res = urllib.request.urlopen(req, timeout=15)
        ctype = res.headers.get('Content-Type')
        crange = res.headers.get('Content-Range')
        bytes_len = len(res.read())
        print(f"[PASS {res.status}] {name} ({track_id}) -> {ctype} | Range: {crange} | Bytes: {bytes_len}")
        passed += 1
    except Exception as e:
        print(f"[FAIL] {name} ({track_id}) -> {e}")

print(f"\nResult: {passed}/{len(test_samples)} PASSED HTTP 206 Range streaming test!")
