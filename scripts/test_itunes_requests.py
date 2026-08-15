import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def test_query(term, country='IN'):
    url = f"https://itunes.apple.com/search?term={requests.utils.quote(term)}&country={country}&entity=song&limit=1"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            results = data.get('results', [])
            if results:
                art = results[0].get('artworkUrl100', '').replace('100x100bb', '600x600bb')
                print(f"[FOUND] {term}: {results[0].get('trackName')} ({results[0].get('collectionName')}) -> {art}")
                return
        print(f"[NOT FOUND] {term}")
    except Exception as e:
        print(f"[ERROR] {term}: {e}")

test_query("Shayad Arijit Singh", "IN")
test_query("Kabira Pritam", "IN")
test_query("Maan Meri Jaan King", "IN")
test_query("Jo Tum Mere Ho Anuv Jain", "IN")
test_query("Singara Siriye", "IN")
test_query("Adiga Adiga", "IN")
test_query("52 Gaj Ka Daman", "IN")
test_query("Softly Karan Aujla", "IN")
test_query("Excuses AP Dhillon", "IN")
