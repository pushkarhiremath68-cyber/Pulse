import os
import urllib.request
import zipfile

def setup_portable_node():
    dest_dir = r"C:\Users\pushk\AppData\Local\Programs\NodeJS"
    node_exe = os.path.join(dest_dir, "node.exe")
    if os.path.exists(node_exe):
        print(f"Node already present at: {node_exe}")
        return dest_dir

    os.makedirs(dest_dir, exist_ok=True)
    # Download Node.js LTS 20.x win-x64 zip
    url = "https://nodejs.org/dist/v20.18.1/node-v20.18.1-win-x64.zip"
    zip_path = os.path.join(dest_dir, "node.zip")
    
    print(f"Downloading Node.js LTS from {url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as out_f:
        out_f.write(resp.read())

    print("Extracting Node.js...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        # Extract files stripping top folder
        for member in zip_ref.namelist():
            parts = member.split('/', 1)
            if len(parts) > 1 and parts[1]:
                target_path = os.path.join(dest_dir, parts[1].replace('/', '\\'))
                if member.endswith('/'):
                    os.makedirs(target_path, exist_ok=True)
                else:
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)
                    with zip_ref.open(member) as source, open(target_path, 'wb') as target:
                        target.write(source.read())

    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"[SUCCESS] Node.js installed at {dest_dir}")
    return dest_dir

if __name__ == '__main__':
    setup_portable_node()
