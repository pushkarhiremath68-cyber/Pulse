import os
import re
import shutil
import json
import subprocess

print("=================================================================")
print("STEP 1: SCRUBBING INDEX.HTML (REMOVING FIREBASE, SUPABASE, SPOTIFY, YOUTUBE)")
print("=================================================================")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove Firebase & Supabase CDN script tags
html = re.sub(r'<script\s+src=[\'"]https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@2[\'"]></script>\s*', '', html)
html = re.sub(r'<script\s+src=[\'"]https://www\.gstatic\.com/firebasejs/[^\'"]+[\'"]></script>\s*', '', html)
html = re.sub(r'<script\s+src=[\'"]https://www\.youtube\.com/iframe_api[\'"]></script>\s*', '', html)

# 2. Remove legacy Supabase/Firebase config inline script block
html = re.sub(r'<script>\s*window\.JAMENDO_CLIENT_ID[\s\S]*?<\/script>\s*', '', html)

# 3. Remove Spotify / YouTube containers and modals if any remain
html = re.sub(r'<div\s+id=[\'"]hidden-youtube-container[\'"][\s\S]*?</div>\s*</div>\s*</div>', '', html)
html = re.sub(r'<div\s+id=[\'"]youtube-player-iframe[\'"][^>]*></div>', '', html)
html = re.sub(r'<div\s+id=[\'"]youtube-fallback-container[\'"][^>]*></div>', '', html)

# 4. Remove Spotify-branded modal classes or rename to clean modals
html = html.replace('spotify-auth-modal', 'pulse-auth-modal')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Cleaned index.html")

print("\n=================================================================")
print("STEP 2: CLEANING PACKAGE.JSON (REMOVING FIREBASE & SUPABASE DEPENDENCIES)")
print("=================================================================")

if os.path.exists('package.json'):
    with open('package.json', 'r', encoding='utf-8') as f:
        pkg = json.load(f)
    
    deps = pkg.get('dependencies', {})
    for k in ['firebase', '@supabase/supabase-js', 'node-fetch', 'hls.js']:
        if k in deps:
            del deps[k]
            print(f"  - Removed dependency: {k}")
    
    pkg['dependencies'] = deps
    with open('package.json', 'w', encoding='utf-8') as f:
        json.dump(pkg, f, indent=2)
    print("[OK] Updated package.json")

print("\n=================================================================")
print("STEP 3: REMOVING LEGACY CLIENT FILES")
print("=================================================================")

for fpath in ['src/firebaseClient.js', 'src/supabaseClient.js']:
    if os.path.exists(fpath):
        os.remove(fpath)
        print(f"  - Deleted {fpath}")

print("\n=================================================================")
print("STEP 4: SCRUBBING .ENV AND .ENV.EXAMPLE")
print("=================================================================")

env_clean = """# Pulse Music - Standalone Jamendo & Audius Engine
VITE_JAMENDO_CLIENT_ID=23b33f2a
VITE_AUDIUS_APP_NAME=PULSE_MUSIC
"""

with open('.env', 'w', encoding='utf-8') as f:
    f.write(env_clean)

with open('.env.example', 'w', encoding='utf-8') as f:
    f.write(env_clean)
print("[OK] Scrubbed .env and .env.example")

print("\n=================================================================")
print("STEP 5: COMPILING CLEAN PRODUCTION BUILD & SYNCING TO DOCS/")
print("=================================================================")

build_res = subprocess.run('npm run build', shell=True, capture_output=True, text=True)
print(build_res.stdout)
if build_res.returncode != 0:
    print("[ERROR] Build failed:", build_res.stderr)
    exit(1)

if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("SUCCESS: Full teardown and scrub completed cleanly!")
