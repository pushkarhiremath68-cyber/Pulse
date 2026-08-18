import re

# 1. Patch src/style.css and index.html <style>
strict_interactivity_css = """
/* ==========================================================================
   STRICT MODAL OVERLAYS & ZERO-BLOCK CLICK ENFORCEMENT
   ========================================================================== */
.hidden, [hidden], .modal-overlay.hidden, .modal.hidden, #auth-modal.hidden, #artist-detail-modal.hidden, #lyrics-preview-modal.hidden, #song-credits-modal.hidden, #create-playlist-modal.hidden, #add-to-playlist-modal.hidden, #download-app-modal.hidden, #upload-audio-modal.hidden, #google-auth-modal.hidden, #google-oauth-picker-modal.hidden, #youtube-video-modal.hidden {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
  z-index: -99999 !important;
}

.modal-overlay {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  padding: 1rem !important;
  pointer-events: auto !important;
}

#app, .main-content, .home-content, #catalog-categories-container, .category-horizontal-row, .category-row-scroll-wrap, .music-card {
  pointer-events: auto !important;
}

.music-card, .btn-card-play, .music-card-play-btn, .chip-btn, .pill-btn, .nav-item, button, a {
  cursor: pointer !important;
  pointer-events: auto !important;
}
"""

with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

if 'STRICT MODAL OVERLAYS & ZERO-BLOCK CLICK ENFORCEMENT' not in css:
    css = css + '\n' + strict_interactivity_css
    with open('src/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("[OK] Updated src/style.css with strict modal & pointer-events rules")

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add to inline style in head
if 'STRICT MODAL OVERLAYS' not in html:
    html = html.replace('</style>', strict_interactivity_css.strip() + '\n  </style>')
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[OK] Injected strict modal styles into index.html <head>")

print("[OK] CSS Interactivity enforcement complete")
