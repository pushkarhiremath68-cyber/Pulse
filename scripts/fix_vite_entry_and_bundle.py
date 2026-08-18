import re

# 1. Update src/main.js to import dependencies at the top
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_code = f.read()

imports = """import './lyricsService.js';
import './catalogService.js';
import './musicService.js';
import './audioEngine.js';
import './playbarController.js';
import './visualizer.js';

"""

if "import './catalogService.js';" not in main_code:
    main_code = imports + main_code
    with open('src/main.js', 'w', encoding='utf-8') as f:
        f.write(main_code)
    print("[OK] Added module imports to top of src/main.js")

# 2. Update index.html to have a single clean entry script tag
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace all script tags at the bottom
html = re.sub(
    r'<script type="module" src="\./src/[^"]+"></script>\s*',
    '',
    html
)

# Insert single clean entry point right before </body>
html = html.replace('</body>', '  <script type="module" src="./src/main.js"></script>\n</body>')

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("[OK] Cleaned script tags in index.html to use single entry point ./src/main.js")
