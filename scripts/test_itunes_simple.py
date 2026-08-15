import requests

headers = {
    'User-Agent': 'Mozilla/5.0'
}

queries = ["Shayad", "Kabira", "Maan Meri Jaan", "Jo Tum Mere Ho", "Kantara Singara Siriye", "52 Gaj Ka Daman", "Karan Aujla Softly", "Excuses AP Dhillon", "Kesariya", "Dhurandhar", "zulfein", "dheema dheema"]

for q in queries:
    url = f"https://itunes.apple.com/search?term={requests.utils.quote(q)}&limit=3"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            res = data.get('results', [])
            if res:
                top = res[0]
                art = top.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                print(f"[FOUND] '{q}' -> '{top.get('trackName')}' by '{top.get('artistName')}' -> {art}")
            else:
                print(f"[EMPTY] '{q}'")
        else:
            print(f"[STATUS {r.status_code}] '{q}'")
    except Exception as e:
        print(f"[ERROR] '{q}': {e}")
