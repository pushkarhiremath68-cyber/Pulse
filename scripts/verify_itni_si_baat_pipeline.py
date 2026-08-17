import urllib.request
import urllib.parse
import json

print('=== 1. Testing Web App Status ===')
with urllib.request.urlopen('http://localhost:3000/index.html') as resp:
    print('App Status:', resp.status)

print('\n=== 2. Testing Search for "itni si baat hai" ===')
SUPABASE_URL = 'https://iukyohqoftmrueeucaoo.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTE4NDAsImV4cCI6MjEwMjQ2Nzg0MH0.pc1Ew3rI47KAx7Zj103J2CcQ5G-jOKgenlUhsnVq_wI'

headers = {'apikey': ANON_KEY, 'Authorization': f'Bearer {ANON_KEY}'}
q = urllib.parse.quote('*itni*')
url = f'{SUPABASE_URL}/rest/v1/songs?or=(title.ilike.{q},artist.ilike.{q})&select=*'
with urllib.request.urlopen(urllib.request.Request(url, headers=headers)) as resp:
    results = json.loads(resp.read().decode('utf-8'))
    print(f'Search returned {len(results)} songs:')
    for s in results:
        print(f" - {s['title']} by {s['artist']}")
        print(f"   Storage: {s['storage_path']}")
        print(f"   Audio URL: {s['audio_url']}")

print('\n=== 3. Testing Local MP4 Audio Server Streaming (Range Bytes 0-1024) ===')
range_req = urllib.request.Request('http://localhost:3000/storage/music/pulse-hi-itni-si-baat-hain-arijit-singh-azhar.mp4', headers={'Range': 'bytes=0-1024'})
with urllib.request.urlopen(range_req) as resp:
    print('Range Status:', resp.status)
    print('Content-Type:', resp.headers.get('Content-Type'))
    print('Content-Range:', resp.headers.get('Content-Range'))
    print('Bytes received:', len(resp.read()))

print('\n=== 4. Testing Lyrics API for "Itni Si Baat Hain" ===')
lyrics_url = 'https://lrclib.net/api/search?q=' + urllib.parse.quote('Itni Si Baat Hain Arijit Singh')
lyrics_req = urllib.request.Request(lyrics_url, headers={'User-Agent': 'PulseMusic/2.0'})
try:
    with urllib.request.urlopen(lyrics_req, timeout=5) as resp:
        lr = json.loads(resp.read().decode('utf-8'))
        print(f'Found {len(lr)} lyrics entries on LRCLIB:')
        if lr:
            print(' Sample TrackName:', lr[0].get('trackName'))
            print(' Has synced lyrics:', bool(lr[0].get('syncedLyrics')))
except Exception as e:
    print('Lyrics error:', e)
