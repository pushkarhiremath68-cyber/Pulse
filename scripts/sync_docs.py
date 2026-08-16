import os, shutil

# 1. Copy all download packages to docs/downloads/
docs_dl = os.path.join('docs', 'downloads')
os.makedirs(docs_dl, exist_ok=True)
if os.path.exists('downloads'):
    for f in os.listdir('downloads'):
        src = os.path.join('downloads', f)
        dst = os.path.join(docs_dl, f)
        if os.path.isfile(src):
            shutil.copy2(src, dst)

# 2. Copy src files to docs/src
docs_src = os.path.join('docs', 'src')
os.makedirs(docs_src, exist_ok=True)
if os.path.exists('src'):
    for f in os.listdir('src'):
        src = os.path.join('src', f)
        dst = os.path.join(docs_src, f)
        if os.path.isfile(src):
            shutil.copy2(src, dst)

# 3. Copy root index.html to docs/index.html
shutil.copy2('index.html', os.path.join('docs', 'index.html'))

# 4. Copy core master audio files to docs/storage/music/
docs_music = os.path.join('docs', 'storage', 'music')
os.makedirs(docs_music, exist_ok=True)
core_audio_list = [
    'in-itni-si-baat-hai.mp4',
    'in-kesariya.mp4',
    'in-udi-udi-jaye.mp4',
    'in-chaleya.mp4',
    'in-chaleya.m4a',
    'pj-wavy-karan-aujla.mp4',
    'in-shayad.mp4',
    'pj-softly-karan-aujla.mp4',
    'en-save-your-tears.mp4',
    'te-srivalli-telugu.mp4',
    'kn-singara-siriye.mp4',
    'hr-52-gaj-ka-daman.mp4',
    'dev-hanuman-chalisa-gulshan.mp4',
    'in-apna-bana-le.mp4',
    'in-tum-hi-ho.m4a',
    'in-agar-tum-saath-ho.mp4',
    'in-maan-meri-jaan.mp4',
    'in-channa-mereya.mp4',
    'in-heeriye.m4a',
    'in-ranjha.m4a',
    'pj-cheques-shubh.mp4',
    'en-blinding-lights.mp4',
    'en-shape-of-you.mp4',
    'in-dheema-dheema.mp4',
    'in-zulfein-aditya.mp4',
    'in-ishq-faheem.mp4',
    'in-jo-tum-mere-ho.mp4'
]

copied_audio = 0
for f in core_audio_list:
    src = os.path.join('storage', 'music', f)
    dst = os.path.join(docs_music, f)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        copied_audio += 1

print(f"Synced docs successfully. Files in docs/downloads: {len(os.listdir(docs_dl))}, Core audio in docs/storage/music: {copied_audio}")
