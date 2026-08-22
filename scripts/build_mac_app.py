import os
import sys
import urllib.request
import zipfile
import subprocess
import shutil

ELECTRON_VERSION = "v32.0.0"
ARCHS = ["x64", "arm64"]
APP_NAME = "Pulse Music"
APP_BUNDLE_ID = "app.pulsemusic.player"
DIST_DIR = "dist"

def run_cmd(cmd):
    print(f"Running: {cmd}")
    subprocess.run(cmd, shell=True, check=True)

def download_electron(arch):
    url = f"https://github.com/electron/electron/releases/download/{ELECTRON_VERSION}/electron-{ELECTRON_VERSION}-darwin-{arch}.zip"
    dest = os.path.join(DIST_DIR, f"electron-darwin-{arch}.zip")
    if not os.path.exists(dest):
        print(f"Downloading {url}...")
        urllib.request.urlretrieve(url, dest)
    return dest

def modify_zip(source_zip, dest_zip, asar_path):
    print(f"Generating {dest_zip}...")
    with zipfile.ZipFile(source_zip, 'r') as zin:
        with zipfile.ZipFile(dest_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                # Read original content
                content = zin.read(item.filename)
                
                # Rename Electron.app to Pulse Music.app
                new_filename = item.filename.replace("Electron.app", f"{APP_NAME}.app")
                item.filename = new_filename
                
                # Update Info.plist
                if new_filename == f"{APP_NAME}.app/Contents/Info.plist":
                    text = content.decode('utf-8')
                    text = text.replace("com.github.Electron", APP_BUNDLE_ID)
                    text = text.replace("Electron", APP_NAME)
                    content = text.encode('utf-8')
                
                # Write to new zip
                zout.writestr(item, content)
            
            # Inject app.asar
            print(f"Injecting app.asar into {dest_zip}...")
            asar_info = zipfile.ZipInfo(f"{APP_NAME}.app/Contents/Resources/app.asar")
            # Set standard file permissions (-rw-r--r--)
            asar_info.external_attr = 0o100644 << 16
            with open(asar_path, 'rb') as f:
                zout.writestr(asar_info, f.read())

def main():
    if not os.path.exists(DIST_DIR):
        os.makedirs(DIST_DIR)
        
    print("Preparing temp directory for ASAR...")
    temp_dir = os.path.join(DIST_DIR, "mac_temp")
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    os.makedirs(temp_dir)
    
    # Copy essential files (same as electron-builder.json 'files' array)
    shutil.copy2("index.html", temp_dir)
    shutil.copy2("package.json", temp_dir)
    shutil.copy2("manifest.json", temp_dir)
    if os.path.exists("pulse-logo.png"):
        shutil.copy2("pulse-logo.png", temp_dir)
    shutil.copytree("src", os.path.join(temp_dir, "src"), dirs_exist_ok=True)
    shutil.copytree("public", os.path.join(temp_dir, "public"), dirs_exist_ok=True)
    shutil.copytree("electron", os.path.join(temp_dir, "electron"), dirs_exist_ok=True)
    if os.path.exists(os.path.join("storage", "music")):
        os.makedirs(os.path.join(temp_dir, "storage"), exist_ok=True)
        shutil.copytree(os.path.join("storage", "music"), os.path.join(temp_dir, "storage", "music"), dirs_exist_ok=True)
    
    # We must install production dependencies
    print("Installing production dependencies...")
    run_cmd(f"cd {temp_dir} && npm install --omit=dev")
    
    print("Packaging ASAR archive...")
    asar_path = os.path.join(DIST_DIR, "app.asar")
    run_cmd(f"npx @electron/asar pack {temp_dir} {asar_path}")
    
    for arch in ARCHS:
        source_zip = download_electron(arch)
        dest_zip = os.path.join(DIST_DIR, f"Pulse-macOS-{arch}.zip")
        modify_zip(source_zip, dest_zip, asar_path)
        print(f"Successfully generated {dest_zip}")
        
    print("macOS bundles successfully created in dist/!")

if __name__ == '__main__':
    main()
