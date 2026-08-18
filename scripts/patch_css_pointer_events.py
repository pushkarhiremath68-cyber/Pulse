# Add explicit modal & pointer-events styles into src/style.css
with open('src/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

pointer_and_modal_css = """
/* ==========================================================================
   INTERACTIVITY, MODAL OVERLAYS & POINTER EVENTS ENFORCEMENT
   ========================================================================== */
.hidden {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
}

.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
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

.modal-overlay.hidden {
  display: none !important;
  visibility: hidden !important;
  pointer-events: none !important;
  z-index: -9999 !important;
}

.app-container, .main-content, .home-content, .music-cards-grid, .music-card, .btn-primary-play, .btn-secondary-outline, .btn-secondary-install, .pulse-social-btn, .pulse-auth-submit, .pulse-tab, .nav-item, .pill-btn, .filter-pill, .artist-card, .song-card, .track-row, .btn-player-primary, .btn-player-sub {
  pointer-events: auto !important;
}

.music-card, .song-card, .track-row, button, .pulse-tab, .filter-pill, .pill-btn, .nav-item {
  cursor: pointer !important;
}
"""

if 'INTERACTIVITY, MODAL OVERLAYS & POINTER EVENTS ENFORCEMENT' not in css:
    css = css + '\n' + pointer_and_modal_css
    with open('src/style.css', 'w', encoding='utf-8') as f:
        f.write(css)
    print("[OK] Injected pointer-events & modal overlay rules into src/style.css")
