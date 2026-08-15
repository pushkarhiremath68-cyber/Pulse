import urllib.request
import urllib.parse
import json
import os

q = "Sabrina Carpenter Espresso"
url = f"https://archive.org/advancedsearch.php?q={urllib.parse.quote(q)}+AND+mediatype:(audio)&fl[]=identifier,title,mediatype&output=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=5) as resp:
        data = json.loads(resp.read().decode())
        docs = data.get('response', {}).get('docs', [])
        print(f"Found {len(docs)} audio docs on Archive.org:")
        for d in docs[:5]:
            ident = d.get('identifier')
            print("  Item:", ident, "-", d.get('title'))
            # Get files for identifier
            meta_url = f"https://archive.org/metadata/{ident}"
            meta_req = urllib.request.Request(meta_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(meta_req, timeout=5) as m_resp:
                m_data = json.loads(m_resp.read().decode())
                files = m_data.get('files', [])
                audio_files = [f for f in files if f.get('name', '').endswith('.mp3') or f.get('name', '').endswith('.m4a')]
                for af in audio_files:
                    af_name = af.get('name')
                    download_url = f"https://archive.org/download/{ident}/{urllib.parse.quote(af_name)}"
                    size = af.get('size')
                    print(f"    -> {af_name} ({size} bytes): {download_url}")
                    if int(size or 0) > 2000000:
                        # Download full Espresso
                        dest = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music', 'en-espresso.mp3')
                        print(f"    Downloading full track to {dest}...")
                        dl_req = urllib.request.Request(download_url, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(dl_req, timeout=15) as dl_resp:
                            with open(dest, 'wb') as out_f:
                                out_f.write(dl_resp.read())
                        print(f"    SUCCESS! Saved full Espresso ({os.path.getsize(dest)} bytes, ~{os.path.getsize(dest)/(1024*1024):.2f}MB)")
                        exit(0)
except Exception as e:
    print(f"Archive.org search error: {e}")
