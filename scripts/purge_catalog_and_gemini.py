import os
import re
import shutil
import json
import subprocess

print("=================================================================")
print("STEP 1: DELETING GEMINI DJ & CATALOG SERVICE FILES")
print("=================================================================")

for f in ['src/geminiService.js', 'src/catalogService.js']:
    if os.path.exists(f):
        os.remove(f)
        print(f"  - Deleted {f}")

print("\n=================================================================")
print("STEP 2: CLEANING INDEX.HTML (REMOVING GEMINI DJ & CATALOG UI)")
print("=================================================================")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Remove Gemini DJ Modal
html = re.sub(r'<div\s+id=[\'"]gemini-dj-modal[\'"][\s\S]*?</div>\s*</div>\s*</div>', '', html)

# 2. Remove Artist Detail Modal (Catalog feature)
html = re.sub(r'<div\s+id=[\'"]artist-detail-modal[\'"][\s\S]*?</div>\s*</div>\s*</div>', '', html)

# 3. Remove Gemini AI DJ buttons from Hero & Feature Cards
html = re.sub(r'<button[^>]*onclick=[\'"][^\'"]*openGeminiDjModal[^\'"]*[\'"][^>]*>[\s\S]*?</button>', '', html)
html = re.sub(r'<div[^>]*onclick=[\'"][^\'"]*openGeminiDjModal[^\'"]*[\'"][^>]*>[\s\S]*?</div>\s*</div>', '', html)

# 4. Remove Catalog Category Chip Filters if present
html = re.sub(r'<div\s+class=[\'"]catalog-chip-bar[\'"][\s\S]*?</div>', '', html)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Cleaned index.html")

print("\n=================================================================")
print("STEP 3: CLEANING SRC/MAIN.JS")
print("=================================================================")

with open('src/main.js', 'r', encoding='utf-8') as f:
    main_code = f.read()

# Remove openGeminiDjModal and closeGeminiDjModal
main_code = re.sub(r'window\.openGeminiDjModal\s*=\s*function\(\)[\s\S]*?\}\s*;\s*', '', main_code)
main_code = re.sub(r'window\.closeGeminiDjModal\s*=\s*function\(\)[\s\S]*?\}\s*;\s*', '', main_code)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_code)
print("[OK] Cleaned src/main.js")

print("\n=================================================================")
print("STEP 4: CLEANING PACKAGE.JSON & ENV")
print("=================================================================")

if os.path.exists('package.json'):
    with open('package.json', 'r', encoding='utf-8') as f:
        pkg = json.load(f)
    
    deps = pkg.get('dependencies', {})
    for k in ['@google/genai', '@google/generative-ai']:
        if k in deps:
            del deps[k]
            print(f"  - Removed dependency: {k}")
    
    pkg['dependencies'] = deps
    with open('package.json', 'w', encoding='utf-8') as f:
        json.dump(pkg, f, indent=2)

env_clean = """# Pulse Music - Standalone Jamendo & Audius Engine
VITE_JAMENDO_CLIENT_ID=23b33f2a
VITE_AUDIUS_APP_NAME=PULSE_MUSIC
"""

with open('.env', 'w', encoding='utf-8') as f:
    f.write(env_clean)

with open('.env.example', 'w', encoding='utf-8') as f:
    f.write(env_clean)

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

print("SUCCESS: Both Catalog and Gemini DJ features completely purged!")
