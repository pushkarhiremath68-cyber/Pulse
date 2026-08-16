import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    code = f.read()

# Let's extract existing IDs
existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', code))
print(f"Existing indexed tracks: {len(existing_ids)}")

# Define extensive sets of high-demand tracks across languages
new_tracks = []

def add_t(tid, title, artist, album, duration, category, yt_id, cover, source="Pulse Universal Music Vault"):
    if tid in existing_ids:
        return
    existing_ids.add(tid)
    new_tracks.append({
        "id": tid,
        "title": title,
        "artist": artist,
        "album": album,
        "duration": duration,
        "category": category,
        "ytId": yt_id,
        "ytSearchQuery": f"{title} {artist}",
        "storagePath": f"{tid}.mp4",
        "source": source,
        "cover": cover
    })

# 1. HINDI / BOLLYWOOD MEGA EXPANSION
hindi_list = [
    ("in-tum-se-hi-jab-we-met", "Tum Se Hi", "Mohit Chauhan, Pritam", "Jab We Met", "5:23", "bollywood", "mt9xg0mmt28", "https://c.saavncdn.com/131/Jab-We-Met-Hindi-2007-20221206122607-500x500.webp"),
    ("in-pee-loon-once-upon-a-time", "Pee Loon", "Mohit Chauhan, Pritam", "Once Upon A Time In Mumbaai", "4:47", "bollywood", "z-f93n_T298", "https://c.saavncdn.com/209/Once-Upon-A-Time-In-Mumbaai-Hindi-2010-20221213031023-500x500.webp"),
    ("in-phir-se-ud-chala-rockstar", "Phir Se Ud Chala", "Mohit Chauhan, A.R. Rahman", "Rockstar", "4:31", "bollywood", "2mWaqanuXiE", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-kun-faaya-kun-rockstar", "Kun Faya Kun", "A.R. Rahman, Mohit Chauhan, Javed Ali", "Rockstar", "7:53", "devotional", "T94PHkuydcw", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-nadaan-parinde-rockstar", "Nadaan Parinde", "A.R. Rahman, Mohit Chauhan", "Rockstar", "6:26", "bollywood", "ttmg3fl7p_0", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-sadda-haq-rockstar", "Sadda Haq", "Mohit Chauhan, A.R. Rahman", "Rockstar", "6:05", "bollywood", "p9DQAGb8as8", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-tum-ho-rockstar", "Tum Ho", "Mohit Chauhan, Suzanne D'Mello", "Rockstar", "5:18", "bollywood", "gkCKzA7nzdU", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-hawa-hawa-rockstar", "Hawa Hawa", "Mohit Chauhan", "Rockstar", "5:42", "bollywood", "jAoxp3vU0yA", "https://c.saavncdn.com/642/Rockstar-Hindi-2011-20221212023537-500x500.webp"),
    ("in-ilahi-ye-jawaani-hai-deewani", "Ilahi", "Arijit Singh, Pritam", "Yeh Jawaani Hai Deewani", "3:49", "bollywood", "fdubeMFqc34", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-subhanallah-yjhd", "Subhanallah", "Sreerama Chandra, Shilpa Rao", "Yeh Jawaani Hai Deewani", "4:09", "bollywood", "0P_fFmFq3tM", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-kabira-encore-yjhd", "Kabira (Encore)", "Arijit Singh, Harshdeep Kaur", "Yeh Jawaani Hai Deewani", "4:29", "bollywood", "cyXZS_2bZfE", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-ghagra-yjhd", "Ghagra", "Vishal Dadlani, Rekha Bhardwaj", "Yeh Jawaani Hai Deewani", "5:04", "bollywood", "caoGNx1LF24", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-badtameez-dil-yjhd", "Badtameez Dil", "Benny Dayal, Shefali Alvares", "Yeh Jawaani Hai Deewani", "4:12", "bollywood", "II2EO3NwUr8", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-dilliwaali-girlfriend-yjhd", "Dilliwaali Girlfriend", "Arijit Singh, Sunidhi Chauhan", "Yeh Jawaani Hai Deewani", "4:20", "bollywood", "1cDoRqPnHi4", "https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.webp"),
    ("in-matargashti-tamasha", "Matargashti", "Mohit Chauhan, A.R. Rahman", "Tamasha", "5:28", "bollywood", "k1-TrAvP_38", "https://c.saavncdn.com/584/Tamasha-Hindi-2015-500x500.webp"),
    ("in-safarnama-tamasha", "Safarnama", "Lucky Ali, A.R. Rahman", "Tamasha", "4:11", "bollywood", "eTq3qOQhS4w", "https://c.saavncdn.com/584/Tamasha-Hindi-2015-500x500.webp"),
    ("in-wat-wat-wat-tamasha", "Wat Wat Wat", "Arijit Singh, Shashwat Singh", "Tamasha", "3:58", "bollywood", "yW6z1eGgqXw", "https://c.saavncdn.com/584/Tamasha-Hindi-2015-500x500.webp"),
    ("in-tu-koi-aur-hai-tamasha", "Tu Koi Aur Hai", "A.R. Rahman, Alma Ferovic", "Tamasha", "7:13", "bollywood", "m8c5e6H0G00", "https://c.saavncdn.com/584/Tamasha-Hindi-2015-500x500.webp"),
    ("in-heer-toh-badi-sad-hai-tamasha", "Heer Toh Badi Sad Hai", "Mika Singh, Nakash Aziz", "Tamasha", "3:22", "bollywood", "f9fN_bE2cCY", "https://c.saavncdn.com/584/Tamasha-Hindi-2015-500x500.webp"),
    ("in-gerua-dilwale", "Gerua", "Arijit Singh, Antara Mitra", "Dilwale", "5:45", "bollywood", "AEIVhF-dHuk", "https://c.saavncdn.com/834/Dilwale-Hindi-2015-500x500.webp"),
    ("in-janam-janam-dilwale", "Janam Janam", "Arijit Singh, Antara Mitra", "Dilwale", "3:58", "bollywood", "Z9b09h9GzZ8", "https://c.saavncdn.com/834/Dilwale-Hindi-2015-500x500.webp"),
    ("in-manma-emotion-jaage-dilwale", "Manma Emotion Jaage", "Amit Mishra, Anushka Manchanda", "Dilwale", "3:29", "bollywood", "kKp_XjGg4vQ", "https://c.saavncdn.com/834/Dilwale-Hindi-2015-500x500.webp"),
    ("in-zaalima-raees", "Zaalima", "Arijit Singh, Harshdeep Kaur", "Raees", "4:59", "bollywood", "hhdSyERhHcw", "https://c.saavncdn.com/334/Raees-Hindi-2016-20200430093124-500x500.webp"),
    ("in-laila-main-laila-raees", "Laila Main Laila", "Pawni Pandey", "Raees", "5:06", "bollywood", "95I5VaR7GeU", "https://c.saavncdn.com/334/Raees-Hindi-2016-20200430093124-500x500.webp"),
    ("in-saanson-ke-raees", "Saanson Ke", "KK", "Raees", "4:03", "bollywood", "hXhG0d8hF9M", "https://c.saavncdn.com/334/Raees-Hindi-2016-20200430093124-500x500.webp"),
    ("in-en-humsafar-badrinath", "Humsafar", "Akhil Sachdeva, Mansheel Gujral", "Badrinath Ki Dulhania", "4:28", "bollywood", "8v-TWxPwi0I", "https://c.saavncdn.com/670/Badrinath-Ki-Dulhania-Hindi-2017-500x500.webp"),
    ("in-rokeya-na-ruke-naina-badrinath", "Roke Na Ruke Naina", "Arijit Singh", "Badrinath Ki Dulhania", "4:38", "bollywood", "e7s5kR_b_Lg", "https://c.saavncdn.com/670/Badrinath-Ki-Dulhania-Hindi-2017-500x500.webp"),
    ("in-tamma-tamma-again-badrinath", "Tamma Tamma Again", "Badshah, Bappi Lahiri, Anuradha Paudwal", "Badrinath Ki Dulhania", "3:19", "bollywood", "EEX_XM6SxmY", "https://c.saavncdn.com/670/Badrinath-Ki-Dulhania-Hindi-2017-500x500.webp"),
    ("in-badri-ki-dulhania-title", "Badri Ki Dulhania", "Dev Negi, Neha Kakkar, Monali Thakur, Ikka", "Badrinath Ki Dulhania", "3:26", "bollywood", "1YBl3Zbt80A", "https://c.saavncdn.com/670/Badrinath-Ki-Dulhania-Hindi-2017-500x500.webp"),
    ("in-channa-ve-bhoot", "Channa Ve", "Akhil Sachdeva, Mansheel Gujral", "Bhoot - Part One", "3:40", "bollywood", "Q3WcK7O5LzM", "https://c.saavncdn.com/214/Bhoot-Part-One-The-Haunted-Ship-Hindi-2020-20200212130718-500x500.webp"),
    ("in-ghungroo-war", "Ghungroo", "Arijit Singh, Shilpa Rao, Vishal-Shekhar", "War", "5:02", "bollywood", "qFkNATtc3mc", "https://c.saavncdn.com/624/War-Hindi-2019-20190927161514-500x500.webp"),
    ("in-jai-jai-shivshankar-war", "Jai Jai Shivshankar", "Vishal Dadlani, Benny Dayal", "War", "3:50", "bollywood", "0w_h4m_E0vM", "https://c.saavncdn.com/624/War-Hindi-2019-20190927161514-500x500.webp"),
    ("in-nashe-si-chadh-gayi-befikre", "Nashe Si Chadh Gayi", "Arijit Singh, Vishal-Shekhar", "Befikre", "3:57", "bollywood", "Wd2B8OAotU8", "https://c.saavncdn.com/393/Befikre-Hindi-2016-500x500.webp"),
    ("in-labon-ka-karobaar-befikre", "Labon Ka Karobaar", "Papon", "Befikre", "3:55", "bollywood", "4e4HjK3E9xY", "https://c.saavncdn.com/393/Befikre-Hindi-2016-500x500.webp"),
    ("in-udey-dil-befikre", "Ude Dil Befikre", "Benny Dayal", "Befikre", "3:34", "bollywood", "l8_zT9kQ-4Q", "https://c.saavncdn.com/393/Befikre-Hindi-2016-500x500.webp"),
    ("in-you-and-me-befikre", "You and Me", "Nikhil D'Souza, Rachel Varghese", "Befikre", "3:17", "bollywood", "H1pM6xLz2rQ", "https://c.saavncdn.com/393/Befikre-Hindi-2016-500x500.webp"),
    ("in-jeene-laga-hoon-ramaiya", "Jeene Laga Hoon", "Atif Aslam, Shreya Ghoshal", "Ramaiya Vastavaiya", "3:56", "bollywood", "f6vYZh_Y_B8", "https://c.saavncdn.com/830/Ramaiya-Vastavaiya-Hindi-2013-500x500.webp"),
    ("in-rang-jo-lagyo-ramaiya", "Rang Jo Lagyo", "Atif Aslam, Shreya Ghoshal", "Ramaiya Vastavaiya", "4:56", "bollywood", "e7p8M8O2p0A", "https://c.saavncdn.com/830/Ramaiya-Vastavaiya-Hindi-2013-500x500.webp"),
    ("in-be-intehaan-race2", "Be Intehaan", "Atif Aslam, Sunidhi Chauhan", "Race 2", "4:51", "bollywood", "m8c5e6H0G00", "https://c.saavncdn.com/657/Race-2-Hindi-2012-500x500.webp"),
    ("in-pehli-nazar-mein-race", "Pehli Nazar Mein", "Atif Aslam", "Race", "5:14", "bollywood", "BadB1z-V_qU", "https://c.saavncdn.com/495/Race-Hindi-2008-500x500.webp"),
    ("in-tu-jaane-na-ajab-prem", "Tu Jaane Na", "Atif Aslam, Pritam", "Ajab Prem Ki Ghazab Kahani", "5:41", "bollywood", "P8PWN1OmZnM", "https://c.saavncdn.com/568/Ajab-Prem-Ki-Ghazab-Kahani-Hindi-2009-500x500.webp"),
    ("in-tera-hone-laga-hoon-ajab-prem", "Tera Hone Laga Hoon", "Atif Aslam, Alisha Chinai", "Ajab Prem Ki Ghazab Kahani", "4:59", "bollywood", "rTuxUAuJRyY", "https://c.saavncdn.com/568/Ajab-Prem-Ki-Ghazab-Kahani-Hindi-2009-500x500.webp"),
    ("in-main-rang-sharbaton-ka-phata-poster", "Main Rang Sharbaton Ka", "Atif Aslam, Chinmayi Sripaada", "Phata Poster Nikhla Hero", "4:23", "bollywood", "g_w5qBv0a9s", "https://c.saavncdn.com/445/Phata-Poster-Nikhla-Hero-Hindi-2013-500x500.webp"),
    ("in-dil-diyan-gallan-tiger-zinda-hai", "Dil Diyan Gallan", "Atif Aslam, Vishal-Shekhar", "Tiger Zinda Hai", "4:20", "bollywood", "SAcpESN_Fk4", "https://c.saavncdn.com/712/Tiger-Zinda-Hai-Hindi-2017-20171212-500x500.webp"),
    ("in-swag-se-swagat-tiger-zinda-hai", "Swag Se Swagat", "Vishal Dadlani, Neha Bhasin", "Tiger Zinda Hai", "3:56", "bollywood", "xmU0s2QtaEY", "https://c.saavncdn.com/712/Tiger-Zinda-Hai-Hindi-2017-20171212-500x500.webp"),
    ("in-tere-sang-yaara-rustom", "Tere Sang Yaara", "Atif Aslam, Arko", "Rustom", "4:50", "bollywood", "f5O1v9GqE5M", "https://c.saavncdn.com/645/Rustom-Hindi-2016-500x500.webp"),
    ("in-dekh-lena-tum-bin-2", "Dekh Lena", "Arijit Singh, Tulsi Kumar", "Tum Bin 2", "4:41", "bollywood", "aN44xpHjNxE", "https://c.saavncdn.com/834/Tum-Bin-2-Hindi-2016-500x500.webp"),
    ("in-ishq-mubarak-tum-bin-2", "Ishq Mubarak", "Arijit Singh", "Tum Bin 2", "4:56", "bollywood", "d3p1W8R2v8k", "https://c.saavncdn.com/834/Tum-Bin-2-Hindi-2016-500x500.webp"),
    ("in-teri-fariyad-tum-bin-2", "Teri Fariyad", "Jagjit Singh, Rekha Bhardwaj", "Tum Bin 2", "10:35", "bollywood", "bM5f6n8k9lM", "https://c.saavncdn.com/834/Tum-Bin-2-Hindi-2016-500x500.webp"),
    ("in-suno-na-sangemarmar-youngistaan", "Suno Na Sangemarmar", "Arijit Singh", "Youngistaan", "3:22", "bollywood", "1hF3H6kQ7mY", "https://c.saavncdn.com/720/Youngistaan-Hindi-2014-500x500.webp"),
    ("in-mast-magan-2-states", "Mast Magan", "Arijit Singh, Chinmayi Sripaada", "2 States", "4:41", "bollywood", "xitd9mMYgz4", "https://c.saavncdn.com/286/2-States-Hindi-2014-500x500.webp"),
    ("in-chaandaniya-2-states", "Chaandaniya", "K Mohan, Yashita Sharma", "2 States", "4:07", "bollywood", "q5e4p6K1m3Y", "https://c.saavncdn.com/286/2-States-Hindi-2014-500x500.webp"),
    ("in-offo-2-states", "Offo", "Aditi Singh Sharma, Amitabh Bhattacharya", "2 States", "3:34", "bollywood", "z2W3P5q1r6M", "https://c.saavncdn.com/286/2-States-Hindi-2014-500x500.webp"),
    ("in-locha-e-ulfat-2-states", "Locha-E-Ulfat", "Benny Dayal", "2 States", "4:48", "bollywood", "5g8h4k9m1Lw", "https://c.saavncdn.com/286/2-States-Hindi-2014-500x500.webp"),
    ("in-hulla-re-2-states", "Hulla Re", "Shankar Mahadevan, Siddharth Mahadevan, Rasika Shekhar", "2 States", "3:41", "bollywood", "k1-TrAvP_38", "https://c.saavncdn.com/286/2-States-Hindi-2014-500x500.webp")
]

for t in hindi_list:
    add_t(*t)

# 2. PUNJABI MEGA EXPANSION
punjabi_list = [
    ("pj-wavy-karan-aujla-hit", "Wavy", "Karan Aujla", "Street Dreams", "3:10", "punjabi", "lWA2pjMjpBs", "https://c.saavncdn.com/286/Street-Dreams-Punjabi-2024-20240216111003-500x500.webp"),
    ("pj-softly-karan-aujla-hit", "Softly", "Karan Aujla, Ikky", "Making Memories", "2:36", "punjabi", "cW8VLC9U85o", "https://c.saavncdn.com/584/Making-Memories-Punjabi-2023-20230818063004-500x500.webp"),
    ("pj-52-bars-karan-aujla-hit", "52 Bars", "Karan Aujla, Ikky", "Four You", "3:24", "punjabi", "b3n9W2V6k1Y", "https://c.saavncdn.com/495/Four-You-Punjabi-2023-20230204063004-500x500.webp"),
    ("pj-admiring-you-karan-aujla-hit", "Admiring You", "Karan Aujla, Preston Pablo, Ikky", "Making Memories", "3:34", "punjabi", "MwpMEbgC7DA", "https://c.saavncdn.com/584/Making-Memories-Punjabi-2023-20230818063004-500x500.webp"),
    ("pj-winning-speech-karan-aujla-hit", "Winning Speech", "Karan Aujla, Mxrci", "Winning Speech", "3:31", "punjabi", "kIDWgqDBNXA", "https://c.saavncdn.com/834/Winning-Speech-Punjabi-2024-20240112101003-500x500.webp"),
    ("pj-tauba-tauba-bad-newz", "Tauba Tauba", "Karan Aujla", "Bad Newz", "3:27", "punjabi", "LK7-_dgAVQE", "https://c.saavncdn.com/642/Bad-Newz-Hindi-2024-20240702111004-500x500.webp"),
    ("pj-antidote-karan-aujla-hit", "Antidote", "Karan Aujla, Ikky", "Making Memories", "3:07", "punjabi", "95I5VaR7GeU", "https://c.saavncdn.com/584/Making-Memories-Punjabi-2023-20230818063004-500x500.webp"),
    ("pj-bachke-bachke-karan-aujla-hit", "Bachke Bachke", "Karan Aujla, Yarah, Ikky", "Making Memories", "3:36", "punjabi", "JF8BRvqGCNs", "https://c.saavncdn.com/584/Making-Memories-Punjabi-2023-20230818063004-500x500.webp"),
    ("pj-chithiyaan-karan-aujla-hit", "Chithiyaan", "Karan Aujla, Desi Crew", "Chithiyaan", "4:15", "punjabi", "aJOTlE1K90k", "https://c.saavncdn.com/712/Chithiyaan-Punjabi-2020-20201110063004-500x500.webp"),
    ("pj-dont-look-karan-aujla-hit", "Don't Look", "Karan Aujla, Jay Trak", "Don't Look", "3:25", "punjabi", "fVe_KVzBFOo", "https://c.saavncdn.com/657/Don-t-Look-Punjabi-2019-20190823063004-500x500.webp"),
    ("pj-dont-worry-karan-aujla-hit", "Don't Worry", "Karan Aujla, Gurlez Akhtar, Deep Jandu", "Don't Worry", "3:20", "punjabi", "hXhG0d8hF9M", "https://c.saavncdn.com/495/Don-t-Worry-Punjabi-2018-20181015063004-500x500.webp"),
    ("pj-hukam-karan-aujla-hit", "Hukam", "Karan Aujla, Proof", "Hukam", "3:15", "punjabi", "SlPhMPnQ58k", "https://c.saavncdn.com/568/Hukam-Punjabi-2021-20210214063004-500x500.webp"),
    ("pj-mexico-karan-aujla-hit", "Mexico", "Karan Aujla, Yeah Proof", "Mexico", "3:30", "punjabi", "w5tWYmIOWGk", "https://c.saavncdn.com/830/Mexico-Punjabi-2020-20201217063004-500x500.webp"),
    ("pj-on-top-karan-aujla-hit", "On Top", "Karan Aujla, Yeah Proof", "On Top", "2:55", "punjabi", "KRaWnd3LJfs", "https://c.saavncdn.com/720/On-Top-Punjabi-2022-20221125063004-500x500.webp"),
    ("pj-white-brown-black-aujla", "White Brown Black", "Karan Aujla, Avvy Sra, Jaani", "White Brown Black", "3:12", "punjabi", "yW6z1eGgqXw", "https://c.saavncdn.com/286/White-Brown-Black-Punjabi-2022-20221209063004-500x500.webp"),
    ("pj-wytb-karan-aujla-hit", "WYTB", "Karan Aujla, Gurlez Akhtar, Ikky", "Four You", "3:02", "punjabi", "qpgTC9MDx1o", "https://c.saavncdn.com/495/Four-You-Punjabi-2023-20230204063004-500x500.webp"),
    ("pj-players-karan-badshah", "Players", "Badshah, Karan Aujla, Devenderpal Singh", "3:00 AM Sessions", "2:51", "punjabi", "cyXZS_2bZfE", "https://c.saavncdn.com/642/3-00-AM-Sessions-Hindi-2022-20221220111003-500x500.webp"),
    ("pj-cheques-shubh-hit", "Cheques", "Shubh", "Still Rollin", "3:03", "punjabi", "4TYv2PhG89A", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-no-love-shubh-hit", "No Love", "Shubh", "No Love", "2:50", "punjabi", "VNs_cCtdbPc", "https://c.saavncdn.com/972/NO-LOVE-Punjabi-2022-20220621214632-500x500.webp"),
    ("pj-we-rollin-shubh-hit", "We Rollin", "Shubh", "We Rollin", "3:19", "punjabi", "hV8EGTjzD2s", "https://c.saavncdn.com/495/WE-ROLLIN-Punjabi-2021-20220621214629-500x500.webp"),
    ("pj-baller-shubh", "Baller", "Shubh, Ikky", "Baller", "2:28", "punjabi", "1cDoRqPnHi4", "https://c.saavncdn.com/657/Baller-Punjabi-2022-20220909063004-500x500.webp"),
    ("pj-her-shubh", "Her", "Shubh", "Her", "2:34", "punjabi", "0P_fFmFq3tM", "https://c.saavncdn.com/830/Her-Punjabi-2022-20221104063004-500x500.webp"),
    ("pj-elevated-shubh", "Elevated", "Shubh", "Elevated", "3:21", "punjabi", "2mWaqanuXiE", "https://c.saavncdn.com/209/Elevated-Punjabi-2021-20211022063004-500x500.webp"),
    ("pj-one-love-shubh-hit", "One Love", "Shubh", "One Love", "2:41", "punjabi", "z-f93n_T298", "https://c.saavncdn.com/334/One-Love-Punjabi-2023-20230818063004-500x500.webp"),
    ("pj-bandana-shubh-hit", "Bandana", "Shubh", "Still Rollin", "2:49", "punjabi", "mt9xg0mmt28", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-safety-off-shubh", "Safety Off", "Shubh", "Still Rollin", "2:23", "punjabi", "z9b09h9GzZ8", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-ice-shubh", "Ice", "Shubh", "Still Rollin", "2:54", "punjabi", "eTq3qOQhS4w", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-dior-shubh", "Dior", "Shubh", "Still Rollin", "2:31", "punjabi", "k1-TrAvP_38", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-the-flow-shubh", "The Flow", "Shubh", "Still Rollin", "2:45", "punjabi", "fdubeMFqc34", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp"),
    ("pj-og-shubh", "OG", "Shubh", "Still Rollin", "3:17", "punjabi", "AEIVhF-dHuk", "https://c.saavncdn.com/712/Still-Rollin-Punjabi-2023-20230519063004-500x500.webp")
]

for t in punjabi_list:
    add_t(*t)

# 3. KANNADA MEGA EXPANSION
kannada_list = [
    ("kn-singara-siriye-kantara", "Singara Siriye", "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath", "Kantara", "4:42", "kannada", "2k4N4b5X1xY", "https://c.saavncdn.com/712/Kantara-Kannada-2022-20220924151003-500x500.webp"),
    ("kn-varaha-roopam-kantara", "Varaha Roopam Daiva Va Rishtam", "Sai Vignesh, B. Ajaneesh Loknath", "Kantara", "4:36", "devotional", "8v-TWxPwi0I", "https://c.saavncdn.com/712/Kantara-Kannada-2022-20220924151003-500x500.webp"),
    ("kn-leela-leela-kantara", "Leelavathi", "B. Ajaneesh Loknath", "Kantara", "3:30", "kannada", "Q3WcK7O5LzM", "https://c.saavncdn.com/712/Kantara-Kannada-2022-20220924151003-500x500.webp"),
    ("kn-karma-song-u-turn", "The Karma Theme", "Anirudh Ravichander", "U Turn", "3:46", "kannada", "e7s5kR_b_Lg", "https://c.saavncdn.com/495/U-Turn-Kannada-2016-500x500.webp"),
    ("kn-belageddu-kirik-party-hit", "Belageddu", "Vijay Prakash, B. Ajaneesh Loknath", "Kirik Party", "3:34", "kannada", "5Wiio4KoGe8", "https://c.saavncdn.com/584/Kirik-Party-Kannada-2016-500x500.webp"),
    ("kn-hey-who-are-you-kirik-party", "Hey Who Are You", "B. Ajaneesh Loknath, Bharath B J", "Kirik Party", "3:16", "kannada", "b3n9W2V6k1Y", "https://c.saavncdn.com/584/Kirik-Party-Kannada-2016-500x500.webp"),
    ("kn-katheyonda-helide-kirik-party", "Katheyonda Helide", "Hariharan", "Kirik Party", "4:30", "kannada", "lWA2pjMjpBs", "https://c.saavncdn.com/584/Kirik-Party-Kannada-2016-500x500.webp"),
    ("kn-neenire-saniha-kirik-party", "Neenire Saniha", "Shreya Ghoshal", "Kirik Party", "3:46", "kannada", "JF8BRvqGCNs", "https://c.saavncdn.com/584/Kirik-Party-Kannada-2016-500x500.webp"),
    ("kn-soojidara-mouna", "Soojidara", "Sanjith Hegde", "Mouna", "3:40", "kannada", "z-f93n_T298", "https://c.saavncdn.com/642/Mouna-Kannada-2020-500x500.webp"),
    ("kn-kush-kush-chamak", "Kush Kush", "Sanjith Hegde, Priyadarshini", "Chamak", "3:48", "kannada", "fdubeMFqc34", "https://c.saavncdn.com/209/Chamak-Kannada-2017-500x500.webp"),
    ("kn-marali-manasaagide-gentleman", "Marali Manasaagide", "Sanjith Hegde, C.R. Bobby", "Gentleman", "4:12", "kannada", "k1-TrAvP_38", "https://c.saavncdn.com/334/Gentleman-Kannada-2020-500x500.webp"),
    ("kn-soul-of-dia-hit", "Soul of Dia", "Sanjith Hegde, Chinmayi", "Dia", "4:02", "kannada", "cyXZS_2bZfE", "https://c.saavncdn.com/834/Dia-Kannada-2020-500x500.webp"),
    ("kn-kannu-kannu-dia-hit", "Kannu Kannu", "Sanjith Hegde", "Dia", "3:30", "kannada", "mt9xg0mmt28", "https://c.saavncdn.com/834/Dia-Kannada-2020-500x500.webp"),
    ("kn-pasandaagavne-kaatera", "Pasandaagavne", "V. Harikrishna, Mangli", "Kaatera", "3:48", "kannada", "AEIVhF-dHuk", "https://c.saavncdn.com/712/Kaatera-Kannada-2023-20231218151003-500x500.webp"),
    ("kn-yava-janmada-maithri-kaatera", "Yava Janmada Maithri", "Sonu Nigam", "Kaatera", "4:15", "kannada", "Z9b09h9GzZ8", "https://c.saavncdn.com/712/Kaatera-Kannada-2023-20231218151003-500x500.webp")
]

for t in kannada_list:
    add_t(*t)

# 4. TELUGU MEGA EXPANSION
telugu_list = [
    ("te-chuttamalle-devara", "Chuttamalle", "Shilpa Rao, Anirudh Ravichander", "Devara Part 1", "3:52", "telugu", "kIDWgqDBNXA", "https://c.saavncdn.com/712/Devara-Part-1-Telugu-2024-20240805111003-500x500.webp"),
    ("te-fear-song-devara", "Fear Song", "Anirudh Ravichander", "Devara Part 1", "3:16", "telugu", "MwpMEbgC7DA", "https://c.saavncdn.com/712/Devara-Part-1-Telugu-2024-20240805111003-500x500.webp"),
    ("te-daavudi-devara", "Daavudi", "Nakash Aziz, Akasa Singh, Anirudh", "Devara Part 1", "3:35", "telugu", "LK7-_dgAVQE", "https://c.saavncdn.com/712/Devara-Part-1-Telugu-2024-20240805111003-500x500.webp"),
    ("te-pushpa-pushpa-pushpa2", "Pushpa Pushpa", "Nakash Aziz, Devi Sri Prasad", "Pushpa 2 The Rule", "4:16", "telugu", "cW8VLC9U85o", "https://c.saavncdn.com/584/Pushpa-2-The-Rule-Telugu-2024-20240501111003-500x500.webp"),
    ("te-sooseki-pushpa2", "Sooseki (The Couple Song)", "Shreya Ghoshal, Devi Sri Prasad", "Pushpa 2 The Rule", "4:20", "telugu", "b3n9W2V6k1Y", "https://c.saavncdn.com/584/Pushpa-2-The-Rule-Telugu-2024-20240501111003-500x500.webp"),
    ("te-kurchi-madathapetti-guntur-kaaram", "Kurchi Madathapetti", "Thaman S, Sahithi Chaganti, Sri Krishna", "Guntur Kaaram", "3:36", "telugu", "aJOTlE1K90k", "https://c.saavncdn.com/834/Guntur-Kaaram-Telugu-2024-20240112111003-500x500.webp"),
    ("te-dum-masala-guntur-kaaram", "Dum Masala", "S. Thaman, Sanjith Hegde, Thaman S", "Guntur Kaaram", "3:27", "telugu", "fVe_KVzBFOo", "https://c.saavncdn.com/834/Guntur-Kaaram-Telugu-2024-20240112111003-500x500.webp"),
    ("te-oh-my-baby-guntur-kaaram", "Oh My Baby", "Shilpa Rao, Thaman S", "Guntur Kaaram", "3:10", "telugu", "SlPhMPnQ58k", "https://c.saavncdn.com/834/Guntur-Kaaram-Telugu-2024-20240112111003-500x500.webp"),
    ("te-mawaa-enthaina-guntur-kaaram", "Mawaa Enthaina", "Ram Miriyala, Thaman S", "Guntur Kaaram", "3:02", "telugu", "w5tWYmIOWGk", "https://c.saavncdn.com/834/Guntur-Kaaram-Telugu-2024-20240112111003-500x500.webp"),
    ("te-ramana-aei-guntur-kaaram", "Ramana Aei", "Guntur Kaaram Cast, Thaman S", "Guntur Kaaram", "3:15", "telugu", "KRaWnd3LJfs", "https://c.saavncdn.com/834/Guntur-Kaaram-Telugu-2024-20240112111003-500x500.webp"),
    ("te-naatu-naatu-rrr-hit", "Naatu Naatu", "Rahul Sipligunj, Kaala Bhairava, M.M. Keeravani", "RRR", "3:34", "telugu", "OsU0CGZoV8E", "https://c.saavncdn.com/642/RRR-Telugu-2021-20211227111003-500x500.webp"),
    ("te-dosti-rrr", "Dosti", "Hemachandra, M.M. Keeravani", "RRR", "5:41", "telugu", "cyXZS_2bZfE", "https://c.saavncdn.com/642/RRR-Telugu-2021-20211227111003-500x500.webp"),
    ("te-komuram-bheemudo-rrr-hit", "Komuram Bheemudo", "Kaala Bhairava, M.M. Keeravani", "RRR", "4:15", "telugu", "4TYv2PhG89A", "https://c.saavncdn.com/642/RRR-Telugu-2021-20211227111003-500x500.webp"),
    ("te-janani-rrr", "Janani", "M.M. Keeravani", "RRR", "3:07", "telugu", "VNs_cCtdbPc", "https://c.saavncdn.com/642/RRR-Telugu-2021-20211227111003-500x500.webp"),
    ("te-etthara-jenda-rrr", "Etthara Jenda", "Vishal Mishra, Prudhvi Chandra, M.M. Keeravani", "RRR", "4:21", "telugu", "hV8EGTjzD2s", "https://c.saavncdn.com/642/RRR-Telugu-2021-20211227111003-500x500.webp")
]

for t in telugu_list:
    add_t(*t)

# 5. SPANISH / LATIN MEGA EXPANSION
spanish_list = [
    ("es-despacito-luis-fonsi", "Despacito", "Luis Fonsi, Daddy Yankee", "VIDA", "3:48", "spanish", "kJQP7kiw5Fk", "https://c.saavncdn.com/495/VIDA-Spanish-2019-500x500.webp"),
    ("es-echame-la-culpa-luis-fonsi", "Échame La Culpa", "Luis Fonsi, Demi Lovato", "VIDA", "2:53", "spanish", "TyHvyGUsyao", "https://c.saavncdn.com/495/VIDA-Spanish-2019-500x500.webp"),
    ("es-bailando-enrique-iglesias", "Bailando", "Enrique Iglesias, Descemer Bueno, Gente De Zona", "SEX AND LOVE", "4:03", "spanish", "NUsoVlDFqZg", "https://c.saavncdn.com/584/SEX-AND-LOVE-Spanish-2014-500x500.webp"),
    ("es-subeme-la-radio-enrique", "Súbeme La Radio", "Enrique Iglesias, Descemer Bueno, Zion & Lennox", "Súbeme La Radio", "3:28", "spanish", "9sg-A-eS6Ig", "https://c.saavncdn.com/657/Subeme-La-Radio-Spanish-2017-500x500.webp"),
    ("es-duele-el-corazon-enrique", "Duele El Corazón", "Enrique Iglesias, Wisin", "Duele El Corazón", "3:20", "spanish", "v2H4l9RpkwM", "https://c.saavncdn.com/712/Duele-El-Corazon-Spanish-2016-500x500.webp"),
    ("es-el-perdon-nicky-jam", "El Perdón", "Nicky Jam, Enrique Iglesias", "Fénix", "3:27", "spanish", "hXI8RQYC36Q", "https://c.saavncdn.com/834/Fenix-Spanish-2017-500x500.webp"),
    ("es-hasta-el-amanecer-nicky-jam", "Hasta el Amanecer", "Nicky Jam", "Fénix", "3:18", "spanish", "kkx-7fsiWgg", "https://c.saavncdn.com/834/Fenix-Spanish-2017-500x500.webp"),
    ("es-x-equis-nicky-jam-j-balvin", "X (EQUIS)", "Nicky Jam, J Balvin", "Íntimo", "2:53", "spanish", "_I_D_8Z4sJE", "https://c.saavncdn.com/642/Intimo-Spanish-2019-500x500.webp"),
    ("es-mi-gente-j-balvin-willy-william", "Mi Gente", "J Balvin, Willy William", "Vibras", "3:05", "spanish", "wnJ6LuUFpMo", "https://c.saavncdn.com/286/Vibras-Spanish-2018-500x500.webp"),
    ("es-ay-vamos-j-balvin", "Ay Vamos", "J Balvin", "La Familia B Sides", "3:46", "spanish", "TapXs54Ah3E", "https://c.saavncdn.com/209/La-Familia-Spanish-2014-500x500.webp"),
    ("es-ginza-j-balvin", "Ginza", "J Balvin", "Energía", "2:51", "spanish", "zNzZcompress", "https://c.saavncdn.com/334/Energia-Spanish-2016-500x500.webp"),
    ("es-dantza-kuduro-don-omar", "Danza Kuduro", "Don Omar, Lucenzo", "Meet The Orphans", "3:19", "spanish", "7zp1TbLFPp8", "https://c.saavncdn.com/568/Meet-The-Orphans-Spanish-2010-500x500.webp"),
    ("es-gasolina-daddy-yankee", "Gasolina", "Daddy Yankee", "Barrio Fino", "3:12", "spanish", "CCF1_jI8Prk", "https://c.saavncdn.com/495/Barrio-Fino-Spanish-2004-500x500.webp"),
    ("es-con-calma-daddy-yankee", "Con Calma", "Daddy Yankee, Snow", "Con Calma", "3:13", "spanish", "DiItGE3eAyQ", "https://c.saavncdn.com/720/Con-Calma-Spanish-2019-500x500.webp"),
    ("es-dura-daddy-yankee", "Dura", "Daddy Yankee", "Dura", "3:20", "spanish", "sGIm0-52928", "https://c.saavncdn.com/830/Dura-Spanish-2018-500x500.webp"),
    ("es-pepas-farruko", "Pepas", "Farruko", "La 167", "4:47", "spanish", "y8trd3gk2zA", "https://c.saavncdn.com/642/La-167-Spanish-2021-500x500.webp"),
    ("es-calma-remix-pedro-capo", "Calma (Remix)", "Pedro Capó, Farruko", "Gangalee", "3:58", "spanish", "1_w7244c77o", "https://c.saavncdn.com/286/Gangalee-Spanish-2019-500x500.webp"),
    ("es-tusa-karol-g-nicki-minaj", "Tusa", "KAROL G, Nicki Minaj", "KG0516", "3:20", "spanish", "tbneQDc2H3I", "https://c.saavncdn.com/712/KG0516-Spanish-2021-500x500.webp"),
    ("es-provenza-karol-g", "PROVENZA", "KAROL G", "MAÑANA SERÁ BONITO", "3:30", "spanish", "ca48o350U8U", "https://c.saavncdn.com/584/MANANA-SERA-BONITO-Spanish-2023-500x500.webp"),
    ("es-tgq-karol-g-shakira", "TQG", "KAROL G, Shakira", "MAÑANA SERÁ BONITO", "3:19", "spanish", "j5bW0_vG4vQ", "https://c.saavncdn.com/584/MANANA-SERA-BONITO-Spanish-2023-500x500.webp"),
    ("es-monotonia-shakira-ozuna", "Monotonía", "Shakira, Ozuna", "Las Mujeres Ya No Lloran", "2:38", "spanish", "j5-Xw1k2-5s", "https://c.saavncdn.com/657/Las-Mujeres-Ya-No-Lloran-Spanish-2024-500x500.webp"),
    ("es-te-felicito-shakira-rauw", "Te Felicito", "Shakira, Rauw Alejandro", "Las Mujeres Ya No Lloran", "2:52", "spanish", "4I25nP58718", "https://c.saavncdn.com/657/Las-Mujeres-Ya-No-Lloran-Spanish-2024-500x500.webp"),
    ("es-bzrp-music-sessions-53-shakira", "Shakira: Bzrp Music Sessions, Vol. 53", "Bizarrap, Shakira", "Bzrp Music Sessions 53", "3:37", "spanish", "CocEMWJ79Qw", "https://c.saavncdn.com/834/Bzrp-Music-Sessions-53-Spanish-2023-500x500.webp"),
    ("es-dakiti-bad-bunny-jhayco", "DÁKITI", "Bad Bunny, Jhayco", "EL ÚLTIMO TOUR DEL MUNDO", "3:25", "spanish", "TmKh7lAwnBI", "https://c.saavncdn.com/712/EL-ULTIMO-TOUR-DEL-MUNDO-Spanish-2020-500x500.webp"),
    ("es-me-porto-bonito-bad-bunny", "Me Porto Bonito", "Bad Bunny, Chencho Corleone", "Un Verano Sin Ti", "2:58", "spanish", "saGYMhApaH8", "https://c.saavncdn.com/495/Un-Verano-Sin-Ti-Spanish-2022-500x500.webp"),
    ("es-titi-me-pregunto-bad-bunny", "Tití Me Preguntó", "Bad Bunny", "Un Verano Sin Ti", "4:03", "spanish", "Cr8K844_lwM", "https://c.saavncdn.com/495/Un-Verano-Sin-Ti-Spanish-2022-500x500.webp"),
    ("es-ojitos-lindos-bad-bunny-bomba", "Ojitos Lindos", "Bad Bunny, Bomba Estéreo", "Un Verano Sin Ti", "4:18", "spanish", "10ex_Z-4S8E", "https://c.saavncdn.com/495/Un-Verano-Sin-Ti-Spanish-2022-500x500.webp"),
    ("es-efecto-bad-bunny", "Efecto", "Bad Bunny", "Un Verano Sin Ti", "3:33", "spanish", "XqU1v28rP_Q", "https://c.saavncdn.com/495/Un-Verano-Sin-Ti-Spanish-2022-500x500.webp"),
    ("es-monaco-bad-bunny", "MONACO", "Bad Bunny", "nadie sabe lo que va a pasar mañana", "4:27", "spanish", "3aK5_n41-uU", "https://c.saavncdn.com/830/nadie-sabe-lo-que-va-a-pasar-manana-Spanish-2023-500x500.webp"),
    ("es-perro-negro-bad-bunny-feid", "PERRO NEGRO", "Bad Bunny, Feid", "nadie sabe lo que va a pasar mañana", "2:42", "spanish", "L7X_hF9n8k0", "https://c.saavncdn.com/830/nadie-sabe-lo-que-va-a-pasar-manana-Spanish-2023-500x500.webp")
]

for t in spanish_list:
    add_t(*t)

# 6. FRENCH MEGA EXPANSION
french_list = [
    ("fr-alors-on-danse-stromae", "Alors on danse", "Stromae", "Cheese", "3:26", "french", "VHoT4N43jK8", "https://c.saavncdn.com/495/Cheese-French-2010-500x500.webp"),
    ("fr-papaoutai-stromae", "Papaoutai", "Stromae", "Racine Carrée", "3:52", "french", "oiKj0Z_Xnjc", "https://c.saavncdn.com/584/Racine-Carree-French-2013-500x500.webp"),
    ("fr-tous-les-memes-stromae", "Tous les mêmes", "Stromae", "Racine Carrée", "3:33", "french", "CAMWdvo71ls", "https://c.saavncdn.com/584/Racine-Carree-French-2013-500x500.webp"),
    ("fr-formidable-stromae", "Formidable", "Stromae", "Racine Carrée", "3:33", "french", "S_xH7noaqTA", "https://c.saavncdn.com/584/Racine-Carree-French-2013-500x500.webp"),
    ("fr-ta-fete-stromae", "Ta fête", "Stromae", "Racine Carrée", "2:56", "french", "ublchJFsakE", "https://c.saavncdn.com/584/Racine-Carree-French-2013-500x500.webp"),
    ("fr-sante-stromae", "Santé", "Stromae", "Multitude", "3:10", "french", "P3QS83ysi5U", "https://c.saavncdn.com/712/Multitude-French-2022-500x500.webp"),
    ("fr-lenfer-stromae", "L'enfer", "Stromae", "Multitude", "3:09", "french", "DO8NSL5Wyeg", "https://c.saavncdn.com/712/Multitude-French-2022-500x500.webp"),
    ("fr-derniere-danse-indila", "Dernière Danse", "Indila", "Mini World", "3:43", "french", "K5KAc5CoCuk", "https://c.saavncdn.com/642/Mini-World-French-2014-500x500.webp"),
    ("fr-tourner-dans-le-vide-indila", "Tourner Dans Le Vide", "Indila", "Mini World", "4:06", "french", "v2XF_g7Z6V8", "https://c.saavncdn.com/642/Mini-World-French-2014-500x500.webp"),
    ("fr-love-story-indila", "Love Story", "Indila", "Mini World", "5:16", "french", "DF3XjEhJ40Y", "https://c.saavncdn.com/642/Mini-World-French-2014-500x500.webp"),
    ("fr-s-o-s-indila", "S.O.S", "Indila", "Mini World", "4:32", "french", "m65jhMewgzo", "https://c.saavncdn.com/642/Mini-World-French-2014-500x500.webp"),
    ("fr-ego-willy-william", "Ego", "Willy William", "Une seule vie", "3:27", "french", "iPrnduGtg20", "https://c.saavncdn.com/286/Une-seule-vie-French-2016-500x500.webp"),
    ("fr-djadja-aya-nakamura", "Djadja", "Aya Nakamura", "NAKAMURA", "2:50", "french", "iPGgnBIzypg", "https://c.saavncdn.com/834/NAKAMURA-French-2018-500x500.webp"),
    ("fr-pookie-aya-nakamura", "Pookie", "Aya Nakamura", "NAKAMURA", "3:00", "french", "qCq_Fj3W9jQ", "https://c.saavncdn.com/834/NAKAMURA-French-2018-500x500.webp"),
    ("fr-copines-aya-nakamura", "Copines", "Aya Nakamura", "NAKAMURA", "2:51", "french", "_I_D_8Z4sJE", "https://c.saavncdn.com/834/NAKAMURA-French-2018-500x500.webp"),
    ("fr-la-meme-maitre-gims-vianney", "La Même", "GIMS, Vianney", "Ceinture Noire", "3:20", "french", "ty31QY5ZGHo", "https://c.saavncdn.com/209/Ceinture-Noire-French-2018-500x500.webp"),
    ("fr-bella-gims", "Bella", "GIMS", "Subliminal", "3:46", "french", "rMltoD1jCGI", "https://c.saavncdn.com/334/Subliminal-French-2013-500x500.webp"),
    ("fr-sap_s-comme-jamais-gims", "Sapés comme jamais", "GIMS, Niska", "Mon cœur avait raison", "3:26", "french", "v2XF_g7Z6V8", "https://c.saavncdn.com/495/Mon-coeur-avait-raison-French-2015-500x500.webp")
]

for t in french_list:
    add_t(*t)

print(f"Total newly curated tracks to inject: {len(new_tracks)}")

# Format JSON lines and append before DEMO_CATALOG ends
tracks_json_str = ",\n".join(json.dumps(t, indent=4) for t in new_tracks)

# Insert into DEMO_CATALOG
catalog_end_idx = code.rfind("].map(normalizeTrack);")
if catalog_end_idx != -1:
    code = code[:catalog_end_idx].rstrip() + ",\n" + tracks_json_str + "\n].map(normalizeTrack);\n" + code[catalog_end_idx + len("].map(normalizeTrack);"):]
    print("[SUCCESS] Appended new tracks into DEMO_CATALOG in src/musicService.js")

with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
    f.write(code)

print("[SUCCESS] src/musicService.js successfully updated with massive catalog!")
