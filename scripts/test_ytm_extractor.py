import urllib.request
import urllib.parse
import json
import time

def test_piped_extraction():
    print("Testing Piped Extractor Nodes...")
    test_id = "fHI8X4OXluQ" # Blinding Lights
    piped_nodes = [
        'https://api.piped.privacydev.net',
        'https://pipedapi.kavin.rocks',
        'https://piped-api.garudalinux.org',
        'https://pipedapi.tokhmi.xyz'
    ]
    
    success = False
    for node in piped_nodes:
        try:
            url = f"{node}/streams/{test_id}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                audio_streams = data.get('audioStreams', [])
                if audio_streams:
                    best = audio_streams[0]
                    print(f"SUCCESS on node {node}: Found {len(audio_streams)} pure audio streams. Codec: {best.get('codec')}, Bitrate: {best.get('bitrate')}")
                    success = True
                    break
        except Exception as e:
            print(f"Node {node} notice: {e}")

    return success

def test_piped_search():
    print("\nTesting Piped Music Search...")
    query = "Starboy The Weeknd"
    piped_nodes = [
        'https://api.piped.privacydev.net',
        'https://pipedapi.kavin.rocks',
        'https://pipedapi.tokhmi.xyz'
    ]
    
    success = False
    for node in piped_nodes:
        try:
            url = f"{node}/search?q={urllib.parse.quote(query)}&filter=music_songs"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                items = data.get('items', [])
                if items:
                    print(f"SUCCESS on node {node}: Found {len(items)} songs. First: {items[0].get('title')} by {items[0].get('uploaderName')}")
                    success = True
                    break
        except Exception as e:
            print(f"Search on {node} notice: {e}")

    return success

if __name__ == '__main__':
    t1 = test_piped_extraction()
    t2 = test_piped_search()
    print(f"\nAll Extractor Tests Passed: {t1 and t2}")
