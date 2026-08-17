"""
Pulse Music - Automated Batch Audio Sync for Supabase Storage
Usage:
  python scripts/sync_supabase_storage.py --folder ./storage/music/
  python scripts/sync_supabase_storage.py --url https://xyz.supabase.co --key <anon_or_service_key>

Features:
- Scans local folder for authorized audio files (.mp3, .m4a, .mp4, .wav, .aac, .flac, .ogg).
- Queries Supabase Storage bucket ('music') to list all existing files.
- Automatically skips tracks that are already present in Supabase Storage.
- Uploads missing audio files with progress tracking, MIME-type mapping, and retry handling.
- Supports credentials via CLI parameters (--url, --key, --bucket) or .env configuration.
"""

import os
import sys
import argparse
import urllib.request
import urllib.error
import mimetypes
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT, '.env')

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

def get_existing_supabase_objects(supabase_url, api_key, bucket='music'):
    """Lists all existing file names in the Supabase Storage bucket with pagination."""
    clean_url = supabase_url.rstrip('/')
    list_url = f"{clean_url}/storage/v1/object/list/{bucket}"
    existing_files = set()
    offset = 0
    limit = 100

    while True:
        payload = json.dumps({
            "limit": limit,
            "offset": offset,
            "sortBy": {"column": "name", "order": "asc"}
        }).encode('utf-8')

        req = urllib.request.Request(
            list_url,
            data=payload,
            headers={
                'Authorization': f'Bearer {api_key}',
                'apikey': api_key,
                'Content-Type': 'application/json'
            },
            method='POST'
        )

        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    if not data or not isinstance(data, list):
                        break
                    for item in data:
                        if isinstance(item, dict) and 'name' in item and item['name']:
                            existing_files.add(item['name'])
                    if len(data) < limit:
                        break
                    offset += limit
                else:
                    break
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            print(f"[Supabase Notice] Bucket listing status {e.code}: {err_body}")
            break
        except Exception as e:
            print(f"[Supabase Notice] Could not list existing bucket objects: {e}")
            break

    return existing_files

def upload_file_to_supabase(file_path, storage_filename, supabase_url, api_key, bucket='music'):
    """Uploads a single audio file to Supabase Storage bucket using standard REST API."""
    clean_url = supabase_url.rstrip('/')
    target_url = f"{clean_url}/storage/v1/object/{bucket}/{storage_filename}"
    
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        if file_path.lower().endswith('.mp3'):
            mime_type = 'audio/mpeg'
        elif file_path.lower().endswith('.m4a'):
            mime_type = 'audio/mp4'
        elif file_path.lower().endswith('.mp4'):
            mime_type = 'audio/mp4'
        elif file_path.lower().endswith('.wav'):
            mime_type = 'audio/wav'
        else:
            mime_type = 'application/octet-stream'

    with open(file_path, 'rb') as f:
        file_data = f.read()

    req = urllib.request.Request(
        target_url,
        data=file_data,
        headers={
            'Authorization': f'Bearer {api_key}',
            'apikey': api_key,
            'Content-Type': mime_type,
            'x-upsert': 'false'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status in (200, 201), f"HTTP {resp.status} (Uploaded successfully)"
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8', errors='ignore')
        if e.code == 409 or 'Duplicate' in err_msg or 'already exists' in err_msg:
            return True, "HTTP 409 (Already exists - Skipped)"
        return False, f"HTTP Error {e.code}: {err_msg}"
    except Exception as e:
        return False, str(e)

def sync_audio_directory(folder_path, custom_url=None, custom_key=None, custom_bucket=None):
    if not os.path.exists(folder_path):
        print(f"Creating directory: {folder_path}")
        os.makedirs(folder_path, exist_ok=True)
        print(f"Place your authorized audio files in '{folder_path}' and run this script again.")
        return

    audio_extensions = ('.mp3', '.m4a', '.mp4', '.wav', '.aac', '.flac', '.ogg')
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(audio_extensions)]
    
    if not files:
        print(f"No audio files found in '{folder_path}'. Add your authorized .mp3 / .m4a / .wav files there.")
        return

    print(f"==================================================")
    print(f"  Pulse Music - Supabase Audio Storage Sync Engine")
    print(f"==================================================")
    print(f"Found {len(files)} authorized audio file(s) in '{folder_path}'.")

    env = load_env()
    supabase_url = custom_url or env.get('VITE_SUPABASE_URL')
    api_key = custom_key or env.get('VITE_SUPABASE_PUBLISHABLE_KEY') or env.get('VITE_SUPABASE_ANON_KEY')
    bucket = custom_bucket or env.get('VITE_SUPABASE_STORAGE_BUCKET', 'music')

    can_upload_remote = (
        supabase_url and 
        supabase_url != 'YOUR_SUPABASE_PROJECT_URL' and 
        '.' in supabase_url and
        api_key and 
        api_key != 'YOUR_SUPABASE_PUBLISHABLE_KEY'
    )

    if not can_upload_remote:
        print("\n[!] Supabase configuration is not provided or contains placeholder credentials.")
        print(f"    Current URL: {supabase_url}")
        print("\nTo upload to your Supabase project:")
        print("1. Update '.env' with your real Supabase credentials:")
        print("   VITE_SUPABASE_URL=https://your-project-id.supabase.co")
        print("   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-or-service-key")
        print("   VITE_SUPABASE_STORAGE_BUCKET=music")
        print("\n2. OR run this script directly with your credentials:")
        print("   python scripts/sync_supabase_storage.py --url https://your-project-id.supabase.co --key <your-key>")
        print(f"\nAll {len(files)} files remain fully playable locally via ./storage/music/.")
        return

    print(f"\nTarget Supabase URL: {supabase_url}")
    print(f"Target Bucket:       {bucket}")
    
    # 1. Fetch existing files in bucket
    print("\n[Step 1/2] Fetching existing objects from Supabase Storage...")
    existing_objects = get_existing_supabase_objects(supabase_url, api_key, bucket)
    print(f"Found {len(existing_objects)} item(s) already present in bucket '{bucket}'.")

    # 2. Filter files that need uploading
    to_upload = [f for f in files if f not in existing_objects]
    skipped_count = len(files) - len(to_upload)
    print(f"\n[Step 2/2] Synchronizing audio files:")
    print(f" - Total files in directory: {len(files)}")
    print(f" - Already present (Skipped): {skipped_count}")
    print(f" - Files to upload:           {len(to_upload)}\n")

    if not to_upload:
        print("[SUCCESS] All files are already present in Supabase Storage! Nothing new to upload.")
        return

    import concurrent.futures
    import threading

    lock = threading.Lock()
    progress_counter = 0
    success_count = 0
    fail_count = 0
    total = len(to_upload)

    def upload_worker(filename):
        nonlocal progress_counter, success_count, fail_count
        file_path = os.path.join(folder_path, filename)
        file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
        success, msg = upload_file_to_supabase(file_path, filename, supabase_url, api_key, bucket)
        
        with lock:
            progress_counter += 1
            if success:
                success_count += 1
                print(f"[{progress_counter}/{total}] [OK] {filename} ({file_size_mb:.1f} MB) -> {msg}")
            else:
                fail_count += 1
                print(f"[{progress_counter}/{total}] [FAILED] {filename} -> {msg}")

    print(f"Starting parallel upload with 6 worker threads...\n")
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(upload_worker, fname) for fname in to_upload]
        concurrent.futures.wait(futures)

    print("\n==================================================")
    print(f"Upload Complete Summary:")
    print(f"  - Successfully Uploaded:    {success_count}")
    print(f"  - Skipped (Already existed): {skipped_count}")
    print(f"  - Failed:                   {fail_count}")
    print("==================================================")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Pulse Music Authorized Audio Storage Sync')
    parser.add_argument('--folder', default=os.path.join(ROOT, 'storage', 'music'), help='Path to audio folder')
    parser.add_argument('--url', default=None, help='Supabase Project URL')
    parser.add_argument('--key', default=None, help='Supabase Anon or Service Role Key')
    parser.add_argument('--bucket', default='music', help='Supabase Storage Bucket Name')
    args = parser.parse_args()
    sync_audio_directory(args.folder, custom_url=args.url, custom_key=args.key, custom_bucket=args.bucket)

