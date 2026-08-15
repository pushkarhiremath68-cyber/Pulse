import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(ROOT, 'server.py'), 'r', encoding='utf-8') as f:
    orig = f.read()

# Extract TOP_SONGS section
top_songs_match = re.search(r'TOP_SONGS = \[(.*?)\]\s*\n\ndef get_track_lock', orig, re.DOTALL)
if not top_songs_match:
    print("Could not find TOP_SONGS block")
    exit(1)

raw_top_songs = top_songs_match.group(1)
entries = re.findall(r'\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*(?:"([^"]+)"|None)\s*\)', raw_top_songs)

# Keep track of unique valid YT IDs only
seen_yt = set()
clean_entries = []
for tid, title, artist, ytid in entries:
    if ytid and ytid != 'None' and ytid not in seen_yt:
        seen_yt.add(ytid)
        clean_entries.append((tid, title, artist, f'"{ytid}"'))
    else:
        clean_entries.append((tid, title, artist, 'None'))

print(f"Cleaned {len(clean_entries)} TOP_SONGS entries. Unique YT IDs: {len(seen_yt)}")

formatted_top_songs = "TOP_SONGS = [\n"
for tid, title, artist, ytid in clean_entries:
    formatted_top_songs += f'    ("{tid}", "{title}", "{artist}", {ytid}),\n'
formatted_top_songs += "]\n"

new_engine_code = '''
def get_track_lock(track_id):
    with GLOBAL_LOCK:
        if track_id not in DOWNLOAD_LOCKS:
            DOWNLOAD_LOCKS[track_id] = threading.Lock()
        return DOWNLOAD_LOCKS[track_id]

def find_local_audio_file(track_id):
    """Finds an existing audio file for track_id in storage/music/"""
    if not track_id:
        return None
    for ext in ['.m4a', '.mp3', '.webm', '.ogg', '.wav', '.mp4']:
        p = os.path.join(MUSIC_DIR, f"{track_id}{ext}")
        if os.path.exists(p) and os.path.getsize(p) > 50000:
            return p
    return None

def clean_query_string(q):
    if not q:
        return ''
    clean = re.sub(r'[\(\)\[\]\{\}\"\'\|]', ' ', q)
    parts = clean.split(',')
    if len(parts) > 1:
        clean = parts[0].strip() + ' ' + parts[1].strip().split('&')[0].strip()
    return re.sub(r'\s+', ' ', clean).strip()

def fetch_itunes_master_audio(query, track_id):
    """Fetches high-quality official master audio with authentic vocals from iTunes/Apple Music CDN"""
    if not query:
        return None
    try:
        clean_q = clean_query_string(query)
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(clean_q)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            results = data.get('results', [])
            if results:
                preview_url = results[0].get('previewUrl')
                if preview_url:
                    dest = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
                    req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req_audio, timeout=6) as a_resp:
                        with open(dest, 'wb') as f:
                            f.write(a_resp.read())
                    if os.path.exists(dest) and os.path.getsize(dest) > 50000:
                        print(f"[Pulse Master Audio] Saved '{track_id}' from iTunes: {results[0].get('trackName')} by {results[0].get('artistName')}")
                        return dest
    except Exception as e:
        print(f"[Pulse Master Audio Notice] {query}: {e}")
    return None

def ensure_audio_file(yt_id=None, query=None, track_id=None, preview_url=None):
    """
    Ensures an audio file exists in storage/music/.
    1. Checks local cache
    2. Downloads direct preview_url if provided
    3. Fetches official master audio from iTunes
    4. Downloads via yt_dlp if available
    """
    if yt_id in ('', 'null', 'undefined', 'None'):
        yt_id = None
    if query in ('', 'null', 'undefined', 'None'):
        query = None
    if track_id in ('', 'null', 'undefined', 'None'):
        track_id = None
    if preview_url in ('', 'null', 'undefined', 'None'):
        preview_url = None

    if not track_id:
        if yt_id:
            track_id = f"yt-{yt_id}"
        elif query:
            safe_slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')[:50]
            track_id = f"q-{safe_slug}"
        else:
            return None

    # Fast check local storage
    existing = find_local_audio_file(track_id)
    if existing:
        return existing

    lock = get_track_lock(track_id)
    with lock:
        existing = find_local_audio_file(track_id)
        if existing:
            return existing

        # Tier 1: If preview_url is supplied directly, download and save
        if preview_url and preview_url.startswith('http'):
            try:
                dest = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
                req_audio = urllib.request.Request(preview_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req_audio, timeout=6) as a_resp:
                    with open(dest, 'wb') as f:
                        f.write(a_resp.read())
                if os.path.exists(dest) and os.path.getsize(dest) > 50000:
                    return dest
            except Exception:
                pass

        # Tier 2: Fetch official master audio via iTunes search
        search_target = query or track_id.replace('in-', '').replace('en-', '').replace('te-', '').replace('kn-', '').replace('pj-', '').replace('gu-', '').replace('mr-', '').replace('-', ' ')
        master_audio = fetch_itunes_master_audio(search_target, track_id)
        if master_audio:
            return master_audio

        # Tier 3: Attempt yt_dlp if configured
        if yt_dlp:
            target = None
            if yt_id and len(yt_id) == 11 and ' ' not in yt_id:
                target = f"https://www.youtube.com/watch?v={yt_id}"
            elif query:
                cleaned = clean_query_string(query)
                target = f"{cleaned} official audio"
            elif track_id:
                cleaned_id = track_id.replace('in-', '').replace('en-', '').replace('itunes-', '').replace('-', ' ')
                target = f"{cleaned_id} official song"

            if target:
                out_tmpl = os.path.join(MUSIC_DIR, f"{track_id}.%(ext)s")
                ydl_opts = {
                    'format': 'bestaudio/best',
                    'outtmpl': out_tmpl,
                    'quiet': True,
                    'no_warnings': True,
                    'noplaylist': True,
                    'default_search': 'ytsearch1:',
                    'socket_timeout': 8,
                    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
                }
                try:
                    t0 = time.time()
                    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                        ydl.download([target])
                    f = find_local_audio_file(track_id)
                    if f:
                        print(f"[Pulse Audio Engine] Downloaded '{track_id}' in {time.time()-t0:.2f}s -> {os.path.basename(f)}")
                        return f
                except Exception as e:
                    print(f"[Pulse Download Notice] '{target}' notice: {e}")

        # Final attempt: secondary query variations on iTunes
        if query:
            words = query.split()
            if len(words) > 1:
                short_q = " ".join(words[:2])
                m_audio = fetch_itunes_master_audio(short_q, track_id)
                if m_audio:
                    return m_audio

        return None
'''

# Replace TOP_SONGS and engine in server.py
prefix = orig[:top_songs_match.start()]
suffix_match = re.search(r'def serve_local_audio\(handler, file_path\):', orig)
if not suffix_match:
    print("Could not find serve_local_audio")
    exit(1)
suffix = orig[suffix_match.start():]

# Update do_GET in suffix to support previewUrl and fallback 302
updated_suffix = suffix.replace(
'''        # API: Audio Stream Endpoint (/api/stream)
        if path == '/api/stream':
            yt_id = params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            track_id = params.get('id', [None])[0]

            audio_file = ensure_audio_file(yt_id=yt_id, query=query, track_id=track_id)
            if audio_file:
                serve_local_audio(self, audio_file)
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Audio track could not be loaded.')
            return''',
'''        # API: Audio Stream Endpoint (/api/stream)
        if path == '/api/stream':
            yt_id = params.get('ytId', [None])[0]
            query = params.get('q', [None])[0]
            track_id = params.get('id', [None])[0]
            preview_url = params.get('previewUrl', [None])[0]

            audio_file = ensure_audio_file(yt_id=yt_id, query=query, track_id=track_id, preview_url=preview_url)
            if audio_file and os.path.exists(audio_file):
                serve_local_audio(self, audio_file)
            elif preview_url and preview_url.startswith('http'):
                self.send_response(302)
                self.send_header('Location', preview_url)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
            elif query:
                try:
                    it_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
                    it_req = urllib.request.Request(it_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(it_req, timeout=3) as it_resp:
                        it_data = json.loads(it_resp.read().decode('utf-8'))
                        if it_data.get('results') and it_data['results'][0].get('previewUrl'):
                            direct_url = it_data['results'][0]['previewUrl']
                            self.send_response(302)
                            self.send_header('Location', direct_url)
                            self.send_header('Access-Control-Allow-Origin', '*')
                            self.end_headers()
                            return
                except Exception:
                    pass
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Audio track could not be loaded.')
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Audio track could not be loaded.')
            return'''
)

new_server_content = prefix + formatted_top_songs + new_engine_code + "\n" + updated_suffix

with open(os.path.join(ROOT, 'server.py'), 'w', encoding='utf-8') as f:
    f.write(new_server_content)

print("Successfully updated server.py with multi-tier vocal audio engine!")
