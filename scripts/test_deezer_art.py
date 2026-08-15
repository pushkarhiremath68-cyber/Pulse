import requests

queries = ["Shayad Arijit Singh", "Kabira Pritam", "Maan Meri Jaan King", "Jo Tum Mere Ho Anuv Jain", "Singara Siriye Kantara", "52 Gaj Ka Daman", "Softly Karan Aujla", "Excuses AP Dhillon", "Kesariya", "Dhurandhar", "zulfein", "dheema dheema"]

for q in queries:
    url = f"https://api.deezer.com/search?q={requests.utils.quote(q)}&limit=1"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            data = r.json()
            res = data.get('data', [])
            if res:
                top = res[0]
                art = top.get('album', {}).get('cover_xl') or top.get('album', {}).get('cover_big') or top.get('album', {}).get('cover_medium')
                print(f"[DEEZER FOUND] '{q}' -> '{top.get('title')}' by '{top.get('artist', {}).get('name')}' -> {art}")
            else:
                print(f"[DEEZER EMPTY] '{q}'")
        else:
            print(f"[STATUS {r.status_code}] '{q}'")
    except Exception as e:
        print(f"[ERROR] '{q}': {e}")
