"""
Pulse Music - Supabase Database Songs Table Batch Loader
Usage:
  python scripts/setup_supabase_songs_table.py

Features:
- Validates Supabase PostgreSQL 'songs' table via REST API.
- Automatically batch-inserts 20,000+ catalog tracks into Supabase with 'upsert/merge' resolution.
- Formats records with title, artist, album, language, category, duration, year, cover, and streaming URLs.
"""

import os
import json
import urllib.request
import urllib.error
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CATALOG_PATH = os.path.join(ROOT, 'catalog_20k.json')
ENV_PATH = os.path.join(ROOT, '.env')

SQL_CREATION_SCRIPT = """
-- 1-Click SQL to Create 'songs' Table in Supabase Dashboard (SQL Editor)
CREATE TABLE IF NOT EXISTS public.songs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover TEXT,
    duration TEXT,
    year INTEGER,
    language TEXT,
    category TEXT,
    audio_url TEXT,
    storage_path TEXT,
    yt_id TEXT,
    source TEXT DEFAULT 'Pulse Cloud CDN',
    play_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Allow Fast Public Reads
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on songs"
ON public.songs FOR SELECT
TO anon, authenticated, service_role
USING (true);

CREATE POLICY "Allow service role full access on songs"
ON public.songs FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create Fast Indexes for Search & Filter queries
CREATE INDEX IF NOT EXISTS idx_songs_language ON public.songs(language);
CREATE INDEX IF NOT EXISTS idx_songs_category ON public.songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON public.songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_title ON public.songs(title);
"""

def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    return env

def test_songs_table(supabase_url, service_key):
    req = urllib.request.Request(
        f"{supabase_url.rstrip('/')}/rest/v1/songs?select=id&limit=1",
        headers={
            'apikey': service_key,
            'Authorization': f'Bearer {service_key}',
            'Content-Type': 'application/json'
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status == 200, "Table exists and is accessible."
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')
        return False, f"HTTP {e.code}: {body}"
    except Exception as e:
        return False, str(e)

def batch_insert_songs(supabase_url, service_key, songs, batch_size=500):
    clean_url = supabase_url.rstrip('/')
    target_url = f"{clean_url}/rest/v1/songs"
    
    total = len(songs)
    uploaded = 0
    
    print(f"\nBatch populating {total} songs to Supabase database in chunks of {batch_size}...")
    
    for i in range(0, total, batch_size):
        chunk = songs[i:i + batch_size]
        
        # Map fields to database column names (snake_case)
        db_rows = []
        for s in chunk:
            db_rows.append({
                "id": s["id"],
                "title": s["title"],
                "artist": s["artist"],
                "album": s.get("album", "Single"),
                "cover": s.get("cover", "./pulse-logo.png"),
                "duration": s.get("duration", "3:30"),
                "year": s.get("year", 2026),
                "language": s.get("language", "Hindi"),
                "category": s.get("category", "bollywood"),
                "audio_url": s.get("audioUrl", ""),
                "storage_path": s.get("storagePath", ""),
                "yt_id": s.get("ytId", ""),
                "source": s.get("source", "Pulse Cloud CDN"),
                "play_count": s.get("playCount", 0)
            })
            
        payload = json.dumps(db_rows).encode('utf-8')
        
        req = urllib.request.Request(
            target_url,
            data=payload,
            headers={
                'apikey': service_key,
                'Authorization': f'Bearer {service_key}',
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            method='POST'
        )
        
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 201):
                    uploaded += len(chunk)
                    print(f" -> [{uploaded}/{total}] songs synchronized ({(uploaded/total)*100:.1f}%)")
                else:
                    print(f" -> Batch {i // batch_size + 1} status: {resp.status}")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8', errors='ignore')
            print(f" -> [ERROR] Batch {i // batch_size + 1} failed: HTTP {e.code} - {err_msg}")
        except Exception as e:
            print(f" -> [ERROR] Batch {i // batch_size + 1} exception: {e}")
            
        time.sleep(0.1)

    print(f"\n[DONE] Finished synchronizing {uploaded} / {total} songs to Supabase database.")

def main():
    print("==================================================")
    print("  Pulse Music - Supabase 'songs' Database Setup")
    print("==================================================")
    
    env = load_env()
    supabase_url = env.get('VITE_SUPABASE_URL')
    # Use service_role key for schema/database operations
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTg0MCwiZXhwIjoyMTAyNDY3ODQwfQ.U3KaIVmOYC__N1rwhqjZfyxQ6tjovgcMJ6bLVaIFJAs"
    
    if not os.path.exists(CATALOG_PATH):
        print(f"Generating 20,000 catalog first...")
        from generate_mega_20k_catalog import generate_songs
        songs = generate_songs()
    else:
        with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
            songs = json.load(f)
            
    print(f"Loaded {len(songs)} tracks from {CATALOG_PATH}.")
    
    exists, status_msg = test_songs_table(supabase_url, service_key)
    if not exists:
        print(f"\n[!] Note: The 'public.songs' table is not yet created in Supabase.")
        print(f"    Details: {status_msg}")
        print("\n------------------------------------------------------------")
        print("To create the table in 1 click in your Supabase Dashboard:")
        print("1. Go to: https://supabase.com/dashboard/project/iukyohqoftmrueeucaoo/sql/new")
        print("2. Paste and click RUN:")
        print("------------------------------------------------------------")
        print(SQL_CREATION_SCRIPT)
        print("------------------------------------------------------------")
        print("Once created in the SQL Editor, re-run this script to populate all 20,000+ songs!")
        return
        
    print(f"[OK] {status_msg}")
    batch_insert_songs(supabase_url, service_key, songs)

if __name__ == '__main__':
    main()
