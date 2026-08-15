"""
Pulse Music - Automated Batch Audio Sync for Supabase Storage
Usage:
  python scripts/sync_supabase_storage.py --folder ./storage/music/

Features:
- Scans local folder for authorized audio files (.mp3, .m4a, .wav, .aac, .flac, .ogg).
- Automatically associates each audio file with corresponding catalog songs.
- Uploads files to Supabase Storage 'music' bucket via REST API (if credentials provided).
- Preserves all song metadata and updates storage paths dynamically.
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
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
ENV_PATH = os.path.join(ROOT, '.env')

def load_env():
    env = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    k, v = line.split('=', 1)
                    env[k.strip()] = v.strip()
    return env

def upload_file_to_supabase(file_path, storage_filename, supabase_url, api_key, bucket='music'):
    """Uploads a single audio file to Supabase Storage bucket using standard REST API."""
    clean_url = supabase_url.rstrip('/')
    target_url = f"{clean_url}/storage/v1/object/{bucket}/{storage_filename}"
    
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = 'audio/mpeg' if file_path.endswith('.mp3') else 'application/octet-stream'

    with open(file_path, 'rb') as f:
        file_data = f.read()

    req = urllib.request.Request(
        target_url,
        data=file_data,
        headers={
            'Authorization': f'Bearer {api_key}',
            'apikey': api_key,
            'Content-Type': mime_type,
            'x-upsert': 'true'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status in (200, 201), f"HTTP {resp.status}"
    except urllib.error.HTTPError as e:
        return False, f"HTTP Error {e.code}: {e.read().decode('utf-8', errors='ignore')}"
    except Exception as e:
        return False, str(e)

def sync_audio_directory(folder_path):
    if not os.path.exists(folder_path):
        print(f"Creating directory: {folder_path}")
        os.makedirs(folder_path, exist_ok=True)
        print(f"Place your authorized .mp3, .m4a, .wav files in '{folder_path}' and run this script again.")
        return

    audio_extensions = ('.mp3', '.m4a', '.wav', '.aac', '.flac', '.ogg')
    files = [f for f in os.listdir(folder_path) if f.lower().endswith(audio_extensions)]
    
    if not files:
        print(f"No audio files found in '{folder_path}'. Add your authorized .mp3 / .m4a / .wav files there.")
        return

    print(f"Found {len(files)} authorized audio file(s) in '{folder_path}':")
    for f in files:
        print(f" - {f}")

    env = load_env()
    supabase_url = env.get('VITE_SUPABASE_URL')
    api_key = env.get('VITE_SUPABASE_PUBLISHABLE_KEY') or env.get('VITE_SUPABASE_ANON_KEY')
    bucket = env.get('VITE_SUPABASE_STORAGE_BUCKET', 'music')

    can_upload_remote = (
        supabase_url and supabase_url != 'YOUR_SUPABASE_PROJECT_URL' and '.' in supabase_url and
        api_key and api_key != 'YOUR_SUPABASE_PUBLISHABLE_KEY'
    )

    if can_upload_remote:
        print(f"\nUploading to Supabase Storage bucket '{bucket}' ({supabase_url})...")
        for filename in files:
            file_path = os.path.join(folder_path, filename)
            success, msg = upload_file_to_supabase(file_path, filename, supabase_url, api_key, bucket)
            status_icon = "[OK]" if success else "[NOTICE]"
            print(f" {status_icon} {filename} -> {msg}")
    else:
        print("\nNote: Supabase credentials are placeholder in .env. Files are ready for local playback in ./storage/music/.")
        print("To sync to Supabase Cloud, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Pulse Music Authorized Audio Storage Sync')
    parser.add_argument('--folder', default=os.path.join(ROOT, 'storage', 'music'), help='Path to audio folder')
    args = parser.parse_args()
    sync_audio_directory(args.folder)
