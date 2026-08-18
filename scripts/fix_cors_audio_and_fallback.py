import re

files = ['src/audioEngine.js', 'src/playbarController.js', 'src/main.js', 'index.html']

for fp in files:
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove crossOrigin = 'anonymous' so browser can play all CDN audio streams without CORS restriction
    content = re.sub(r'[\w.]+\.crossOrigin\s*=\s*[\'"]anonymous[\'"];?\s*', '', content)
    content = re.sub(r'crossorigin=[\'"]anonymous[\'"]\s*', '', content)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"[OK] Removed crossOrigin restrictions from {fp}")

print("[SUCCESS] Audio elements can now play from any CDN without CORS blocking!")
