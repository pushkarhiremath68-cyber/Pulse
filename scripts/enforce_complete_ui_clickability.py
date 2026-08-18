import re
import os
import shutil
import subprocess

print("[1/4] Applying bulletproof inline handlers to index.html...")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Direct oninput for search
html = re.sub(
    r'<input\s+type=[\'"]text[\'"]\s+id=[\'"]global-search-input[\'"][^>]*>',
    '<input type="text" id="global-search-input" placeholder="Search any song (English, Hindi, Spanish, Punjabi, K-Pop)..." autocomplete="off" oninput="window.executeSearch(this.value, true)">',
    html
)

# Direct onclick for clear search
html = re.sub(
    r'<button\s+id=[\'"]clear-search-btn[\'"][^>]*>',
    '<button id="clear-search-btn" class="clear-search hidden" onclick="const i=document.getElementById(\'global-search-input\'); if(i) i.value=\'\'; window.executeSearch(\'\', false);"><i class="fa-solid fa-xmark"></i></button>',
    html
)

# Ensure fallback audio player exists in DOM
if 'id="fallback-audio-player"' not in html:
    html = html.replace('</body>', '  <audio id="fallback-audio-player" preload="auto"></audio>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Updated index.html")

print("[2/4] Appending bulletproof pointer-events CSS to src/style.css...")
with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

enforcer_css = """
/* ==========================================================================
   GLOBAL CLICKABILITY & MODAL OVERLAY ISOLATION ENFORCER
   ========================================================================== */
.modal-overlay.hidden,
.modal.hidden,
#splash-screen.hidden,
#auth-modal.hidden,
#artist-detail-modal.hidden,
#gemini-dj-modal.hidden,
#lyrics-preview-modal.hidden,
#download-app-modal.hidden,
#upload-audio-modal.hidden,
#song-credits-modal.hidden,
#create-playlist-modal.hidden,
#add-to-playlist-modal.hidden,
.hidden,
[hidden] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
  z-index: -99999 !important;
}

#app,
.app-container,
.main-content,
.sidebar,
.top-header,
.search-box-container,
#global-search-input,
.music-card,
.card-image-wrapper,
.card-play-overlay,
.btn-card-play,
.feature-action-card,
.hero-actions button,
.btn-primary-play,
.btn-secondary-outline,
.btn-secondary-install,
.btn-header-login,
.btn-header-signup,
.bottom-player-bar,
.player-controls,
.timeline-container,
.nav-item,
.chip-filter,
button,
input,
select,
textarea,
a {
  pointer-events: auto !important;
}
"""

if 'GLOBAL CLICKABILITY & MODAL OVERLAY ISOLATION ENFORCER' not in css:
    css = css + '\n' + enforcer_css
    with open('src/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("[OK] Appended enforcer CSS to src/style.css")

print("[3/4] Running npm run build...")
build_res = subprocess.run('npm run build', shell=True, capture_output=True, text=True)
print(build_res.stdout)
if build_res.returncode != 0:
    print("[ERROR] Build failed:", build_res.stderr)
    exit(1)

print("[4/4] Syncing dist to docs with .nojekyll...")
if os.path.exists('docs'):
    shutil.rmtree('docs')
shutil.copytree('dist', 'docs')
shutil.copytree('src', os.path.join('docs', 'src'), dirs_exist_ok=True)
shutil.copytree('public', os.path.join('docs', 'public'), dirs_exist_ok=True)
with open('docs/.nojekyll', 'w') as f: f.write('')
with open('.nojekyll', 'w') as f: f.write('')
if os.path.exists('pulse-logo.png'): shutil.copy('pulse-logo.png', 'docs/pulse-logo.png')
if os.path.exists('pulse-logo.svg'): shutil.copy('pulse-logo.svg', 'docs/pulse-logo.svg')

print("SUCCESS: UI interaction and clickability fully enforced and synced!")
