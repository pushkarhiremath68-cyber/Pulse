import os
import urllib.request
import zipfile

def setup_portable_git():
    dest_dir = r"C:\Users\pushk\AppData\Local\Programs\PortableGit"
    git_exe = os.path.join(dest_dir, "cmd", "git.exe")
    if os.path.exists(git_exe):
        print(f"Portable Git already present at: {git_exe}")
        return git_exe

    os.makedirs(dest_dir, exist_ok=True)
    # MinGit 64-bit download URL from GitHub Releases
    url = "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/MinGit-2.47.1-64-bit.zip"
    zip_path = os.path.join(dest_dir, "mingit.zip")
    
    print(f"Downloading MinGit from {url}...")
    headers = {'User-Agent': 'Mozilla/5.0'}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(zip_path, 'wb') as out_f:
        out_f.write(resp.read())

    print("Extracting MinGit...")
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(dest_dir)

    if os.path.exists(zip_path):
        os.remove(zip_path)

    print(f"[SUCCESS] Portable Git installed at {dest_dir}")
    return git_exe

if __name__ == '__main__':
    setup_portable_git()
