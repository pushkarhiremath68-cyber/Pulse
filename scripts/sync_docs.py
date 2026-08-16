import os, shutil

# Copy all download packages to docs/downloads/
docs_dl = os.path.join('docs', 'downloads')
os.makedirs(docs_dl, exist_ok=True)

for f in os.listdir('downloads'):
    src = os.path.join('downloads', f)
    dst = os.path.join(docs_dl, f)
    if os.path.isfile(src):
        shutil.copy2(src, dst)

# Copy src files to docs/src
docs_src = os.path.join('docs', 'src')
os.makedirs(docs_src, exist_ok=True)
for f in os.listdir('src'):
    src = os.path.join('src', f)
    dst = os.path.join(docs_src, f)
    if os.path.isfile(src):
        shutil.copy2(src, dst)

# Copy root index.html to docs/index.html
shutil.copy2('index.html', os.path.join('docs', 'index.html'))

print("Synced docs successfully. Files in docs/downloads:", len(os.listdir(docs_dl)))
