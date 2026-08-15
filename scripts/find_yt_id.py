import urllib.request
import urllib.parse
import re

def search_yt(query):
    try:
        url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
        })
        html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8')
        matches = re.findall(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        # Deduplicate while preserving order
        seen = set()
        unique = []
        for m in matches:
            if m not in seen:
                seen.add(m)
                unique.append(m)
        return unique
    except Exception as e:
        print(f"Error: {e}")
        return []

for q in ["Tere Vaaste Falak Tak", "Kesariya Arijit", "Chaleya Jawan", "Apna Bana Le Bhediya", "Sajni Laapataa Ladies", "Satranga Animal"]:
    res = search_yt(q)
    print(f"{q} -> {res[:3] if res else 'None'}")
