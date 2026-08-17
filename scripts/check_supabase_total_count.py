import urllib.request
import json

SUPABASE_URL = 'https://iukyohqoftmrueeucaoo.supabase.co'
SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTg0MCwiZXhwIjoyMTAyNDY3ODQwfQ.U3KaIVmOYC__N1rwhqjZfyxQ6tjovgcMJ6bLVaIFJAs'

headers = {
    'apikey': SERVICE_KEY,
    'Authorization': f'Bearer {SERVICE_KEY}',
    'Range-Unit': 'items',
    'Range': '0-0',
    'Prefer': 'count=exact'
}

req = urllib.request.Request(f'{SUPABASE_URL}/rest/v1/songs?select=id', headers=headers)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        content_range = resp.headers.get('Content-Range')
        print(f"Content-Range Header: {content_range}")
except Exception as e:
    print(f"Error checking count: {e}")
