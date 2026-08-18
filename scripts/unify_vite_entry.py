import re

# 1. Update index.html to have a single entry point
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove audioEngine script from head
html = re.sub(r'<script type="module" src="\./src/audioEngine\.js[^"]*"></script>\s*', '', html)

# Replace multiple script tags at bottom with single main.js entry point
html = re.sub(
    r'<script type="module" src="\./src/firebaseClient\.js[\s\S]*?<script type="module" src="\./src/main\.js[^"]*"></script>',
    '<script type="module" src="./src/main.js"></script>',
    html
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("[OK] Updated index.html with single Vite entry point: ./src/main.js")

# 2. Update src/main.js to import all dependencies at the top
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_js = f.read()

import_headers = """// Pulse Core Module Imports
import './firebaseClient.js';
import './audioEngine.js';
import './lyricsService.js';
import './catalogService.js';
import './musicService.js';
import './playbarController.js';
import './visualizer.js';

"""

if 'import \'./audioEngine.js\'' not in main_js:
    main_js = import_headers + main_js
    print("[OK] Added module imports to the top of src/main.js")

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_js)

print("[OK] Unified Vite entry in index.html & src/main.js")
