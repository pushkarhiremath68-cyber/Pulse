import os, re

files_to_check = ['index.html', 'src/main.js', 'src/style.css', 'src/playbarController.js']

for fp in files_to_check:
    if os.path.exists(fp):
        with open(fp, 'r', encoding='utf-8') as f:
            content = f.read()
        matches = len(re.findall(r'gemini', content, re.IGNORECASE))
        print(f"{fp}: {matches} occurrences of 'gemini'")
