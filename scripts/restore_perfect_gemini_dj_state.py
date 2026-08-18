import subprocess
import os
import shutil

print("[1/5] Restoring clean working state from commit 539fa72...")
# Checkout index.html, src, and public from 539fa72
subprocess.run('git checkout 539fa72 -- index.html src/ public/ vite.config.js', shell=True, check=True)

print("[2/5] Verifying Gemini DJ and all modules in restored files...")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

assert 'gemini-dj-modal' in html, "Gemini DJ modal missing from index.html"
assert 'openGeminiDjModal' in html, "openGeminiDjModal missing from index.html"
assert 'lyrics-preview-modal' in html, "Lyrics modal missing from index.html"
assert 'catalog-categories-container' in html, "Catalog container missing from index.html"

print("[3/5] Compiling production build with Vite...")
build_res = subprocess.run('npm run build', shell=True, capture_output=True, text=True)
print(build_res.stdout)
if build_res.returncode != 0:
    print("[ERROR] Build failed:", build_res.stderr)
    exit(1)

print("[4/5] Syncing dist to docs with .nojekyll...")
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("[5/5] All Gemini DJ features and songs successfully restored and built!")
