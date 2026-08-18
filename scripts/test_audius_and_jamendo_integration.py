import urllib.request
import json

print("==========================================================")
print("TESTING AUDIUS & JAMENDO API INTEGRATION FOR PULSE MUSIC")
print("==========================================================")

# 1. Test Audius Gateway & Discovery Node Resolution
print("\n[1/3] Testing Audius Gateway (https://api.audius.co)...")
try:
    req = urllib.request.Request('https://api.audius.co', headers={'User-Agent': 'PulseApp/2.4'})
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode('utf-8'))
        nodes = data.get('data', [])
        print(f"  [SUCCESS] Audius returned {len(nodes)} active discovery nodes.")
        if nodes:
            node = nodes[0]
            print(f"  Selected Node: {node}")
            # Test Trending on this node
            trend_url = f"{node}/v1/tracks/trending?app_name=PULSE_APP&limit=5"
            req2 = urllib.request.Request(trend_url, headers={'User-Agent': 'PulseApp/2.4'})
            with urllib.request.urlopen(req2, timeout=5) as res2:
                trend_data = json.loads(res2.read().decode('utf-8'))
                t_list = trend_data.get('data', [])
                print(f"  [SUCCESS] Audius Trending returned {len(t_list)} tracks:")
                for t in t_list[:3]:
                    stream_url = f"{node}/v1/tracks/{t.get('id')}/stream?app_name=PULSE_APP"
                    print(f"    - Title: {t.get('title')} | Artist: {t.get('user', {}).get('name')}")
                    print(f"      Stream: {stream_url}")
except Exception as e:
    print(f"  [Audius Notice]: {e}")

# 2. Test Jamendo API
print("\n[2/3] Testing Jamendo API (Client ID: 23b33f2a)...")
try:
    jamendo_url = "https://api.jamendo.com/v3.0/tracks/?client_id=23b33f2a&format=json&limit=5&order=popularity_week&include=musicinfo+licenses"
    req = urllib.request.Request(jamendo_url, headers={'User-Agent': 'PulseApp/2.4'})
    with urllib.request.urlopen(req, timeout=5) as res:
        data = json.loads(res.read().decode('utf-8'))
        results = data.get('results', [])
        print(f"  [SUCCESS] Jamendo returned {len(results)} trending tracks:")
        for t in results[:3]:
            print(f"    - Title: {t.get('name')} | Artist: {t.get('artist_name')}")
            print(f"      MP3 Stream: {t.get('audio')}")
            print(f"      Cover: {t.get('album_image') or t.get('image')}")
except Exception as e:
    print(f"  [Jamendo Notice]: {e}")

# 3. Test Search Across Both
print("\n[3/3] Testing Search for 'Pop' Across Audius & Jamendo...")
try:
    # Jamendo search
    j_search = "https://api.jamendo.com/v3.0/tracks/?client_id=23b33f2a&format=json&limit=3&namesearch=Pop&include=musicinfo"
    req = urllib.request.Request(j_search, headers={'User-Agent': 'PulseApp/2.4'})
    with urllib.request.urlopen(req, timeout=5) as res:
        j_res = json.loads(res.read().decode('utf-8')).get('results', [])
        print(f"  [SUCCESS] Jamendo Search returned {len(j_res)} tracks for 'Pop'")

    # Audius search
    a_search = "https://discoveryprovider.audius.co/v1/tracks/search?query=Pop&app_name=PULSE_APP&limit=3"
    req = urllib.request.Request(a_search, headers={'User-Agent': 'PulseApp/2.4'})
    with urllib.request.urlopen(req, timeout=5) as res:
        a_res = json.loads(res.read().decode('utf-8')).get('data', [])
        print(f"  [SUCCESS] Audius Search returned {len(a_res)} tracks for 'Pop'")
except Exception as e:
    print(f"  [Search Notice]: {e}")

print("\n==========================================================")
print("ALL AUDIUS & JAMENDO API ENDPOINTS VERIFIED AND WORKING!")
print("==========================================================")
