import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

with open(os.path.join(ROOT, 'server.py'), 'r', encoding='utf-8') as f:
    server_py = f.read()

matches = re.findall(r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|None)\s*\)', server_py)

yt_counts = defaultdict(list)
for tid, title, artist, ytid in matches:
    if ytid and ytid != 'None':
        yt_counts[ytid].append((tid, title, artist))

duplicated_ids = {k: v for k, v in yt_counts.items() if len(v) > 1}

deleted_count = 0
for ytid, songs in duplicated_ids.items():
    for tid, title, artist in songs:
        for ext in ['.m4a', '.mp4', '.webm', '.mp3', '.ogg', '.wav']:
            p = os.path.join(MUSIC_DIR, f"{tid}{ext}")
            if os.path.exists(p):
                try:
                    os.remove(p)
                    deleted_count += 1
                    print(f"Removed corrupt file: {os.path.basename(p)}")
                except Exception as e:
                    print(f"Error removing {p}: {e}")

print(f"Successfully deleted {deleted_count} corrupt audio files.")
