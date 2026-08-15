import os
import urllib.request
import zipfile

def setup_gh():
    dest_dir = r"C:\Users\pushk\AppData\Local\Programs\gh"
    gh_exe = os.path.join(dest_dir, "bin", "gh.exe")
    if os.path.exists(gh_exe):
        print(f"GitHub CLI already present at: {gh_exe}")
        return gh_exe

    os.makedirs(dest_dir, exist_ok=True)
    url = "https://github.com/cli/cli/releases/download/v2.63.0/gh_2.63.0_windows_amd64.zip"
    zip_path = os.path.join(dest_dir, "gh.zip")
    
    print(f"Downloading GitHub CLI from {url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as out_f:
        out_f.write(resp.read())

    print("Extracting GitHub CLI...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
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

    print(f"[SUCCESS] GitHub CLI installed at {dest_dir}")
    return gh_exe

if __name__ == '__main__':
    setup_gh()
