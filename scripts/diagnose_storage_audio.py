import os
import glob
import subprocess
import json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

files = glob.glob(os.path.join(MUSIC_DIR, '*'))
print(f"Total audio files in storage/music: {len(files)}")

# Check small or suspicious files
small_files = []
for f in files:
    sz = os.path.getsize(f)
    if sz < 200000: # less than 200KB
        small_files.append((os.path.basename(f), sz))

print(f"Suspiciously small files (<200KB): {len(small_files)}")
for name, sz in small_files[:10]:
    print(f"  {name}: {sz} bytes")

