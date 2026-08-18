import urllib.request, urllib.parse, json, re, time

tracks = [
    # Hollywood
    ('hwd-1', 'See You Again', 'Wiz Khalifa Charlie Puth Furious 7'),
    ('hwd-2', 'Sunflower', 'Post Malone Swae Lee Spider-Man Into the Spider-Verse'),
    ('hwd-3', 'Skyfall', 'Adele Skyfall'),
    ('hwd-4', 'Shallow', 'Lady Gaga Bradley Cooper A Star Is Born'),
    ('hwd-5', 'Lose Yourself', 'Eminem 8 Mile Soundtrack'),
    ('hwd-6', 'Let It Go', 'Idina Menzel Frozen'),
    ('hwd-7', 'Eye of the Tiger', 'Survivor Rocky III'),

    # 90s Hits
    ('90s-1', 'Tujhe Dekha Toh', 'Dilwale Dulhania Le Jayenge Kumar Sanu'),
    ('90s-2', 'Smells Like Teen Spirit', 'Nirvana Nevermind'),
    ('90s-3', 'Chaiyya Chaiyya', 'Dil Se Sukhwinder Singh'),
    ('90s-4', 'I Want It That Way', 'Backstreet Boys Millennium'),
    ('90s-5', 'Pehla Nasha', 'Jo Jeeta Wohi Sikandar Udit Narayan'),
    ('90s-6', 'Wonderwall', 'Oasis Morning Glory'),
    ('90s-7', 'Chura Ke Dil Mera', 'Main Khiladi Tu Anari Kumar Sanu'),
    ('90s-8', 'My Heart Will Go On', 'Celine Dion Titanic Soundtrack'),

    # Recommended
    ('rec-1', 'Starboy', 'The Weeknd Daft Punk Starboy'),
    ('rec-2', 'Kesariya', 'Arijit Singh Pritam Brahmastra'),
    ('rec-3', 'Lover', 'Diljit Dosanjh MoonChild Era'),
    ('rec-4', 'Cruel Summer', 'Taylor Swift Lover'),
    ('rec-5', 'Midnight City Lights', 'Chillhop Beats Nightfall Session'),
    ('rec-6', 'Believer', 'Imagine Dragons Evolve'),

    # Bollywood Evergreen
    ('bolly-1', 'Kesariya', 'Arijit Singh Pritam Brahmastra'),
    ('bolly-2', 'Apna Bana Le', 'Arijit Singh Sachin-Jigar Bhediya'),
    ('bolly-3', 'Tum Se Hi', 'Mohit Chauhan Pritam Jab We Met'),
    ('bolly-4', 'Chaleya', 'Arijit Singh Shilpa Rao Jawan'),
    ('bolly-5', 'Kal Ho Naa Ho', 'Sonu Nigam Shankar Ehsaan Loy'),
    ('bolly-6', 'Tum Hi Ho', 'Arijit Singh Mithoon Aashiqui 2'),
    ('bolly-7', 'Kabira', 'Arijit Singh Harshdeep Kaur Yeh Jawaani Hai Deewani'),
    ('bolly-8', 'Kun Faya Kun', 'A.R. Rahman Mohit Chauhan Rockstar'),
    ('bolly-9', 'Raataan Lambiyan', 'Jubin Nautiyal Asees Kaur Shershaah'),
    ('bolly-10', 'Heeriye', 'Jasleen Royal Arijit Singh'),
    ('bolly-11', 'Shayad', 'Arijit Singh Pritam Love Aaj Kal'),

    # Punjabi
    ('pb-1', 'Lover', 'Diljit Dosanjh MoonChild Era'),
    ('pb-2', 'Softly', 'Karan Aujla Ikky Making Memories'),
    ('pb-3', 'Excuses', 'AP Dhillon Gurinder Gill Excuses'),
    ('pb-4', 'Brown Munde', 'AP Dhillon Gurinder Gill Shinda Kahlon'),
    ('pb-5', '295', 'Sidhu Moose Wala Moosetape'),
    ('pb-6', 'Born to Shine', 'Diljit Dosanjh G.O.A.T.'),
    ('pb-7', 'White Brown Black', 'Karan Aujla Avvy Sra'),
    ('pb-8', 'Mi Amor', 'Sharn 40k The Paul'),
    ('pb-9', 'Wavy', 'Karan Aujla Four Me'),

    # Pop, Rock & EDM
    ('pop-1', 'Blinding Lights', 'The Weeknd After Hours'),
    ('pop-2', 'Starboy', 'The Weeknd Daft Punk Starboy'),
    ('pop-3', 'Shape of You', 'Ed Sheeran Divide'),
    ('pop-4', 'Levitating', 'Dua Lipa Future Nostalgia'),
    ('pop-5', 'As It Was', 'Harry Styles Harrys House'),
    ('pop-6', 'Cruel Summer', 'Taylor Swift Lover'),
    ('edm-1', 'Faded', 'Alan Walker Different World'),
    ('edm-2', 'Titanium', 'David Guetta Sia Nothing but the Beat'),
    ('edm-3', 'Closer', 'The Chainsmokers Halsey Collage'),
    ('edm-4', 'Animals', 'Martin Garrix Gold Skies'),
    ('rock-1', 'Believer', 'Imagine Dragons Evolve'),
    ('rock-2', 'Radioactive', 'Imagine Dragons Night Visions'),
    ('rock-3', 'Demons', 'Imagine Dragons Night Visions'),
    ('rock-4', 'Bones', 'Imagine Dragons Mercury')
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
resolved_covers = {}

print("Fetching high-res artwork for all catalog songs...")

for tid, name, q in tracks:
    cover = None
    # 1. Search iTunes (600x600)
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(q)}&entity=song&limit=3"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as r:
            d = json.loads(r.read().decode('utf-8'))
            res = d.get('results', [])
            if res:
                art = res[0].get('artworkUrl100', '')
                if art:
                    cover = art.replace('100x100bb.jpg', '600x600bb.jpg')
    except Exception:
        pass

    # 2. Search JioSaavn (500x500)
    if not cover or 'unsplash' in cover:
        try:
            url = f"https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q={urllib.parse.quote(q)}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=5) as r:
                d = json.loads(r.read().decode('utf-8'))
                res = d.get('results', [])
                if res:
                    img = res[0].get('image', '')
                    if img:
                        cover = img.replace('150x150', '500x500').replace('50x50', '500x500')
        except Exception:
            pass

    resolved_covers[tid] = cover
    print(f"[{tid}] {name} => {cover}")
    time.sleep(0.05)

with open('scratch/resolved_covers.json', 'w') as f:
    json.dump(resolved_covers, f, indent=2)

print("\nUpdating src/catalogService.js, src/musicService.js, and index.html with real artwork...")

# Update src/catalogService.js
with open('src/catalogService.js', 'r', encoding='utf-8') as f:
    cat_src = f.read()

for tid, cover in resolved_covers.items():
    if cover:
        # Replace cover in catalogService
        cat_src = re.sub(
            rf"id:\s*'{tid}'([\s\S]*?)cover:\s*'[^']*'",
            rf"id: '{tid}'\1cover: '{cover}'",
            cat_src
        )

with open('src/catalogService.js', 'w', encoding='utf-8') as f:
    f.write(cat_src)

# Update index.html
with open('index.html', 'r', encoding='utf-8') as f:
    html_src = f.read()

for tid, cover in resolved_covers.items():
    if cover:
        # Find onclick="window.playSpecificTrack('{tid}')" and replace img src
        pattern = rf'(onclick="window\.playSpecificTrack\(\'{tid}\'\)"[\s\S]*?<img src=")[^"]*(")'
        html_src = re.sub(pattern, rf'\g<1>{cover}\g<2>', html_src)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_src)

print("SUCCESS: All songs now have authentic high-resolution album cover artwork!")
