import urllib.request
import json
import urllib.parse

# Test JioSaavn public search endpoint
test_queries = [
    "Espresso Sabrina Carpenter",
    "Shri Hanuman Chalisa Gulshan Kumar",
    "Shiv Tandav Stotram Shankar Mahadevan",
    "Belageddu Kirik Party",
    "Naatu Naatu RRR",
    "Khalasi Aditya Gadhvi",
    "Lover Diljit Dosanjh",
]

saavn_apis = [
    "https://saavn.dev/api/search/songs?query=",
    "https://jiosaavn-api-privateindexer.vercel.app/search/songs?query=",
    "https://saavn.me/search/songs?query=",
    "https://jiosaavn-api-2-0.vercel.app/api/search/songs?query=",
]

for api in saavn_apis:
    print(f"\n--- Testing {api} ---")
    for q in test_queries[:2]:
        try:
            url = f"{api}{urllib.parse.quote(q)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=4) as resp:
                data = json.loads(resp.read().decode())
                print(f"SUCCESS {q}:", str(data)[:150])
        except Exception as e:
            print(f"FAIL {q}: {e}")
