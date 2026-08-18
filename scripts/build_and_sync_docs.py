import subprocess, shutil, os

print("[1/3] Running Vite build...")
res = subprocess.run(["npm", "run", "build"], capture_output=True, text=True, shell=True)
print(res.stdout)
if res.returncode != 0:
    print("Build failed:", res.stderr)
    exit(1)

print("[2/3] Syncing dist/ to docs/ for GitHub Pages...")
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')

# Copy .nojekyll to docs
with open(os.path.join('docs', '.nojekyll'), 'w') as f:
    f.write('')

# Also copy src/ and raw files to docs for fallback inspection
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)

print("[3/3] Verification: Checking docs/index.html...")
with open(os.path.join('docs', 'index.html'), 'r', encoding='utf-8') as f:
    docs_html = f.read()

if 'assets/index-' in docs_html:
    print("[SUCCESS] docs/index.html is correctly linked to production bundled asset!")
else:
    print("[WARNING] docs/index.html does not contain bundled assets link.")
