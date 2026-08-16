import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_MUSIC = os.path.join(ROOT, 'storage', 'music')
DOCS_MUSIC = os.path.join(ROOT, 'docs', 'storage', 'music')
os.makedirs(DOCS_MUSIC, exist_ok=True)

core_files = [
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

copied = 0
for cf in core_files:
    src_p = os.path.join(SRC_MUSIC, cf)
    dst_p = os.path.join(DOCS_MUSIC, cf)
    if os.path.exists(src_p):
        shutil.copy2(src_p, dst_p)
        copied += 1

print(f"[SUCCESS] Copied {copied} core master audio files to docs/storage/music/")
