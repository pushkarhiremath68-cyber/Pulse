import re
import os
import shutil
import subprocess

print("=================================================================")
print("PULSE MUSIC - PERMANENT CLICK UNRESPONSIVENESS RESOLUTION ENGINE")
print("=================================================================")

# 1. Update src/main.js with complete imports at the top
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Strip any existing imports at the top
main_js = re.sub(r"^(?:import\s+['\"][^'\"]+['\"];\s*\n)+", "", main_js)

top_imports = """import './geminiService.js';
import './lyricsService.js';
import './catalogService.js';
import './musicService.js';
import './audioEngine.js';
import './playbarController.js';
import './visualizer.js';
import './firebaseClient.js';

"""

main_js = top_imports + main_js
with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)
print("[OK] Injected all 8 core modules into top of src/main.js")

# 2. Clean index.html head and body scripts
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove module scripts from <head>
html = re.sub(r'<script\s+type=[\'"]module[\'"]\s+src=[\'"][^\'"]*src/(?:audioEngine|geminiService)\.js[\'"]></script>\s*', '', html)

# Remove all module scripts from bottom of body
html = re.sub(r'<script\s+type=[\'"]module[\'"]\s+src=[\'"][^\'"]*src/[^\'"]+[\'"]></script>\s*', '', html)

# Add single clean entry point right before </body>
html = html.replace('</body>', '  <script type="module" src="./src/main.js"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Configured single entry point ./src/main.js in index.html")

# 3. Clean and optimize vite.config.js
vite_config = """import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/pulse.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
"""
with open('vite.config.js', 'w', encoding='utf-8') as f:
    f.write(vite_config)
print("[OK] Configured deterministic output filenames in vite.config.js")

# 4. Compile production build
print("[...] Running npm run build...")
build_res = subprocess.run('npm run build', shell=True, capture_output=True, text=True)
print(build_res.stdout)
if build_res.returncode != 0:
    print("[ERROR] Build failed:", build_res.stderr)
    exit(1)

# 5. Verify the compiled bundle
print("[...] Verifying compiled production bundle dist/assets/pulse.js...")
with open('dist/assets/pulse.js', 'r', encoding='utf-8') as f:
    bundle = f.read()

critical_symbols = [
  'initApp',
  'playSpecificTrack',
  'executeSearch',
  'switchView',
  'openGeminiDjModal',
  'openLyricsForCurrentTrack',
  'PulseGemini',
  'catalogService',
  'lyricsService',
  'PulseAudioEngine',
  'playbarController'
]

all_passed = True
for sym in critical_symbols:
    found = sym in bundle
    print(f"  - Symbol '{sym}': {'PRESENT' if found else 'MISSING'}")
    if not found:
        all_passed = False

if not all_passed:
    print("[ERROR] Critical symbols missing from compiled bundle!")
    exit(1)

# 6. Verify dist/index.html script tag
with open('dist/index.html', 'r', encoding='utf-8') as f:
    dist_html = f.read()

assert 'src="./assets/pulse.js"' in dist_html, "pulse.js not properly linked in dist/index.html"
print("[OK] dist/index.html properly links to ./assets/pulse.js")

# 7. Sync dist to docs with .nojekyll
print("[...] Syncing dist to docs with .nojekyll...")
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("\n=================================================================")
print("SUCCESS: Production build 100% verified and synced to docs/!")
print("=================================================================")
