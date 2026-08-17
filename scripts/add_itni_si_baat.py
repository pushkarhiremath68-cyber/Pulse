import urllib.request
import urllib.parse
import json
import os

SUPABASE_URL = 'https://iukyohqoftmrueeucaoo.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTg0MCwiZXhwIjoyMTAyNDY3ODQwfQ.U3KaIVmOYC__N1rwhqjZfyxQ6tjovgcMJ6bLVaIFJAs'

# 1. Download full MP4 to local storage
mp4_url = 'https://aac.saavncdn.com/633/a87d484b5000de60ed25849e0f55734b_320.mp4'
dest_path = os.path.join('storage', 'music', 'pulse-hi-itni-si-baat-hain-arijit-singh-azhar.mp4')
os.makedirs(os.path.dirname(dest_path), exist_ok=True)

if not os.path.exists(dest_path) or os.path.getsize(dest_path) < 1000000:
    print('Downloading 320kbps master MP4...')
    req = urllib.request.Request(mp4_url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
        with open(dest_path, 'wb') as f:
            f.write(data)
    print(f'Saved local MP4: {dest_path} ({os.path.getsize(dest_path)/1024/1024:.2f} MB)')
else:
    print(f'Local MP4 already exists: {dest_path} ({os.path.getsize(dest_path)/1024/1024:.2f} MB)')

# 2. Insert row into Supabase public.songs table
song_row = {
    'id': 'pulse-hi-itni-si-baat-hain-arijit-singh-azhar',
    'title': 'Itni Si Baat Hain',
    'artist': 'Arijit Singh, Antara Mitra, Pritam',
    'album': 'Azhar',
    'cover': 'https://c.saavncdn.com/633/Azhar-1-Hindi-2016-500x500.jpg',
    'duration': '4:55',
    'year': 2016,
    'language': 'Hindi',
    'category': 'bollywood',
    'audio_url': 'https://aac.saavncdn.com/633/a87d484b5000de60ed25849e0f55734b_320.mp4',
    'storage_path': 'pulse-hi-itni-si-baat-hain-arijit-singh-azhar.mp4',
    'yt_id': 'VqZg_83C_1s',
    'source': 'Pulse Cloud CDN (320kbps MP4 Master)',
    'play_count': 150000
}

post_req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/songs',
    data=json.dumps([song_row]).encode('utf-8'),
    headers={
        'apikey': SERVICE_KEY,
        'Authorization': f'Bearer {SERVICE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    },
    method='POST'
)

try:
    with urllib.request.urlopen(post_req, timeout=10) as post_resp:
        print(f'Inserted into Supabase public.songs: HTTP {post_resp.status}')
except Exception as e:
    print('Supabase insert status/error:', e)

# 3. Query back from Supabase to verify
get_req = urllib.request.Request(
    f'{SUPABASE_URL}/rest/v1/songs?id=eq.pulse-hi-itni-si-baat-hain-arijit-singh-azhar&select=*',
    headers={'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}
)
with urllib.request.urlopen(get_req, timeout=5) as get_resp:
    row = json.loads(get_resp.read().decode('utf-8'))
    print('Verified in Supabase:', json.dumps(row, indent=2))
