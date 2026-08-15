import urllib.request

urls = [
    'http://localhost:3000/',
    'http://localhost:3000/index.html',
    'http://localhost:3000/src/style.css',
    'http://localhost:3000/src/main.js',
    'http://localhost:3000/src/musicService.js',
    'http://localhost:3000/src/visualizer.js',
    'http://localhost:3000/manifest.json',
    'http://localhost:3000/sw.js',
    'http://localhost:3000/pulse-logo.png'
]

all_ok = True
for u in urls:
    try:
        res = urllib.request.urlopen(u, timeout=5)
        status = res.getcode()
        ctype = res.headers.get('Content-Type')
        print(f'[OK {status}] {u} -> {ctype}')
    except Exception as e:
        all_ok = False
        print(f'[FAIL] {u} -> {e}')

assert all_ok, 'Some URLs failed to load'
print('\nAll endpoints verified successfully!')
