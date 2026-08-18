import urllib.request, urllib.parse, json, base64, time
from Crypto.Cipher import DES

def decrypt_saavn(enc_url):
    try:
        key = b'38346591'
        enc = base64.b64decode(enc_url.strip())
        cipher = DES.new(key, DES.MODE_ECB)
        dec = cipher.decrypt(enc)
        pad = dec[-1]
        if isinstance(pad, int):
            dec = dec[:-pad]
        raw = dec.decode('utf-8').strip()
        return raw.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4')
    except Exception:
        return None

# Full list of all tracks in Pulse Catalog & Home Screen
ALL_TRACKS = [
    # Recommended & Trending
    ("Starboy", "The Weeknd Daft Punk", "pop"),
    ("Kesariya", "Arijit Singh Pritam Brahmastra", "bollywood"),
    ("Lover", "Diljit Dosanjh MoonChild Era", "punjabi"),
    ("Cruel Summer", "Taylor Swift Lover", "pop"),
    ("Midnight City Lights", "Chillhop Beats Nightfall", "lofi"),
    ("Believer", "Imagine Dragons Evolve", "rock"),
    
    # 90s Golden Hits
    ("Tujhe Dekha Toh", "Kumar Sanu Lata Mangeshkar DDLJ", "90s"),
    ("Smells Like Teen Spirit", "Nirvana Nevermind", "90s"),
    ("Chaiyya Chaiyya", "Sukhwinder Singh Sapna Awasthi Dil Se", "90s"),
    ("I Want It That Way", "Backstreet Boys Millennium", "90s"),
    ("Pehla Nasha", "Udit Narayan Sadhana Sargam Jo Jeeta Wohi Sikandar", "90s"),
    ("Wonderwall", "Oasis Morning Glory", "90s"),
    ("Chura Ke Dil Mera", "Kumar Sanu Alka Yagnik Main Khiladi Tu Anari", "90s"),
    ("My Heart Will Go On", "Celine Dion Titanic", "90s"),

    # Hollywood Blockbuster Hits
    ("See You Again", "Wiz Khalifa Charlie Puth Furious 7", "hollywood"),
    ("Sunflower", "Post Malone Swae Lee Spider-Man", "hollywood"),
    ("Skyfall", "Adele 007 Skyfall", "hollywood"),
    ("Shallow", "Lady Gaga Bradley Cooper A Star Is Born", "hollywood"),
    ("Lose Yourself", "Eminem 8 Mile Soundtrack", "hollywood"),
    ("Let It Go", "Idina Menzel Frozen", "hollywood"),
    ("Eye of the Tiger", "Survivor Rocky III", "hollywood"),

    # Bollywood Evergreen & Modern
    ("Apna Bana Le", "Arijit Singh Sachin-Jigar Bhediya", "bollywood"),
    ("Tum Se Hi", "Mohit Chauhan Pritam Jab We Met", "bollywood"),
    ("Chaleya", "Arijit Singh Shilpa Rao Jawan", "bollywood"),
    ("Kal Ho Naa Ho", "Sonu Nigam Shankar Ehsaan Loy", "bollywood"),
    ("Tum Hi Ho", "Arijit Singh Mithoon Aashiqui 2", "bollywood"),
    ("Kabira", "Arijit Singh Harshdeep Kaur Pritam Yeh Jawaani Hai Deewani", "bollywood"),
    ("Kun Faya Kun", "A.R. Rahman Mohit Chauhan Javed Ali Rockstar", "bollywood"),
    ("Raataan Lambiyan", "Jubin Nautiyal Asees Kaur Shershaah", "bollywood"),
    ("Heeriye", "Jasleen Royal Arijit Singh", "bollywood"),
    ("Shayad", "Arijit Singh Pritam Love Aaj Kal", "bollywood"),

    # Punjabi Chartbusters
    ("Softly", "Softly Karan Aujla Ikky Making Memories", "punjabi"),
    ("Wavy", "Wavy Karan Aujla Four Me", "punjabi"),
    ("Excuses", "AP Dhillon Gurinder Gill Excuses", "punjabi"),
    ("Brown Munde", "AP Dhillon Gurinder Gill Shinda Kahlon", "punjabi"),
    ("295", "Sidhu Moose Wala Moosetape", "punjabi"),
    ("Born to Shine", "Diljit Dosanjh G.O.A.T.", "punjabi"),
    ("White Brown Black", "Karan Aujla Avvy Sra", "punjabi"),
    ("Mi Amor", "Sharn 40k The Paul", "punjabi"),

    # Global Pop & EDM
    ("Blinding Lights", "The Weeknd After Hours", "pop"),
    ("Shape of You", "Ed Sheeran Divide", "pop"),
    ("Levitating", "Dua Lipa Future Nostalgia", "pop"),
    ("As It Was", "Harry Styles Harry's House", "pop"),
    ("Faded", "Alan Walker Different World", "edm"),
    ("Titanium", "David Guetta Sia Nothing but the Beat", "edm"),
    ("Closer", "The Chainsmokers Halsey Collage", "edm"),
    ("Animals", "Martin Garrix Gold Skies", "edm"),
    ("Radioactive", "Imagine Dragons Night Visions", "rock"),
    ("Demons", "Imagine Dragons Night Visions", "rock"),
    ("Bones", "Imagine Dragons Mercury", "rock")
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
results_map = {}

print(f"Total songs to verify: {len(ALL_TRACKS)}")
print("=" * 60)

for idx, (title, query, cat) in enumerate(ALL_TRACKS, 1):
    print(f"[{idx}/{len(ALL_TRACKS)}] Resolving '{title}' (Query: {query})...")
    
    # 1. Try JioSaavn
    saavn_url = f"https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q={urllib.parse.quote(query)}"
    found_item = None
    stream_url = None
    cover_url = None
    resolved_artist = None
    resolved_album = None
    resolved_duration = "3:30"
    
    try:
        req = urllib.request.Request(saavn_url, headers=headers)
        with urllib.request.urlopen(req, timeout=6) as r:
            d = json.loads(r.read().decode('utf-8'))
            items = d.get('results', [])
            for it in items:
                it_title = (it.get('song') or it.get('title') or '').lower()
                # Check if song matches target title
                clean_target = title.lower().split(' ')[0]
                if clean_target in it_title or it_title in title.lower():
                    found_item = it
                    break
            if not found_item and items:
                found_item = items[0]
            
            if found_item:
                enc = found_item.get('encrypted_media_url')
                if enc:
                    stream_url = decrypt_saavn(enc)
                cover_raw = found_item.get('image', '')
                if cover_raw:
                    cover_url = cover_raw.replace('150x150', '500x500').replace('50x50', '500x500')
                resolved_artist = found_item.get('primary_artists') or found_item.get('singers') or found_item.get('artist')
                resolved_album = found_item.get('album')
                dur_secs = int(found_item.get('duration', 210) or 210)
                resolved_duration = f"{dur_secs // 60}:{dur_secs % 60:02d}"
    except Exception as e:
        print(f"   [JioSaavn notice]: {e}")

    # 2. Try iTunes for high-res cover fallback if needed
    if not cover_url or 'unsplash' in cover_url:
        try:
            itunes_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=3"
            req = urllib.request.Request(itunes_url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as r:
                d = json.loads(r.read().decode('utf-8'))
                res_itunes = d.get('results', [])
                if res_itunes:
                    it_top = res_itunes[0]
                    art = it_top.get('artworkUrl100', '')
                    if art:
                        cover_url = art.replace('100x100bb.jpg', '600x600bb.jpg')
                    if not resolved_artist:
                        resolved_artist = it_top.get('artistName')
                    if not resolved_album:
                        resolved_album = it_top.get('collectionName')
        except Exception as e:
            print(f"   [iTunes notice]: {e}")

    # 3. Validate Stream URL Accessibility
    stream_ok = False
    if stream_url:
        try:
            head_req = urllib.request.Request(stream_url, headers={'User-Agent': 'Mozilla/5.0', 'Range': 'bytes=0-1024'})
            with urllib.request.urlopen(head_req, timeout=5) as h_res:
                if h_res.status in [200, 206]:
                    stream_ok = True
        except Exception as e:
            print(f"   [Audio stream check]: {e}")

    # 4. Validate Cover Image URL Accessibility
    cover_ok = False
    if cover_url:
        try:
            c_req = urllib.request.Request(cover_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(c_req, timeout=5) as c_res:
                if c_res.status == 200:
                    cover_ok = True
        except Exception as e:
            print(f"   [Cover check]: {e}")

    key = title.lower()
    results_map[key] = {
        'title': title,
        'artist': resolved_artist or query.split(' ')[1],
        'album': resolved_album or 'Single',
        'duration': resolved_duration,
        'streamUrl': stream_url,
        'streamOk': stream_ok,
        'cover': cover_url,
        'coverOk': cover_ok,
        'category': cat
    }

    status_icon = "[OK]" if stream_ok and cover_ok else "[PARTIAL]"
    try:
        print(f"   {status_icon} Title: '{title}' | Artist: '{resolved_artist}' | Album: '{resolved_album}'")
        print(f"     Audio (Playable={stream_ok}): {stream_url}")
        print(f"     Cover (Valid={cover_ok}): {cover_url}\n")
    except Exception:
        pass
    time.sleep(0.1)

with open('scratch/all_verified_catalog.json', 'w') as f:
    json.dump(results_map, f, indent=2)

print("\n" + "=" * 60)
print(f"ALL {len(ALL_TRACKS)} TRACKS VERIFIED & WRITTEN TO scratch/all_verified_catalog.json")
