"""
Pulse Music - Supabase Storage Catalog Generator
Designed for automated, scalable full-length audio file catalog management.
Supports MP3, M4A, WAV, AAC, FLAC, and OGG formats in Supabase 'music' bucket.
"""

import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')

START_MARKER = 'const DEMO_CATALOG = '
END_MARKER = '].map(normalizeTrack);'

def load_catalog():
    with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_pos = content.find(START_MARKER)
    if start_pos == -1:
        raise ValueError("Could not find start of DEMO_CATALOG in musicService.js")
    
    start_json = start_pos + len(START_MARKER)
    end_pos = content.find(END_MARKER, start_json)
    if end_pos == -1:
        raise ValueError("Could not find end of DEMO_CATALOG in musicService.js")
    
    # Include the closing bracket ']'
    catalog_json_str = content[start_json:end_pos + 1]
    catalog = json.loads(catalog_json_str)
    return catalog, content, start_json, end_pos + 1

def save_catalog(catalog, full_content, start_json, end_json):
    formatted = json.dumps(catalog, indent=2)
    new_content = full_content[:start_json] + formatted + full_content[end_json:]
    with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Successfully saved {len(catalog)} tracks to {MUSIC_SERVICE_PATH}")

def add_or_update_track(track_data):
    """
    Add or update a track in the catalog.
    Required fields: title, artist
    Optional fields: id, album, cover, duration, category, storagePath, format, year, language
    """
    catalog, content, start_json, end_json = load_catalog()
    
    track_id = track_data.get('id')
    if not track_id:
        clean_title = re.sub(r'[^a-z0-9]+', '-', track_data['title'].lower()).strip('-')
        track_id = f"track-{clean_title}"
    
    audio_format = track_data.get('format', 'mp3').lstrip('.')
    storage_path = track_data.get('storagePath', f"{track_id}.{audio_format}")
    
    track_entry = {
        "id": track_id,
        "title": track_data.get('title', 'Unknown Title'),
        "artist": track_data.get('artist', 'Unknown Artist'),
        "album": track_data.get('album', 'Single'),
        "cover": track_data.get('cover', './pulse-logo.png'),
        "duration": track_data.get('duration', '3:30'),
        "category": track_data.get('category', 'popular-hindi'),
        "storagePath": storage_path,
        "language": track_data.get('language', 'Hindi'),
        "year": track_data.get('year', 2024),
        "source": "Pulse Supabase Storage"
    }

    # Check if track already exists
    existing_idx = next((i for i, t in enumerate(catalog) if t['id'] == track_id), -1)
    if existing_idx >= 0:
        catalog[existing_idx].update(track_entry)
        print(f"Updated existing track: {track_id}")
    else:
        catalog.append(track_entry)
        print(f"Added new track: {track_id} -> {storage_path}")

    save_catalog(catalog, content, start_json, end_json)

if __name__ == '__main__':
    catalog, content, start_json, end_json = load_catalog()
    print(f"Loaded existing catalog with {len(catalog)} tracks.")
    # Ensure every single track has a valid storagePath
    updated = 0
    for track in catalog:
        if 'storagePath' not in track or not track['storagePath']:
            track['storagePath'] = f"{track['id']}.mp3"
            updated += 1
        # Remove any legacy previewUrls or hardcoded itunes URLs
        track.pop('previewUrl', None)
        track.pop('audioUrl', None)
        track['source'] = 'Pulse Supabase Storage'

    save_catalog(catalog, content, start_json, end_json)
    print(f"Standardized storage paths for all {len(catalog)} catalog tracks.")
