import os
import glob

MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music')
files = glob.glob(os.path.join(MUSIC_DIR, '*'))

preview_files = []
full_files = []

for f in files:
    sz = os.path.getsize(f)
    if sz < 1500000: # < 1.5MB is likely a 30s preview
        preview_files.append((os.path.basename(f), sz))
    else:
        full_files.append((os.path.basename(f), sz))

print(f"Total files in storage/music: {len(files)}")
print(f"Full-length files (>1.5MB): {len(full_files)}")
print(f"Preview 30s files (<1.5MB): {len(preview_files)}")
print("\nSample 30s files:")
for name, sz in preview_files[:15]:
    print(f"  {name}: {sz/1024:.1f} KB")
