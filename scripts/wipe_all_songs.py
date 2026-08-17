import urllib.request
import urllib.parse
import json
import time

SUPABASE_URL = "https://fswnnnmicaakeuhwyyai.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd25ubm1pY2Fha2V1aHd5eWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc3NzQsImV4cCI6MjEwMjU2Mzc3NH0.lptcHWEtEv-dEOLK_y7AfwHTbedCg1DCIKviOiuO7KQ"

def wipe_all():
    print("Wiping all songs from Supabase public.songs table...")
    # Delete where created_at is not null
    url = f"{SUPABASE_URL}/rest/v1/songs?id=not.is.null"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Prefer": "count=exact"
    }
    
    # Try deleting in loop until count is 0
    while True:
        try:
            req = urllib.request.Request(f"{SUPABASE_URL}/rest/v1/songs?select=id&limit=1000", headers=headers)
            with urllib.request.urlopen(req) as res:
                songs = json.loads(res.read().decode('utf-8'))
                if not songs:
                    print("✅ 0 songs remaining in Supabase database!")
                    break
                ids = [s["id"] for s in songs]
                id_filter = f"in.({','.join(ids)})"
                del_url = f"{SUPABASE_URL}/rest/v1/songs?id={urllib.parse.quote(id_filter)}"
                del_req = urllib.request.Request(del_url, headers=headers, method="DELETE")
                with urllib.request.urlopen(del_req) as del_res:
                    print(f"Deleted batch of {len(ids)} songs...")
        except Exception as e:
            print("Delete exception:", e)
            break

if __name__ == "__main__":
    wipe_all()
