import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')
INDEX_PATH = os.path.join(ROOT, 'index.html')

KANNADA_AND_AUJLA_SONGS = [
    # --- TOP KANNADA SONGS (SANDALWOOD BLOCKBUSTERS) ---
    {
        "id": "kn-singara-siriye",
        "title": "Singara Siriye",
        "artist": "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath",
        "album": "Kantara",
        "duration": "4:42",
        "category": "romantic",
        "ytId": "2kL3Wn6Jq1E",
        "ytSearchQuery": "Singara Siriye Kantara Kannada Vijay Prakash",
        "storagePath": "kn-singara-siriye.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-varaha-roopam",
        "title": "Varaha Roopam Daiva Va Rishtam",
        "artist": "Sai Vignesh, B. Ajaneesh Loknath",
        "album": "Kantara",
        "duration": "4:36",
        "category": "trending",
        "ytId": "b1K_e_6d8wM",
        "ytSearchQuery": "Varaha Roopam Kantara Sai Vignesh Kannada",
        "storagePath": "kn-varaha-roopam.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-toofan-kgf2",
        "title": "Toofan",
        "artist": "Ravi Basrur, Santhosh Venky",
        "album": "KGF: Chapter 2",
        "duration": "3:40",
        "category": "party",
        "ytId": "vWbK4tJ_6qU",
        "ytSearchQuery": "Toofan KGF Chapter 2 Kannada Ravi Basrur",
        "storagePath": "kn-toofan-kgf2.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-sulthana-kgf2",
        "title": "Sulthana",
        "artist": "Ravi Basrur, Mohan Krishna",
        "album": "KGF: Chapter 2",
        "duration": "3:47",
        "category": "trending",
        "ytId": "z1k8m5w9q_0",
        "ytSearchQuery": "Sulthana KGF Chapter 2 Kannada Ravi Basrur",
        "storagePath": "kn-sulthana-kgf2.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-mehabooba-kgf2",
        "title": "Mehabooba",
        "artist": "Ananya Bhat, Ravi Basrur",
        "album": "KGF: Chapter 2",
        "duration": "3:37",
        "category": "romantic",
        "ytId": "5m8k1v4j9q0",
        "ytSearchQuery": "Mehabooba KGF Chapter 2 Kannada Ananya Bhat",
        "storagePath": "kn-mehabooba-kgf2.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-salaam-rocky-bhai",
        "title": "Salaam Rocky Bhai",
        "artist": "Vijay Prakash, Santhosh Venky, Ravi Basrur",
        "album": "KGF: Chapter 1",
        "duration": "4:05",
        "category": "party",
        "ytId": "7wF3v6K9m10",
        "ytSearchQuery": "Salaam Rocky Bhai KGF Chapter 1 Kannada",
        "storagePath": "kn-salaam-rocky-bhai.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-ra-ra-rakkamma",
        "title": "Ra Ra Rakkamma",
        "artist": "Sunidhi Chauhan, Nakash Aziz, B. Ajaneesh Loknath",
        "album": "Vikrant Rona",
        "duration": "3:45",
        "category": "party",
        "ytId": "1_w7o9-UBTQ",
        "ytSearchQuery": "Ra Ra Rakkamma Vikrant Rona Kannada Sunidhi Chauhan",
        "storagePath": "kn-ra-ra-rakkamma.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-belageddu",
        "title": "Belageddu",
        "artist": "Vijay Prakash, B. Ajaneesh Loknath",
        "album": "Kirik Party",
        "duration": "3:32",
        "category": "trending",
        "ytId": "8g76Z8Y8j8Y",
        "ytSearchQuery": "Belageddu Kirik Party Vijay Prakash Kannada song",
        "storagePath": "kn-belageddu.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-anisuthide",
        "title": "Anisuthide Yaako Indu",
        "artist": "Sonu Nigam, Mano Murthy",
        "album": "Mungaru Male",
        "duration": "5:12",
        "category": "romantic",
        "ytId": "6x0s8m7v1q0",
        "ytSearchQuery": "Anisuthide Mungaru Male Sonu Nigam Kannada song",
        "storagePath": "kn-anisuthide.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-mungaru-maleye",
        "title": "Mungaru Maleye",
        "artist": "Sonu Nigam, Mano Murthy",
        "album": "Mungaru Male",
        "duration": "4:56",
        "category": "romantic",
        "ytId": "p6t1d8z3y84",
        "ytSearchQuery": "Mungaru Maleye Sonu Nigam Kannada original",
        "storagePath": "kn-mungaru-maleye.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-pasandaagavne",
        "title": "Pasandaagavne",
        "artist": "V. Harikrishna, Mangli",
        "album": "Kaatera",
        "duration": "3:50",
        "category": "party",
        "ytId": "d4OuBCUSp-E",
        "ytSearchQuery": "Pasandaagavne Kaatera Darshan V Harikrishna Kannada",
        "storagePath": "kn-pasandaagavne.mp3",
        "source": "Sandalwood Hits"
    },
    {
        "id": "kn-tagaru-banthu",
        "title": "Tagaru Banthu Tagaru",
        "artist": "Anthony Daasan, Charan Raj",
        "album": "Tagaru",
        "duration": "3:58",
        "category": "party",
        "ytId": "2m8v6k4j10w",
        "ytSearchQuery": "Tagaru Banthu Tagaru Anthony Daasan Kannada",
        "storagePath": "kn-tagaru-banthu.mp3",
        "source": "Sandalwood Hits"
    },

    # --- KARAN AUJLA TOP PUNJABI SUPERHITS ---
    {
        "id": "pj-softly-karan-aujla",
        "title": "Softly",
        "artist": "Karan Aujla, Ikky",
        "album": "Making Memories",
        "duration": "2:36",
        "category": "trending",
        "ytId": "cWMxCE2HTag",
        "ytSearchQuery": "Softly Karan Aujla Ikky Making Memories official",
        "storagePath": "pj-softly-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-admiring-you-karan-aujla",
        "title": "Admiring You",
        "artist": "Karan Aujla ft. Preston Pablo, Ikky",
        "album": "Making Memories",
        "duration": "3:34",
        "category": "trending",
        "ytId": "k4A3N-qF4pE",
        "ytSearchQuery": "Admiring You Karan Aujla Preston Pablo Ikky",
        "storagePath": "pj-admiring-you-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-winning-speech-karan-aujla",
        "title": "Winning Speech",
        "artist": "Karan Aujla, Mxrci",
        "album": "Winning Speech",
        "duration": "3:24",
        "category": "trending",
        "ytId": "6Pky_vXh_sQ",
        "ytSearchQuery": "Winning Speech Karan Aujla Mxrci official audio",
        "storagePath": "pj-winning-speech-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-52-bars-karan-aujla",
        "title": "52 Bars",
        "artist": "Karan Aujla, Ikky",
        "album": "Four Me",
        "duration": "3:40",
        "category": "party",
        "ytId": "1w7x_k9m_4g",
        "ytSearchQuery": "52 Bars Karan Aujla Ikky Four Me official audio",
        "storagePath": "pj-52-bars-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-white-brown-black-karan-aujla",
        "title": "White Brown Black",
        "artist": "Karan Aujla, Avvy Sra, Jaani",
        "album": "White Brown Black",
        "duration": "3:02",
        "category": "trending",
        "ytId": "n8x_w1m8q0c",
        "ytSearchQuery": "White Brown Black Karan Aujla Avvy Sra",
        "storagePath": "pj-white-brown-black-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-on-top-karan-aujla",
        "title": "On Top",
        "artist": "Karan Aujla, Yeah Proof",
        "album": "On Top",
        "duration": "3:10",
        "category": "party",
        "ytId": "q10_gJg3wYQ",
        "ytSearchQuery": "On Top Karan Aujla Yeah Proof official audio",
        "storagePath": "pj-on-top-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-chithiyaan-karan-aujla",
        "title": "Chithiyaan",
        "artist": "Karan Aujla, Desi Crew",
        "album": "Chithiyaan",
        "duration": "3:45",
        "category": "romantic",
        "ytId": "7m9v1b4j80c",
        "ytSearchQuery": "Chithiyaan Karan Aujla Desi Crew official audio",
        "storagePath": "pj-chithiyaan-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-dont-look-karan-aujla",
        "title": "Don't Look",
        "artist": "Karan Aujla, Jay Trak",
        "album": "Don't Look",
        "duration": "3:28",
        "category": "trending",
        "ytId": "5h8j4c2m8q0",
        "ytSearchQuery": "Don't Look Karan Aujla Jay Trak official audio",
        "storagePath": "pj-dont-look-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-dont-worry-karan-aujla",
        "title": "Don't Worry",
        "artist": "Karan Aujla ft. Gurlez Akhtar, Deep Jandu",
        "album": "Don't Worry",
        "duration": "3:38",
        "category": "party",
        "ytId": "2kL3Wn6Jq1E",
        "ytSearchQuery": "Don't Worry Karan Aujla Gurlez Akhtar Deep Jandu",
        "storagePath": "pj-dont-worry-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-mexico-karan-aujla",
        "title": "Mexico",
        "artist": "Karan Aujla, Sukhe Muzical Doctorz",
        "album": "Mexico",
        "duration": "3:16",
        "category": "party",
        "ytId": "W7M60N7w_Z0",
        "ytSearchQuery": "Mexico Karan Aujla Sukhe official audio",
        "storagePath": "pj-mexico-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-bachke-bachke-karan-aujla",
        "title": "Bachke Bachke",
        "artist": "Karan Aujla, Yasser Desai, Ikky",
        "album": "Making Memories",
        "duration": "3:30",
        "category": "trending",
        "ytId": "8p5t8Z5Q9a4",
        "ytSearchQuery": "Bachke Bachke Karan Aujla Ikky Yasser Desai",
        "storagePath": "pj-bachke-bachke-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-players-karan-aujla",
        "title": "Players",
        "artist": "Badshah, Karan Aujla, Devika Badyal",
        "album": "3:00 AM Sessions",
        "duration": "2:52",
        "category": "party",
        "ytId": "p6t1d12c_1Y",
        "ytSearchQuery": "Players Badshah Karan Aujla official audio",
        "storagePath": "pj-players-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-jee-ni-lagda-karan-aujla",
        "title": "Jee Ni Lagda",
        "artist": "Karan Aujla, Deep Jandu",
        "album": "Making Memories",
        "duration": "2:30",
        "category": "romantic",
        "ytId": "X1b9d4v6m80",
        "ytSearchQuery": "Jee Ni Lagda Karan Aujla Making Memories",
        "storagePath": "pj-jee-ni-lagda-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-wytb-karan-aujla",
        "title": "WYTB (What You Talking Bout)",
        "artist": "Karan Aujla, Gurlez Akhtar, Ikky",
        "album": "Four Me",
        "duration": "2:46",
        "category": "party",
        "ytId": "vK5E_7Ev_t4",
        "ytSearchQuery": "WYTB What You Talking Bout Karan Aujla Gurlez Akhtar",
        "storagePath": "pj-wytb-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    },
    {
        "id": "pj-antidote-karan-aujla",
        "title": "Antidote",
        "artist": "Karan Aujla, Ikky",
        "album": "Making Memories",
        "duration": "3:18",
        "category": "trending",
        "ytId": "eypZt3m8sJ0",
        "ytSearchQuery": "Antidote Karan Aujla Ikky Making Memories",
        "storagePath": "pj-antidote-karan-aujla.mp3",
        "source": "Karan Aujla Hits"
    }
]

print(f"Preparing to append {len(KANNADA_AND_AUJLA_SONGS)} tracks (Kannada hits & Karan Aujla hits)...")

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', code))
print(f"Existing tracks in catalog: {len(existing_ids)}")

to_add = [s for s in KANNADA_AND_AUJLA_SONGS if s['id'] not in existing_ids]
print(f"Unique new tracks to add: {len(to_add)}")

if to_add:
    new_track_blocks = []
    for s in to_add:
        cover_art = f"https://i.ytimg.com/vi/{s['ytId']}/hqdefault.jpg"
        block = f"""  {{
    "id": "{s['id']}",
    "title": "{s['title']}",
    "artist": "{s['artist']}",
    "album": "{s['album']}",
    "cover": "{cover_art}",
    "duration": "{s['duration']}",
    "category": "{s['category']}",
    "ytId": "{s['ytId']}",
    "ytSearchQuery": "{s['ytSearchQuery']}",
    "storagePath": "{s['storagePath']}",
    "source": "{s['source']}"
  }}"""
        new_track_blocks.append(block)

    appended_str = ",\n" + ",\n".join(new_track_blocks)
    end_marker = "].map(normalizeTrack);"
    idx = code.rfind(end_marker)
    if idx != -1:
        new_code = code[:idx].rstrip() + appended_str + "\n" + code[idx:]
        with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
            f.write(new_code)
        print(f"Successfully appended {len(to_add)} Kannada & Karan Aujla tracks to musicService.js!")
    else:
        print("Error: Could not locate end of DEMO_CATALOG")

# Update server.py TOP_SONGS
with open(SERVER_PATH, 'r', encoding='utf-8') as f:
    server_code = f.read()

top_tuples = []
for s in to_add:
    top_tuples.append(f'    ("{s["id"]}", "{s["title"]}", "{s["artist"].split(",")[0]}", "{s["ytId"]}"),')

top_str = "\n".join(top_tuples)
if "TOP_SONGS = [" in server_code:
    server_code = server_code.replace("TOP_SONGS = [", f"TOP_SONGS = [\n{top_str}")
    with open(SERVER_PATH, 'w', encoding='utf-8') as f:
        f.write(server_code)
    print("Updated server.py TOP_SONGS list!")

# Update index.html with quick explore pills for Kannada and Karan Aujla
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html_code = f.read()

if 'Karan Aujla' not in html_code:
    pills_target = '<button class="pill-btn" onclick="window.executeSearch(\'Sid Sriram Telugu\')">🐅 Sid Sriram (Telugu)</button>'
    pills_replacement = '<button class="pill-btn" onclick="window.executeSearch(\'Karan Aujla Punjabi Hits\')">🔥 Karan Aujla Hits</button>\n            <button class="pill-btn" onclick="window.executeSearch(\'Kannada Hits Kantara KGF\')">🌲 Kannada Hits (Sandalwood)</button>\n            ' + pills_target
    html_code = html_code.replace(pills_target, pills_replacement)
    
    # Add genre card for Kannada & Karan Aujla
    genre_target = '<div class="genre-card g-telugu" onclick="window.executeSearch(\'Telugu Superhits Pushpa RRR Devara\')"><span>Telugu / Tollywood</span></div>'
    genre_replacement = '<div class="genre-card g-kannada" onclick="window.executeSearch(\'Kannada Superhits Kantara KGF 2\')"><span>Kannada / Sandalwood</span></div>\n            <div class="genre-card g-punjabi" onclick="window.executeSearch(\'Karan Aujla Punjabi Hits Softly Tauba\')"><span>Karan Aujla Special</span></div>\n            ' + genre_target
    html_code = html_code.replace(genre_target, genre_replacement)

    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(html_code)
    print("Updated index.html with Kannada & Karan Aujla explore cards and search pills!")
