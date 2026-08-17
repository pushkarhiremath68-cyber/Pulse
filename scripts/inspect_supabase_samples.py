import urllib.request
import urllib.parse
import json

SUPABASE_URL = 'https://iukyohqoftmrueeucaoo.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTg0MCwiZXhwIjoyMTAyNDY3ODQwfQ.U3KaIVmOYC__N1rwhqjZfyxQ6tjovgcMJ6bLVaIFJAs'

headers = {'apikey': SERVICE_KEY, 'Authorization': f'Bearer {SERVICE_KEY}'}

req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/songs?select=*&limit=25', headers=headers)
with urllib.request.urlopen(req, timeout=5) as resp:
    songs = json.loads(resp.read().decode('utf-8'))
    print(f'Sample of {len(songs)} songs:')
    for s in songs:
        print(f"ID: {s['id']}")
        print(f"  Title: {s['title']} | Artist: {s['artist']}")
        print(f"  Audio URL: {s.get('audio_url')}")
        print(f"  Storage Path: {s.get('storage_path')}")
        print(f"  YT ID: {s.get('yt_id')}")
