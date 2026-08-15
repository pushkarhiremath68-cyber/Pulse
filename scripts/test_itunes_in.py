import json
import urllib.request
import urllib.parse

def test_query(term, country='IN'):
    url = f"https://itunes.apple.com/search?term={urllib.parse.quote(term)}&country={country}&entity=song&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        results = data.get('results', [])
        if results:
            art = results[0].get('artworkUrl100', '').replace('100x100bb', '600x600bb')
            print(f"[FOUND] {term} ({country}): {results[0].get('trackName')} - {results[0].get('collectionName')} -> {art}")
        else:
            print(f"[NOT FOUND] {term} ({country})")

test_query("Shayad Arijit Singh", "IN")
test_query("Kabira Pritam", "IN")
test_query("Maan Meri Jaan King", "IN")
test_query("Jo Tum Mere Ho Anuv Jain", "IN")
test_query("Singara Siriye", "IN")
test_query("Adiga Adiga", "IN")
test_query("52 Gaj Ka Daman", "IN")
test_query("Softly Karan Aujla", "IN")
test_query("Excuses AP Dhillon", "IN")
