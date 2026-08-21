import os
import subprocess
import shutil
import hashlib
import json
import sys

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANDROID_DIR = os.path.join(PROJECT_ROOT, 'android')
RELEASE_APK = os.path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk')

print("[Pulse Build] Starting Android Release APK Build...")

# 1. Sync Capacitor
print("[Pulse Build] Syncing Capacitor...")
subprocess.run(['npx', 'cap', 'sync', 'android'], cwd=PROJECT_ROOT, shell=True, check=True)

# 2. Run Gradle assembleRelease
print("[Pulse Build] Running Gradle assembleRelease...")
gradlew = os.path.join(ANDROID_DIR, 'gradlew.bat' if sys.platform == 'win32' else 'gradlew')
subprocess.run([gradlew, 'assembleRelease'], cwd=ANDROID_DIR, shell=True, check=True)

if not os.path.exists(RELEASE_APK):
    print(f"[Pulse Build] Error: Expected APK not found at {RELEASE_APK}", file=sys.stderr)
    sys.exit(1)

size = os.path.getsize(RELEASE_APK)
with open(RELEASE_APK, 'rb') as f:
    sha256 = hashlib.sha256(f.read()).hexdigest()

print(f"[Pulse Build] APK generated: {size} bytes ({size/1048576:.2f} MB), SHA256: {sha256}")

# 3. Deploy to targets
targets = [
    os.path.join(PROJECT_ROOT, 'downloads', 'Pulse-Android.apk'),
    os.path.join(PROJECT_ROOT, 'downloads', 'Pulse-Music-2.4.0.apk'),
    os.path.join(PROJECT_ROOT, 'downloads', 'Pulse-Music-v2.4.0.apk'),
    os.path.join(PROJECT_ROOT, 'docs', 'downloads', 'Pulse-Android.apk'),
    os.path.join(PROJECT_ROOT, 'docs', 'downloads', 'Pulse-Music-2.4.0.apk'),
    os.path.join(PROJECT_ROOT, 'docs', 'downloads', 'Pulse-Music-v2.4.0.apk'),
    os.path.join(PROJECT_ROOT, 'docs', 'Pulse-Android.apk'),
    os.path.join(PROJECT_ROOT, 'dist', 'Pulse-Android.apk')
]

for t in targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copy2(RELEASE_APK, t)
    print(f"[Pulse Build] Deployed -> {t}")

for mf_path in [os.path.join(PROJECT_ROOT, 'downloads', 'manifest.json'), os.path.join(PROJECT_ROOT, 'docs', 'downloads', 'manifest.json')]:
    if os.path.exists(mf_path):
        with open(mf_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if 'platforms' in data and 'android' in data['platforms']:
            data['platforms']['android']['size'] = size
            data['platforms']['android']['sizeFormatted'] = f'{size/1048576:.1f} MB'
            data['platforms']['android']['sha256'] = sha256
            data['platforms']['android']['verified'] = True
            data['platforms']['android']['filename'] = 'Pulse-Android.apk'
        with open(mf_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

print("[Pulse Build] Release APK build and deployment complete!")
