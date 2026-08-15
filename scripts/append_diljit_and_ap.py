import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
SERVER_PATH = os.path.join(ROOT, 'server.py')
INDEX_PATH = os.path.join(ROOT, 'index.html')

DILJIT_AND_AP_SONGS = [
    # --- DILJIT DOSANJH HITS ---
    {
        "id": "pj-lover-diljit",
        "title": "Lover",
        "artist": "Diljit Dosanjh, Intense",
        "album": "MoonChild Era",
        "duration": "3:02",
        "category": "trending",
        "ytId": "mH_LFkWxpI0",
        "ytSearchQuery": "Lover Diljit Dosanjh Intense MoonChild Era official audio",
        "storagePath": "pj-lover-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-goat-diljit",
        "title": "G.O.A.T.",
        "artist": "Diljit Dosanjh",
        "album": "G.O.A.T.",
        "duration": "3:43",
        "category": "party",
        "ytId": "cl0a3i2wFcc",
        "ytSearchQuery": "GOAT Diljit Dosanjh official audio",
        "storagePath": "pj-goat-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-born-to-shine",
        "title": "Born to Shine",
        "artist": "Diljit Dosanjh",
        "album": "G.O.A.T.",
        "duration": "3:32",
        "category": "party",
        "ytId": "4zJg8M1jG2w",
        "ytSearchQuery": "Born to Shine Diljit Dosanjh official audio",
        "storagePath": "pj-born-to-shine.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-clash-diljit",
        "title": "Clash",
        "artist": "Diljit Dosanjh",
        "album": "G.O.A.T.",
        "duration": "2:56",
        "category": "party",
        "ytId": "V14l0Vf3e80",
        "ytSearchQuery": "Clash Diljit Dosanjh official audio",
        "storagePath": "pj-clash-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-lemonade-diljit",
        "title": "Lemonade",
        "artist": "Diljit Dosanjh",
        "album": "Drive",
        "duration": "2:46",
        "category": "trending",
        "ytId": "Qv6j2b8m14c",
        "ytSearchQuery": "Lemonade Diljit Dosanjh official audio",
        "storagePath": "pj-lemonade-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-naina-crew",
        "title": "Naina",
        "artist": "Diljit Dosanjh, Badshah, Raj Ranjodh",
        "album": "Crew",
        "duration": "3:00",
        "category": "trending",
        "ytId": "8g76Z8Y8j8Y",
        "ytSearchQuery": "Naina Crew Diljit Dosanjh Badshah song",
        "storagePath": "pj-naina-crew.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-choli-ke-peeche-crew",
        "title": "Choli Ke Peeche",
        "artist": "Diljit Dosanjh, Ila Arun, Alka Yagnik, Akshay & IP",
        "album": "Crew",
        "duration": "2:54",
        "category": "party",
        "ytId": "p6t1d8z3y84",
        "ytSearchQuery": "Choli Ke Peeche Crew Diljit Dosanjh Kareena Kapoor",
        "storagePath": "pj-choli-ke-peeche-crew.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-do-you-know",
        "title": "Do You Know",
        "artist": "Diljit Dosanjh, B Praak, Jaani",
        "album": "Do You Know",
        "duration": "3:40",
        "category": "romantic",
        "ytId": "vK5E_7Ev_t4",
        "ytSearchQuery": "Do You Know Diljit Dosanjh Jaani B Praak",
        "storagePath": "pj-do-you-know.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-proper-patola",
        "title": "Proper Patola",
        "artist": "Diljit Dosanjh, Badshah, Astha Gill",
        "album": "Namaste England",
        "duration": "2:58",
        "category": "party",
        "ytId": "d4OuBCUSp-E",
        "ytSearchQuery": "Proper Patola Diljit Dosanjh Badshah",
        "storagePath": "pj-proper-patola.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-sauda-khara-khara",
        "title": "Sauda Khara Khara",
        "artist": "Diljit Dosanjh, Sukhbir, Dhvani Bhanushali",
        "album": "Good Newwz",
        "duration": "3:30",
        "category": "party",
        "ytId": "kJQP7kiw5Fk",
        "ytSearchQuery": "Sauda Khara Khara Good Newwz Diljit Dosanjh Sukhbir",
        "storagePath": "pj-sauda-khara-khara.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-vibe-diljit",
        "title": "Vibe",
        "artist": "Diljit Dosanjh, Intense",
        "album": "MoonChild Era",
        "duration": "2:37",
        "category": "trending",
        "ytId": "W7M60N7w_Z0",
        "ytSearchQuery": "Vibe Diljit Dosanjh Intense MoonChild Era",
        "storagePath": "pj-vibe-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-peaches-diljit",
        "title": "Peaches",
        "artist": "Diljit Dosanjh, Intense",
        "album": "Drive",
        "duration": "3:10",
        "category": "trending",
        "ytId": "8p5t8Z5Q9a4",
        "ytSearchQuery": "Peaches Diljit Dosanjh Intense official audio",
        "storagePath": "pj-peaches-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-hass-hass-diljit",
        "title": "Hass Hass",
        "artist": "Diljit Dosanjh x Sia",
        "album": "Hass Hass",
        "duration": "2:33",
        "category": "trending",
        "ytId": "k3g_WjLCsXM",
        "ytSearchQuery": "Hass Hass Diljit Dosanjh Sia official audio",
        "storagePath": "pj-hass-hass-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-kinni-kinni-diljit",
        "title": "Kinni Kinni",
        "artist": "Diljit Dosanjh",
        "album": "Ghost",
        "duration": "3:24",
        "category": "trending",
        "ytId": "2m8v6k4j10w",
        "ytSearchQuery": "Kinni Kinni Diljit Dosanjh Ghost official audio",
        "storagePath": "pj-kinni-kinni-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-case-diljit",
        "title": "Case",
        "artist": "Diljit Dosanjh",
        "album": "Ghost",
        "duration": "3:05",
        "category": "party",
        "ytId": "V_m5n8f2z4c",
        "ytSearchQuery": "Case Diljit Dosanjh Ghost official audio",
        "storagePath": "pj-case-diljit.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-5-taara",
        "title": "5 Taara",
        "artist": "Diljit Dosanjh, Jatinder Shah",
        "album": "5 Taara",
        "duration": "3:07",
        "category": "party",
        "ytId": "5h8j4c2m8q0",
        "ytSearchQuery": "5 Taara Diljit Dosanjh official audio",
        "storagePath": "pj-5-taara.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-laembadgini",
        "title": "Laembadgini",
        "artist": "Diljit Dosanjh, Jatinder Shah, Veet Baljit",
        "album": "Laembadgini",
        "duration": "3:35",
        "category": "party",
        "ytId": "6x0s8m7v1q0",
        "ytSearchQuery": "Laembadgini Diljit Dosanjh official audio",
        "storagePath": "pj-laembadgini.mp3",
        "source": "Diljit Dosanjh Superhits"
    },
    {
        "id": "pj-raat-di-gedi",
        "title": "Raat Di Gedi",
        "artist": "Diljit Dosanjh, Jatinder Shah, Ranbir Singh",
        "album": "Raat Di Gedi",
        "duration": "3:58",
        "category": "party",
        "ytId": "X1b9d4v6m80",
        "ytSearchQuery": "Raat Di Gedi Diljit Dosanjh official audio",
        "storagePath": "pj-raat-di-gedi.mp3",
        "source": "Diljit Dosanjh Superhits"
    },

    # --- AP DHILLON HITS ---
    {
        "id": "pj-excuses-ap",
        "title": "Excuses",
        "artist": "AP Dhillon, Gurinder Gill, Intense",
        "album": "Excuses",
        "duration": "2:56",
        "category": "trending",
        "ytId": "vX2cDW8up2g",
        "ytSearchQuery": "Excuses AP Dhillon Gurinder Gill Intense Kehndi Hundi Si",
        "storagePath": "pj-excuses-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-insane-ap",
        "title": "Insane",
        "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        "album": "Insane",
        "duration": "3:24",
        "category": "party",
        "ytId": "4zJg8M1jG2w",
        "ytSearchQuery": "Insane AP Dhillon Gurinder Gill Shinda Kahlon",
        "storagePath": "pj-insane-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-with-you-ap",
        "title": "With You",
        "artist": "AP Dhillon",
        "album": "With You",
        "duration": "2:34",
        "category": "romantic",
        "ytId": "Qv6j2b8m14c",
        "ytSearchQuery": "With You AP Dhillon official audio",
        "storagePath": "pj-with-you-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-summer-high-ap",
        "title": "Summer High",
        "artist": "AP Dhillon",
        "album": "Summer High",
        "duration": "2:57",
        "category": "trending",
        "ytId": "W7M60N7w_Z0",
        "ytSearchQuery": "Summer High AP Dhillon official audio",
        "storagePath": "pj-summer-high-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-dil-nu-ap",
        "title": "Dil Nu",
        "artist": "AP Dhillon, Shinda Kahlon",
        "album": "Two Hearts Never Break the Same",
        "duration": "3:58",
        "category": "romantic",
        "ytId": "8p5t8Z5Q9a4",
        "ytSearchQuery": "Dil Nu AP Dhillon Shinda Kahlon official audio",
        "storagePath": "pj-dil-nu-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-toxic-ap",
        "title": "Toxic",
        "artist": "AP Dhillon",
        "album": "Toxic",
        "duration": "2:46",
        "category": "trending",
        "ytId": "2m8v6k4j10w",
        "ytSearchQuery": "Toxic AP Dhillon official audio",
        "storagePath": "pj-toxic-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-woh-noor-ap",
        "title": "Wo Noor",
        "artist": "AP Dhillon",
        "album": "Two Hearts Never Break the Same",
        "duration": "3:20",
        "category": "romantic",
        "ytId": "V_m5n8f2z4c",
        "ytSearchQuery": "Wo Noor AP Dhillon official audio",
        "storagePath": "pj-woh-noor-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-true-stories-ap",
        "title": "True Stories",
        "artist": "AP Dhillon, Shinda Kahlon",
        "album": "True Stories",
        "duration": "2:40",
        "category": "party",
        "ytId": "5h8j4c2m8q0",
        "ytSearchQuery": "True Stories AP Dhillon Shinda Kahlon official audio",
        "storagePath": "pj-true-stories-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-sleepless-ap",
        "title": "Sleepless",
        "artist": "AP Dhillon",
        "album": "Two Hearts Never Break the Same",
        "duration": "2:54",
        "category": "trending",
        "ytId": "6x0s8m7v1q0",
        "ytSearchQuery": "Sleepless AP Dhillon official audio",
        "storagePath": "pj-sleepless-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-saada-pyaar-ap",
        "title": "Saada Pyaar",
        "artist": "AP Dhillon",
        "album": "Not by Chance",
        "duration": "3:23",
        "category": "romantic",
        "ytId": "X1b9d4v6m80",
        "ytSearchQuery": "Saada Pyaar AP Dhillon official audio",
        "storagePath": "pj-saada-pyaar-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-majhail-ap",
        "title": "Majhail",
        "artist": "AP Dhillon, Gurinder Gill, Manni Sandhu",
        "album": "Majhail",
        "duration": "3:15",
        "category": "party",
        "ytId": "1_w7o9-UBTQ",
        "ytSearchQuery": "Majhail AP Dhillon Gurinder Gill Manni Sandhu",
        "storagePath": "pj-majhail-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-goat-ap",
        "title": "GOAT",
        "artist": "AP Dhillon, Gurinder Gill",
        "album": "Not by Chance",
        "duration": "3:20",
        "category": "party",
        "ytId": "6V_Vd1m6j0c",
        "ytSearchQuery": "GOAT AP Dhillon Gurinder Gill Not by Chance",
        "storagePath": "pj-goat-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-tere-te-ap",
        "title": "Tere Te",
        "artist": "AP Dhillon, Gurinder Gill",
        "album": "Hidden Gems",
        "duration": "2:38",
        "category": "romantic",
        "ytId": "d4OuBCUSp-E",
        "ytSearchQuery": "Tere Te AP Dhillon Gurinder Gill Hidden Gems",
        "storagePath": "pj-tere-te-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-faraar-ap",
        "title": "Faraar",
        "artist": "AP Dhillon, Gurinder Gill, Shinda Kahlon",
        "album": "Faraar",
        "duration": "2:48",
        "category": "party",
        "ytId": "kJQP7kiw5Fk",
        "ytSearchQuery": "Faraar AP Dhillon Gurinder Gill Shinda Kahlon",
        "storagePath": "pj-faraar-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-old-skool-ap",
        "title": "Old Skool",
        "artist": "Prem Dhillon, Sidhu Moose Wala, AP Dhillon",
        "album": "Old Skool",
        "duration": "4:08",
        "category": "party",
        "ytId": "p6t1d8z3y84",
        "ytSearchQuery": "Old Skool Prem Dhillon Sidhu Moose Wala AP Dhillon",
        "storagePath": "pj-old-skool-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-desires-ap",
        "title": "Desires",
        "artist": "AP Dhillon, Gurinder Gill",
        "album": "Hidden Gems",
        "duration": "2:50",
        "category": "romantic",
        "ytId": "k3g_WjLCsXM",
        "ytSearchQuery": "Desires AP Dhillon Gurinder Gill Hidden Gems",
        "storagePath": "pj-desires-ap.mp3",
        "source": "AP Dhillon Hits"
    },
    {
        "id": "pj-problems-over-peace",
        "title": "Problems Over Peace",
        "artist": "AP Dhillon, Stormzy",
        "album": "The Brownprint",
        "duration": "3:24",
        "category": "trending",
        "ytId": "vWbK4tJ_6qU",
        "ytSearchQuery": "Problems Over Peace AP Dhillon Stormzy official audio",
        "storagePath": "pj-problems-over-peace.mp3",
        "source": "AP Dhillon Hits"
    }
]

print(f"Preparing to append {len(DILJIT_AND_AP_SONGS)} Diljit Dosanjh & AP Dhillon tracks...")

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', code))
print(f"Existing tracks in catalog: {len(existing_ids)}")

to_add = [s for s in DILJIT_AND_AP_SONGS if s['id'] not in existing_ids]
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
        print(f"Successfully appended {len(to_add)} Diljit & AP Dhillon tracks to musicService.js!")
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

# Update index.html with quick explore pills
with open(INDEX_PATH, 'r', encoding='utf-8') as f:
    html_code = f.read()

if 'Diljit Dosanjh' not in html_code:
    pills_target = '<button class="pill-btn" onclick="window.executeSearch(\'Karan Aujla Punjabi Hits\')">🔥 Karan Aujla Hits</button>'
    pills_replacement = '<button class="pill-btn" onclick="window.executeSearch(\'Diljit Dosanjh Lover GOAT\')">👑 Diljit Dosanjh Hits</button>\n            <button class="pill-btn" onclick="window.executeSearch(\'AP Dhillon Brown Munde Excuses With You\')">⚡ AP Dhillon Hits</button>\n            ' + pills_target
    html_code = html_code.replace(pills_target, pills_replacement)

    with open(INDEX_PATH, 'w', encoding='utf-8') as f:
        f.write(html_code)
    print("Updated index.html search pills with Diljit & AP Dhillon!")
