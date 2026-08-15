import os
import glob
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

files = glob.glob(os.path.join(MUSIC_DIR, '*'))
print(f"Total files in storage/music: {len(files)}")

# Check file types and sizes
sizes = [os.path.getsize(f) for f in files]
print(f"Min size: {min(sizes)/1024:.1f} KB, Max size: {max(sizes)/(1024*1024):.1f} MB, Avg size: {sum(sizes)/len(sizes)/(1024*1024):.1f} MB")
