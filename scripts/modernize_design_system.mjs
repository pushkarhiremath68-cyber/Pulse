import fs from 'fs';

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// Add viewport-fit=cover
html = html.replace(
  '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
);

// Update inline base background from flat #000000 to obsidian #07080d
html = html.replace(
  'background-color: #000000 !important;',
  'background-color: #07080d !important;'
);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html base styling & viewport');

// 2. UPDATE src/style.css
let css = fs.readFileSync('src/style.css', 'utf8');

// Replace flat black / gray tokens in :root
css = css.replace(
  '--bg-main: #000000;',
  '--bg-main: #07080d;'
);
css = css.replace(
  '--bg-secondary: #000000;',
  '--bg-secondary: #0b0e17;'
);

// Replace flat gray player backgrounds
css = css.replaceAll('rgba(25, 25, 25, 0.94)', 'rgba(9, 11, 18, 0.92)');
css = css.replaceAll('rgba(30, 30, 30, 0.96)', 'rgba(12, 14, 22, 0.95)');

// Append Modern UI/UX Design System Overhaul Section
const MODERN_DESIGN_SYSTEM = `

/* =============================================================================
   MODERN UI/UX DESIGN SYSTEM OVERHAUL (2026 EDITION)
   Clean, Responsive, Obsidian Depth, Glassmorphism & Smooth Micro-Interactions
   ============================================================================= */

/* -----------------------------------------------------------------------------
   M1. GLOBAL VIEWPORT & SMOOTH VIEW TRANSITIONS
   ----------------------------------------------------------------------------- */
html, body {
  background-color: #07080d !important;
  color: #f8fafc !important;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fluid View Entrance Animation */
@keyframes viewSmoothFadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.995);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.app-view.active-view {
  display: block !important;
  animation: viewSmoothFadeIn 0.32s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  will-change: opacity, transform;
}

/* Centered & Balanced Layout for Ultra-Wide Displays */
@media (min-width: 1441px) {
  .main-content {
    max-width: 1720px !important;
    margin-right: auto !important;
  }
}

/* -----------------------------------------------------------------------------
   M2. MODERN GLASSMORPHISM & SPECULAR CARD SYSTEM
   ----------------------------------------------------------------------------- */
.music-card,
.track-card,
.pulse-playlist-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.045) 0%, rgba(255, 255, 255, 0.015) 100%) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 16px !important;
  padding: 0.85rem !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.32s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, background-color 0.25s ease !important;
  will-change: transform, box-shadow;
  position: relative;
  overflow: hidden;
}

.music-card:hover,
.track-card:hover,
.pulse-playlist-card:hover {
  transform: translateY(-5px) scale(1.015) !important;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.085) 0%, rgba(255, 255, 255, 0.025) 100%) !important;
  border-color: rgba(99, 102, 241, 0.45) !important;
  border-top-color: rgba(99, 102, 241, 0.7) !important;
  box-shadow: 0 18px 40px -10px rgba(0, 0, 0, 0.75), 0 0 24px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
}

.music-card:active,
.track-card:active,
.pulse-playlist-card:active {
  transform: translateY(-2px) scale(0.985) !important;
  transition-duration: 0.1s !important;
}

.music-card .card-image-wrapper,
.track-card .card-cover-wrap {
  border-radius: 12px !important;
  overflow: hidden !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5) !important;
  background: #0a0c14 !important;
}

.music-card .card-image-wrapper img,
.track-card .card-cover-wrap img {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: transform;
}

.music-card:hover .card-image-wrapper img,
.track-card:hover .card-cover-wrap img {
  transform: scale(1.05) !important;
}

/* Floating Center Quick Play Button on Card Hover */
.card-play-overlay {
  background: rgba(7, 8, 14, 0.45) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.btn-card-play,
.btn-play-hover {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 18px rgba(79, 70, 229, 0.6) !important;
  transform: translateY(6px) scale(0.85);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, filter 0.2s ease !important;
}

.music-card:hover .btn-card-play,
.track-card:hover .btn-play-hover {
  transform: translateY(0) scale(1) !important;
}

.btn-card-play:hover,
.btn-play-hover:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 6px 22px rgba(99, 102, 241, 0.8) !important;
  filter: brightness(1.15) !important;
}

.btn-card-play:active,
.btn-play-hover:active {
  transform: scale(0.95) !important;
}

/* Card Corner Action Badges */
.card-corner-actions {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.btn-card-action {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease !important;
}

.btn-card-action:hover {
  transform: scale(1.12) !important;
}

.btn-card-action:active {
  transform: scale(0.92) !important;
}

/* -----------------------------------------------------------------------------
   M3. TACTILE BUTTONS & CONSISTENT PILL SYSTEM
   ----------------------------------------------------------------------------- */
.btn-primary-play,
.btn-hero-video,
.btn-secondary-install,
.tag-pill,
.btn-circle-nav,
.control-btn,
.btn-player-main,
.btn-download-header,
.filter-pill {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease !important;
  -webkit-tap-highlight-color: transparent;
}

.btn-primary-play:active,
.btn-hero-video:active,
.btn-secondary-install:active,
.tag-pill:active,
.filter-pill:active,
.btn-download-header:active {
  transform: scale(0.96) !important;
}

.btn-circle-nav:active {
  transform: scale(0.92) !important;
}

/* Tag & Genre Pills */
.tag-pill,
.filter-pill {
  border-radius: 9999px !important;
  padding: 0.5rem 1.1rem !important;
  font-size: 0.82rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.02em !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
}

.tag-pill:hover,
.filter-pill:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(99, 102, 241, 0.4) !important;
  color: #ffffff !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4) !important;
}

.filter-pill.active-pill {
  background: linear-gradient(135deg, #6366f1 0%, #38bdf8 100%) !important;
  color: #ffffff !important;
  border-color: transparent !important;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.45) !important;
}

/* -----------------------------------------------------------------------------
   M4. TOP HEADER & MODERN SEARCH EXPERIENCE
   ----------------------------------------------------------------------------- */
.top-header {
  background: rgba(7, 8, 14, 0.85) !important;
  backdrop-filter: blur(32px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.55) !important;
}

.search-box-container input {
  height: 46px !important;
  border-radius: 9999px !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.09) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  color: #ffffff !important;
  font-size: 0.92rem !important;
  font-weight: 500 !important;
  letter-spacing: -0.01em !important;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 14px rgba(0, 0, 0, 0.25) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.search-box-container input:focus {
  background: rgba(255, 255, 255, 0.09) !important;
  border-color: rgba(99, 102, 241, 0.6) !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.18), 0 8px 24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
  transform: translateY(-1px) !important;
}

.voice-search-btn {
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease !important;
}

.voice-search-btn:hover {
  transform: scale(1.12) !important;
  color: #38bdf8 !important;
}

.voice-search-btn:active {
  transform: scale(0.92) !important;
}

/* -----------------------------------------------------------------------------
   M5. PERSISTENT DOCK PLAYBAR & AUDIO SCRUBBER
   ----------------------------------------------------------------------------- */
.bottom-player-bar,
#player-bar,
.playbar {
  background: rgba(9, 11, 18, 0.92) !important;
  backdrop-filter: blur(32px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(32px) saturate(180%) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.09) !important;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08) !important;
}

/* Center Play/Pause Button */
.play-btn,
.btn-player-main {
  width: 46px !important;
  height: 46px !important;
  border-radius: 50% !important;
  background: #ffffff !important;
  color: #07080d !important;
  box-shadow: 0 4px 18px rgba(255, 255, 255, 0.35) !important;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease !important;
}

.play-btn:hover,
.btn-player-main:hover {
  transform: scale(1.08) !important;
  box-shadow: 0 6px 24px rgba(255, 255, 255, 0.5) !important;
}

.play-btn:active,
.btn-player-main:active {
  transform: scale(0.94) !important;
}

/* Secondary Playback Buttons */
.control-btn:hover,
.btn-player-icon:hover {
  color: #ffffff !important;
  transform: scale(1.1) !important;
}

.control-btn:active,
.btn-player-icon:active {
  transform: scale(0.92) !important;
}

/* Scrubber Timeline Track & Fill */
.progress-bar-wrapper,
.fs-progress-bar-wrapper {
  height: 5px !important;
  border-radius: 9999px !important;
  background: rgba(255, 255, 255, 0.12) !important;
  cursor: pointer;
  transition: height 0.2s ease, background-color 0.2s ease !important;
}

.progress-bar-wrapper:hover,
.fs-progress-bar-wrapper:hover {
  height: 7px !important;
  background: rgba(255, 255, 255, 0.18) !important;
}

.progress-bar-fill,
#player-progress-fill,
#fs-progress-fill {
  background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%) !important;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.6) !important;
  border-radius: 9999px !important;
}

/* -----------------------------------------------------------------------------
   M6. REAL-TIME SYNCHRONIZED LYRICS & FULLSCREEN PLAYER
   ----------------------------------------------------------------------------- */
.fs-lyrics-scroll-box,
#fs-lyrics-scroll-box {
  scroll-behavior: smooth !important;
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%) !important;
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 12%, rgba(0,0,0,1) 88%, transparent 100%) !important;
}

.fs-lyric-line {
  transition: font-size 0.3s cubic-bezier(0.16, 1, 0.3, 1), color 0.3s ease, opacity 0.3s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), text-shadow 0.3s ease !important;
  cursor: pointer;
  padding: 0.5rem 0.75rem !important;
  border-radius: 12px;
}

.fs-lyric-line:hover {
  color: rgba(255, 255, 255, 0.75) !important;
  background: rgba(255, 255, 255, 0.04);
}

.fs-lyric-line.fs-lyric-active {
  font-size: 1.65rem !important;
  font-weight: 800 !important;
  color: #ffffff !important;
  opacity: 1 !important;
  transform: scale(1.025) !important;
  text-shadow: 0 0 28px rgba(168, 85, 247, 0.5) !important;
}

/* -----------------------------------------------------------------------------
   M7. ARTIST PROFILE PAGE & ABOUT CARD
   ----------------------------------------------------------------------------- */
.artist-hero-banner {
  border-radius: 24px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.14) !important;
}

.artist-track-row {
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, border-color 0.2s ease !important;
}

.artist-track-row:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  border-color: rgba(99, 102, 241, 0.4) !important;
  transform: translateX(4px) !important;
}

.artist-track-row:active {
  transform: translateX(2px) scale(0.99) !important;
}

/* -----------------------------------------------------------------------------
   M8. RESPONSIVE POLISH & MOBILE NOTCH / SAFE AREA SUPPORT
   ----------------------------------------------------------------------------- */
@media (max-width: 768px) {
  body {
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
  }

  .mobile-bottom-nav {
    height: calc(60px + env(safe-area-inset-bottom, 0px)) !important;
    padding-bottom: env(safe-area-inset-bottom, 0px) !important;
    background: rgba(9, 11, 18, 0.92) !important;
    backdrop-filter: blur(28px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
    border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  }

  .playbar,
  .bottom-player-bar,
  #player-bar {
    bottom: calc(60px + env(safe-area-inset-bottom, 0px)) !important;
    height: 74px !important;
    padding: 8px 14px !important;
    background: rgba(9, 11, 18, 0.95) !important;
  }

  .mobile-nav-item:active {
    transform: scale(0.92) !important;
  }

  /* Minimum 44x44px touch targets */
  .control-btn,
  .btn-player-icon,
  .btn-card-action {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}

@media (max-width: 480px) {
  .search-results-list,
  .tracks-grid-shelf {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 0.65rem !important;
  }

  .music-card,
  .track-card {
    min-width: 0 !important;
    width: 100% !important;
    padding: 0.6rem !important;
  }

  .hero-title {
    font-size: 1.75rem !important;
  }
}

/* -----------------------------------------------------------------------------
   M9. MINIMALIST ULTRA-SLEEK SCROLLBARS
   ----------------------------------------------------------------------------- */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

/* End of Modern UI/UX Design System Overhaul */
`;

css += MODERN_DESIGN_SYSTEM;
fs.writeFileSync('src/style.css', css, 'utf8');
console.log('Successfully appended Modern UI/UX Design System Overhaul to src/style.css');
