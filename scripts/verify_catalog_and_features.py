import urllib.request
import urllib.parse
import json

SUPABASE_URL = 'https://iukyohqoftmrueeucaoo.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTE4NDAsImV4cCI6MjEwMjQ2Nzg0MH0.pc1Ew3rI47KAx7Zj103J2CcQ5G-jOKgenlUhsnVq_wI'

headers = {
    'apikey': ANON_KEY,
    'Authorization': f'Bearer {ANON_KEY}',
    'Content-Type': 'application/json'
}

print('=== 1. Total Count Verification ===')
req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/songs?select=id',
    headers={**headers, 'Range-Unit': 'items', 'Range': '0-0', 'Prefer': 'count=exact'}
)
with urllib.request.urlopen(req, timeout=5) as resp:
    cr = resp.headers.get('Content-Range', '')
    print('Total catalog count:', cr.split('/')[-1] if '/' in cr else 'unknown')

print('\n=== 2. Sample from Languages ===')
langs = ['Hindi', 'Punjabi', 'Kannada', 'Telugu', 'Tamil', 'Malayalam', 'English', 'Devotional', 'Spanish']
for lang in langs:
    req = urllib.request.Request(
        f'{SUPABASE_URL}/rest/v1/songs?language=eq.{urllib.parse.quote(lang)}&limit=1',
        headers=headers
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        songs = json.loads(resp.read().decode('utf-8'))
        if songs:
            s = songs[0]
            print(f"{lang:12}: {s['title']} by {s['artist']} [Path: {s.get('storage_path')}]")

print('\n=== 3. Search Query Test ===')
search_q = '*Arijit*'
req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/songs?or=(title.ilike.{urllib.parse.quote(search_q)},artist.ilike.{urllib.parse.quote(search_q)})&limit=2',
    headers=headers
)
with urllib.request.urlopen(req, timeout=5) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print(f'Search found {len(res)} results:')
    for r in res:
        print(f" - {r['title']} by {r['artist']}")
