import re

# 1. Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add <audio id="fallback-audio-player"> if not present
if 'id="fallback-audio-player"' not in html:
    html = html.replace('</body>', '  <audio id="fallback-audio-player" preload="auto"></audio>\n</body>')

# Ensure search input has inline oninput
html = re.sub(
    r'<input type="text" id="global-search-input"[^>]*>',
    '<input type="text" id="global-search-input" placeholder="Search any song (English, Hindi, Spanish, Punjabi, K-Pop)..." autocomplete="off" oninput="window.executeSearch(this.value, true)">',
    html
)

# Ensure clear search button has inline onclick
html = re.sub(
    r'<button id="clear-search-btn"[^>]*>',
    '<button id="clear-search-btn" class="clear-search hidden" onclick="const i=document.getElementById(\'global-search-input\'); if(i) i.value=\'\'; window.executeSearch(\'\', false);"><i class="fa-solid fa-xmark"></i></button>',
    html
)

# Ensure lyrics toggle button in playbar has inline onclick
html = re.sub(
    r'<button id="btn-toggle-lyrics"[^>]*>',
    '<button id="btn-toggle-lyrics" class="btn-player-icon" title="View Lyrics" onclick="window.openLyricsForCurrentTrack()"><i class="fa-solid fa-quote-right"></i></button>',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Updated index.html with direct inline event handlers and audio element")
