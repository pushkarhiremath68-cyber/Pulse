import os
import urllib.request

# Test requesting Range 0-1024 from local server
file_path = os.path.join(os.getcwd(), 'storage', 'music', 'in-kesariya.m4a')
print("File exists:", os.path.exists(file_path), "Size:", os.path.getsize(file_path) if os.path.exists(file_path) else 0)

with open(file_path, 'rb') as f:
    header = f.read(32)
    print("M4A Header bytes:", header[:16])
