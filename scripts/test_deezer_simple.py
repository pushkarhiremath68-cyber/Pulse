import requests

for q in ["shayad", "kabira", "kesariya", "excuses", "softly", "kantara"]:
    url = f"https://api.deezer.com/search?q={q}&limit=1"
    r = requests.get(url)
    data = r.json()
    if data.get('data'):
        t = data['data'][0]
        print(f"[DEEZER] {q} -> {t.get('title')} ({t.get('artist',{}).get('name')}) -> {t.get('album',{}).get('cover_xl')}")
    else:
        print(f"[DEEZER NOT FOUND] {q}")
