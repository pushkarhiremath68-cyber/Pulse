import urllib.request
import urllib.parse
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')

# Download full length Espresso
# Let's search Archive.org for 'Sabrina Carpenter Espresso' specific release
url = "https://archive.org/advancedsearch.php?q=Sabrina+Carpenter+Espresso+AND+mediatype%3Aaudio&fl[]=identifier,title,mediatype,publicdate&sort[]=downloads+desc&output=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        docs = data.get('response', {}).get('docs', [])
        print(f"Found {len(docs)} items for Espresso")
        for d in docs:
            ident = d.get('identifier')
            print("Checking:", ident, d.get('title'))
            meta_url = f"https://archive.org/metadata/{ident}"
            m_req = urllib.request.Request(meta_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(m_req, timeout=8) as m_resp:
                m_data = json.loads(m_resp.read().decode())
                files = m_data.get('files', [])
                for f in files:
                    fn = f.get('name', '')
                    sz = int(f.get('size', 0) or 0)
                    # Look for espresso mp3/m4a with size between 2.5MB and 15MB (approx 3 min track)
                    if (fn.endswith('.mp3') or fn.endswith('.m4a')) and 2500000 <= sz <= 20000000 and 'espresso' in fn.lower():
                        dl_url = f"https://archive.org/download/{ident}/{urllib.parse.quote(fn)}"
                        print(f"Found full Espresso track: {fn} ({sz} bytes) -> {dl_url}")
                        target_path = os.path.join(MUSIC_DIR, 'en-espresso.mp3')
                        dl_req = urllib.request.Request(dl_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(dl_req, timeout=20) as dl_resp:
                            with open(target_path, 'wb') as out_f:
                                out_f.write(dl_resp.read())
                        print(f"SAVED FULL ESPRESSO to {target_path} ({os.path.getsize(target_path)} bytes)!")
                        # Also remove the 30s preview file en-espresso.m4a if exists
                        m4a_preview = os.path.join(MUSIC_DIR, 'en-espresso.m4a')
                        if os.path.exists(m4a_preview):
                            os.remove(m4a_preview)
                            print(f"Removed 30s preview {m4a_preview}")
                        exit(0)
except Exception as e:
    print(f"Error: {e}")
