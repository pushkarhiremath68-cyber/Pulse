import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

def test_jiosaavn(query):
    # JioSaavn public API endpoint for songs
    url = f"https://saavn.dev/api/search/songs?query={requests.utils.quote(query)}&limit=1"
    try:
        r = requests.get(url, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            results = data.get('data', {}).get('results', [])
            if results:
                images = results[0].get('image', [])
                # Get highest quality image (500x500)
                img = images[-1].get('url') if images else None
                print(f"[SAAVN FOUND] {query} -> {results[0].get('name')} : {img}")
                return img
    except Exception as e:
        pass
    print(f"[SAAVN NOT FOUND] {query}")

test_jiosaavn("Shayad Arijit Singh")
test_jiosaavn("Kabira Pritam")
test_jiosaavn("Maan Meri Jaan King")
test_jiosaavn("Jo Tum Mere Ho Anuv Jain")
test_jiosaavn("Singara Siriye Kantara")
test_jiosaavn("Adiga Adiga Nani")
test_jiosaavn("52 Gaj Ka Daman Renuka")
test_jiosaavn("Softly Karan Aujla")
test_jiosaavn("Excuses AP Dhillon")
test_jiosaavn("Lover Diljit Dosanjh")
test_jiosaavn("Save Your Tears The Weeknd")
test_jiosaavn("Cruel Summer Taylor Swift")
