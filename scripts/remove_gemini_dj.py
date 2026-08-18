import re

# 1. Clean index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove geminiService script tag
html = re.sub(r'<script type="module" src="\./src/geminiService\.js[^"]*"></script>\s*', '', html)

# Remove sidebar Gemini nav item
html = re.sub(
    r'<a href="#" class="nav-item nav-item-gemini" id="nav-gemini-dj"[\s\S]*?</a>\s*',
    '',
    html
)

# Remove hero button
html = re.sub(
    r'<button id="hero-like-btn" class="btn-secondary-outline" onclick="window\.openGeminiDjModal\(\)">[\s\S]*?</button>\s*',
    '',
    html
)
html = html.replace('with Gemini AI DJ, synchronized lyrics,', 'with synchronized lyrics, high-definition audio,')

# Remove Quick Discovery Hub Gemini card
html = re.sub(
    r'<div class="feature-action-card" onclick="window\.openGeminiDjModal\(\)"[\s\S]*?Launch AI DJ <i class="fa-solid fa-arrow-right"></i></span>\s*</div>\s*',
    '',
    html
)

# Remove side drawer Gemini insight bar & box
html = re.sub(
    r'<div class="lyrics-gemini-bar"[\s\S]*?</div>\s*<div id="gemini-song-insight-box"[\s\S]*?</div>\s*</div>\s*',
    '',
    html
)

# Remove fs header gemini button
html = re.sub(
    r'<button id="fs-btn-gemini"[\s\S]*?</button>\s*',
    '',
    html
)

# Remove gemini modal
html = re.sub(
    r'<!-- GEMINI AI DJ STUDIO MODAL -->\s*<div id="gemini-dj-modal"[\s\S]*?<!-- Loading State -->[\s\S]*?</div>\s*</div>\s*</div>',
    '',
    html
)

# Remove mobile bottom nav gemini item
html = re.sub(
    r'<button class="mobile-nav-item" id="mobile-nav-gemini"[\s\S]*?</button>\s*',
    '',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Cleaned index.html of all Gemini AI DJ elements.")

# 2. Clean src/main.js
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

# Make sure any calls to openGeminiDjModal or explainCurrentSongWithGemini are harmless stubs if triggered
gemini_stubs = """
  window.openGeminiDjModal = function() {};
  window.closeGeminiDjModal = function() {};
  window.explainCurrentSongWithGemini = function() {};
"""
if 'window.openGeminiDjModal = function' not in main_js:
    main_js += gemini_stubs

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)
print("[OK] Cleaned src/main.js.")
