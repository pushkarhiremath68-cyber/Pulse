import re

# 1. Update src/style.css with Lyrics & Mini Playbar Snippet CSS
lyrics_css = """
/* ==========================================================================
   PULSE LRCLIB LIVE SYNCHRONIZED LYRICS ENGINE
   ========================================================================== */

/* Mini Bottom Playbar 2-Line Live Lyrics Preview Widget */
.mini-lyrics-snippet {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 17, 26, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.35);
  border-radius: 14px;
  padding: 0.45rem 1.1rem;
  max-width: 480px;
  width: 90%;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6), 0 0 20px rgba(168, 85, 247, 0.2);
  cursor: pointer;
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
}
.mini-lyrics-snippet:hover {
  border-color: rgba(168, 85, 247, 0.7);
  box-shadow: 0 12px 30px rgba(168, 85, 247, 0.35);
  transform: translateX(-50%) translateY(-2px);
}
.mini-lyric-line {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.25s ease;
}
.mini-lyric-current {
  font-size: 0.88rem;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 0 12px rgba(168, 85, 247, 0.8);
  letter-spacing: -0.01em;
}
.mini-lyric-next {
  font-size: 0.74rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.15rem;
}

/* Fullscreen Player Dual Mode: Visualizer / Karaoke Lyrics Sheet */
.fs-lyrics-view {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  padding: 2rem 1.5rem;
  z-index: 5;
  background: rgba(11, 13, 20, 0.75);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: var(--radius-lg);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease, transform 0.35s ease;
  transform: scale(0.96);
}
.fs-lyrics-view.active {
  opacity: 1;
  pointer-events: auto;
  transform: scale(1);
}
.fs-lyrics-scroller {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scroll-behavior: smooth;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40vh 1rem 45vh 1rem;
  gap: 1.4rem;
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%);
}
.fs-lyric-line {
  font-size: 1.35rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.32);
  text-align: center;
  cursor: pointer;
  padding: 0.4rem 1.2rem;
  border-radius: 12px;
  max-width: 680px;
  line-height: 1.4;
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
}
.fs-lyric-line:hover {
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.04);
}
.fs-lyric-line.active {
  color: #ffffff;
  font-size: 1.95rem;
  font-weight: 900;
  text-shadow: 0 0 24px rgba(168, 85, 247, 0.85), 0 0 40px rgba(236, 72, 153, 0.5);
  transform: scale(1.06);
  opacity: 1;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.3);
}

/* Lyrics Modal and Drawer Styles */
.lyrics-modal-box {
  max-width: 620px;
  width: 92%;
  background: rgba(15, 17, 26, 0.95);
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 24px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.25);
  padding: 1.5rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}
.lyrics-modal-body {
  overflow-y: auto;
  flex: 1;
  padding: 1.5rem 0.5rem;
  scroll-behavior: smooth;
}
.lyrics-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.lyrics-line {
  font-size: 1.15rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  line-height: 1.5;
}
.lyrics-line:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}
.lyrics-line.active {
  color: #fff;
  font-size: 1.35rem;
  font-weight: 800;
  color: #e879f9;
  text-shadow: 0 0 16px rgba(232, 121, 249, 0.6);
  background: rgba(168, 85, 247, 0.15);
  border-left: 3px solid var(--accent-primary);
}
.lyrics-placeholder-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}
"""

with open('src/style.css', 'r', encoding='utf-8') as f:
    style_content = f.read()

if 'PULSE LRCLIB LIVE SYNCHRONIZED LYRICS ENGINE' not in style_content:
    style_content += '\n' + lyrics_css
    with open('src/style.css', 'w', encoding='utf-8') as f:
        f.write(style_content)
    print("[OK] Added Lyrics CSS to src/style.css")

# 2. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Add script tag for lyricsService.js
if 'src/lyricsService.js' not in html_content:
    html_content = html_content.replace(
        '<script type="module" src="./src/catalogService.js?v=3.0.0-clean"></script>',
        '<script type="module" src="./src/lyricsService.js?v=3.0.0-clean"></script>\n  <script type="module" src="./src/catalogService.js?v=3.0.0-clean"></script>'
    )

# Add mini playbar 2-line lyric snippet in bottom playbar
mini_lyric_snippet_html = """    <!-- 2-Line Live Lyrics Preview Snippet -->
    <div id="mini-playbar-lyrics-snippet" class="mini-lyrics-snippet hidden" onclick="window.openFullscreenPlayerWithLyrics()" title="Click to expand Karaoke Lyrics View">
      <div class="mini-lyric-line mini-lyric-current" id="mini-lyric-current">♪ Pulse Live Lyrics Sync</div>
      <div class="mini-lyric-line mini-lyric-next" id="mini-lyric-next"></div>
    </div>
"""

if 'mini-playbar-lyrics-snippet' not in html_content:
    html_content = html_content.replace(
        '<!-- LEFT: CURRENT TRACK -->',
        f'{mini_lyric_snippet_html}\n    <!-- LEFT: CURRENT TRACK -->'
    )

# Add fullscreen lyrics sheet inside fs-visual-container
fs_lyrics_overlay_html = """        <!-- INTERACTIVE SYNCHRONIZED KARAOKE LYRICS SHEET -->
        <div id="fs-lyrics-view" class="fs-lyrics-view">
          <div id="fs-lyrics-scroller" class="fs-lyrics-scroller">
            <div class="lyrics-placeholder-empty">
              <i class="fa-solid fa-microphone-lines" style="font-size: 2rem; margin-bottom: 0.75rem; color: #c084fc; display: block;"></i>
              <p>Loading synchronized lyrics from LRCLIB...</p>
            </div>
          </div>
        </div>
"""

if 'fs-lyrics-view' not in html_content:
    html_content = html_content.replace(
        '<!-- CANVAS VISUALIZER -->',
        f'{fs_lyrics_overlay_html}\n        <!-- CANVAS VISUALIZER -->'
    )

# Update Home Screen Filter Chips to match requested tabs:
# Hindi / Bollywood Hits, English / Global Pop, Punjabi / Regional, EDM & Electronic, Lo-Fi & Chill, Rock & Alternative, 90s Hits, Hollywood Blockbusters
filter_chips_html = """          <button class="chip-btn active" data-category="all" onclick="window.selectCatalogCategory('all', this)">
            <i class="fa-solid fa-sparkles"></i> All Tracks
          </button>
          <button class="chip-btn" data-category="bollywood_evergreen" onclick="window.selectCatalogCategory('bollywood_evergreen', this)">
            <i class="fa-solid fa-compact-disc" style="color:#ec4899;"></i> Hindi / Bollywood Hits
          </button>
          <button class="chip-btn" data-category="pop" onclick="window.selectCatalogCategory('pop', this)">
            <i class="fa-solid fa-earth-americas" style="color:#3b82f6;"></i> English / Global Pop
          </button>
          <button class="chip-btn" data-category="punjabi_chartbusters" onclick="window.selectCatalogCategory('punjabi_chartbusters', this)">
            <i class="fa-solid fa-guitar" style="color:#eab308;"></i> Punjabi / Regional
          </button>
          <button class="chip-btn" data-category="electronic" onclick="window.selectCatalogCategory('electronic', this)">
            <i class="fa-solid fa-bolt-lightning" style="color:#a855f7;"></i> EDM & Electronic
          </button>
          <button class="chip-btn" data-category="lofi" onclick="window.selectCatalogCategory('lofi', this)">
            <i class="fa-solid fa-headphones-simple" style="color:#10b981;"></i> Lo-Fi & Chill
          </button>
          <button class="chip-btn" data-category="rock" onclick="window.selectCatalogCategory('rock', this)">
            <i class="fa-solid fa-guitar" style="color:#ef4444;"></i> Rock & Alternative
          </button>
          <button class="chip-btn" data-category="nineties" onclick="window.selectCatalogCategory('nineties', this)">
            <i class="fa-solid fa-record-vinyl" style="color:#f59e0b;"></i> Top 90s Golden Hits
          </button>
          <button class="chip-btn" data-category="hollywood" onclick="window.selectCatalogCategory('hollywood', this)">
            <i class="fa-solid fa-clapperboard" style="color:#38bdf8;"></i> Hollywood Blockbuster Hits
          </button>"""

html_content = re.sub(
    r'<div class="catalog-chip-bar" id="catalog-chip-bar">[\s\S]*?</div>\s*<!-- DYNAMIC RECENTLY PLAYED',
    f'<div class="catalog-chip-bar" id="catalog-chip-bar">\n{filter_chips_html}\n        </div>\n\n        <!-- DYNAMIC RECENTLY PLAYED',
    html_content
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)
print("[OK] Updated index.html with lyrics elements, language tabs, and script imports.")
