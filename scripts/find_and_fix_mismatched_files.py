import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

with open(os.path.join(ROOT, 'server.py'), 'r', encoding='utf-8') as f:
    server_py = f.read()

# Extract TOP_SONGS
matches = re.findall(r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|None)\s*\)', server_py)
print(f"Total TOP_SONGS parsed: {len(matches)}")

# Find duplicate yt_ids
yt_counts = defaultdict(list)
for tid, title, artist, ytid in matches:
    if ytid and ytid != 'None':
        yt_counts[ytid].append((tid, title, artist))

duplicated_ids = {k: v for k, v in yt_counts.items() if len(v) > 1}
print(f"Found {len(duplicated_ids)} duplicated yt_ids affecting {sum(len(v) for v in duplicated_ids.values())} songs:")

files_to_remove = []
for ytid, songs in duplicated_ids.items():
    print(f"\nDuplicate YtId: {ytid}")
    # The first song might be original or all might be fake/dummy
    for idx, (tid, title, artist) in enumerate(songs):
        print(f"  [{idx}] {tid}: {title} - {artist}")
        for ext in ['.m4a', '.mp4', '.webm', '.mp3']:
            p = os.path.join(MUSIC_DIR, f"{tid}{ext}")
            if os.path.exists(p):
                files_to_remove.append(p)
                print(f"    -> Found file {os.path.basename(p)}")

print(f"\nTotal corrupted/mismatched files to remove: {len(files_to_remove)}")
