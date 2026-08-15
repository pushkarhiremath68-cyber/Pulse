import urllib.request
import urllib.parse
import json
import re
import time

def get_yt_id(query):
    try:
        url = 'https://www.youtube.com/results?search_query=' + urllib.parse.quote(query)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=6).read().decode('utf-8')
        m = re.search(r'"videoId":"([a-zA-Z0-9_-]{11})"', html)
        if m:
            return m.group(1)
    except Exception as e:
        print(f"Error fetching YT for {query}: {e}")
    return None

def get_itunes_info(query):
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(query)}&entity=song&limit=1"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        res = urllib.request.urlopen(req, timeout=5)
        data = json.loads(res.read().decode('utf-8'))
        if data['results']:
            r = data['results'][0]
            cover = r.get('artworkUrl100', '').replace('100x100bb', '600x600bb')
            preview = r.get('previewUrl', '')
            return cover, preview
    except Exception as e:
        print(f"Error fetching iTunes for {query}: {e}")
    return None, None

top_songs = [
    ("in-kesariya", "Kesariya Brahmastra Arijit Singh"),
    ("in-tere-vaaste", "Tere Vaaste Falak Tak Zara Hatke Zara Bachke"),
    ("in-satranga", "Satranga Animal Arijit Singh"),
    ("in-apna-bana-le", "Apna Bana Le Bhediya Arijit Singh"),
    ("in-chaleya", "Chaleya Jawan Shah Rukh Khan Arijit Singh"),
    ("in-sajni", "Sajni Laapataa Ladies Arijit Singh"),
    ("in-o-maahi", "O Maahi Dunki Arijit Singh"),
    ("in-tauba-tauba", "Tauba Tauba Bad Newz Karan Aujla"),
    ("in-aaj-ki-raat", "Aaj Ki Raat Stree 2 Tamannaah"),
    ("in-heeriye", "Heeriye Jasleen Royal Arijit Singh"),
    ("in-tum-se-hi", "Tum Se Hi Mohit Chauhan Jab We Met"),
    ("in-tum-hi-ho", "Tum Hi Ho Aashiqui 2 Arijit Singh"),
    ("in-agar-tum-saath-ho", "Agar Tum Saath Ho Tamasha Arijit Singh"),
    ("in-channa-mereya", "Channa Mereya Ae Dil Hai Mushkil Arijit Singh"),
    ("in-ve-kamleya", "Ve Kamleya Rocky Aur Rani Arijit Singh"),
    ("in-ve-haaniyaan", "Ve Haaniyaan Danny Avvy Sra"),
    ("in-baarish-ban-jaana", "Baarish Ban Jaana Stebin Ben Payal Dev"),
    ("in-phir-aur-kya-chahiye", "Phir Aur Kya Chahiye Arijit Singh"),
    ("in-dil-diyan-gallan", "Dil Diyan Gallan Atif Aslam"),
    ("in-ranjha", "Ranjha Shershaah B Praak"),
    ("in-gulabi-aankhen", "Gulabi Aankhen Atif Aslam"),
    ("in-pal-pal-dil-ke-paas", "Pal Pal Dil Ke Paas Arijit Singh"),
    ("in-lag-ja-gale", "Lag Ja Gale Sanam"),
    ("in-mere-sapno-ki-rani", "Mere Sapno Ki Rani Sanam"),
    ("in-baarishein", "Baarishein Anuv Jain"),
    ("in-husn", "Husn Anuv Jain"),
    ("in-choo-lo", "Choo Lo The Local Train"),
    ("in-kasoor", "Kasoor Prateek Kuhad"),
    ("in-cold-mess", "Cold Mess Prateek Kuhad"),
    ("in-waqt-ki-baatein", "Waqt Ki Baatein Dream Note"),
    ("in-alankar-lofi", "Bollywood Lofi Chill Beats"),
    ("in-midnight-delhi", "Hindi Lofi Midnight Beats"),
    ("in-rainy-mumbai", "Rainy Mumbai Hindi Lofi"),
    ("in-chai-beats", "Chai Beats Hindi Lofi"),
    ("in-slowed-reverb-hindi", "Bollywood Slowed Reverb Chill"),
    ("in-blinding-lights", "Blinding Lights The Weeknd"),
    ("in-shape-of-you", "Shape of You Ed Sheeran"),
    ("in-starboy", "Starboy The Weeknd"),
    ("in-levitating", "Levitating Dua Lipa"),
    ("in-as-it-was", "As It Was Harry Styles"),
    ("in-stay", "Stay The Kid LAROI Justin Bieber"),
    ("in-save-your-tears", "Save Your Tears The Weeknd"),
    ("in-bad-habits", "Bad Habits Ed Sheeran"),
    ("in-coldplay-yellow", "Yellow Coldplay"),
    ("in-believer", "Believer Imagine Dragons"),
    ("in-closer", "Closer The Chainsmokers Halsey"),
    ("in-perfect", "Perfect Ed Sheeran"),
    ("in-someone-you-loved", "Someone You Loved Lewis Capaldi"),
    ("in-senorita", "Senorita Shawn Mendes Camila Cabello"),
    ("in-despacito", "Despacito Luis Fonsi"),
    ("in-espresso", "Espresso Sabrina Carpenter"),
    ("in-greedy", "Greedy Tate McRae"),
    ("in-cruel-summer", "Cruel Summer Taylor Swift"),
    ("in-anti-hero", "Anti Hero Taylor Swift"),
    ("in-seven-jungkook", "Seven Jungkook Latto"),
    ("in-dynamite-bts", "Dynamite BTS"),
    ("in-butter-bts", "Butter BTS"),
    ("in-pink-venom", "Pink Venom BLACKPINK"),
    ("in-how-you-like-that", "How You Like That BLACKPINK"),
    ("in-super-shy", "Super Shy NewJeans"),
    ("in-omg-newjeans", "OMG NewJeans"),
    ("in-lover-diljit", "Lover Diljit Dosanjh"),
    ("in-goat-diljit", "G.O.A.T. Diljit Dosanjh"),
    ("in-kinni-kinni", "Kinni Kinni Diljit Dosanjh"),
    ("in-born-to-shine", "Born to Shine Diljit Dosanjh"),
    ("in-lemonade-diljit", "Lemonade Diljit Dosanjh"),
    ("in-peaches-diljit", "Peaches Diljit Dosanjh"),
    ("in-naina-crew", "Naina Crew Diljit Dosanjh Badshah"),
    ("in-hass-hass", "Hass Hass Diljit Dosanjh Sia"),
    ("in-clash-diljit", "Clash Diljit Dosanjh"),
    ("in-proper-patola", "Proper Patola Diljit Dosanjh Badshah"),
    ("in-softly-karan", "Softly Karan Aujla"),
    ("in-52-bars-karan", "52 Bars Karan Aujla"),
    ("in-winning-speech", "Winning Speech Karan Aujla"),
    ("in-antidote-karan", "Antidote Karan Aujla"),
    ("in-admiring-you", "Admiring You Karan Aujla"),
    ("in-jee-ni-lagda", "Jee Ni Lagda Karan Aujla"),
    ("in-white-brown-black", "White Brown Black Karan Aujla Avvy Sra"),
    ("in-brown-munde", "Brown Munde AP Dhillon"),
    ("in-excuses-ap", "Excuses AP Dhillon Gurinder Gill"),
    ("in-with-you-ap", "With You AP Dhillon"),
    ("in-summer-high", "Summer High AP Dhillon"),
    ("in-295-sidhu", "295 Sidhu Moose Wala"),
    ("in-so-high-sidhu", "So High Sidhu Moose Wala"),
    ("in-the-last-ride", "The Last Ride Sidhu Moose Wala"),
    ("in-levels-sidhu", "Levels Sidhu Moose Wala"),
    ("in-raataan-lambiyan", "Raataan Lambiyan Shershaah"),
    ("in-lut-gaye", "Lut Gaye Jubin Nautiyal"),
    ("in-shayad", "Shayad Love Aaj Kal Arijit Singh"),
    ("in-tera-ban-jaunga", "Tera Ban Jaunga Kabir Singh"),
    ("in-tujhe-kitna-chahein-aur", "Tujhe Kitna Chahne Lage Arijit Singh"),
    ("in-ghungroo", "Ghungroo War Arijit Singh"),
    ("in-nashe-si-chadh-gayi", "Nashe Si Chadh Gayi Befikre Arijit Singh"),
    ("in-kar-gayi-chull", "Kar Gayi Chull Kapoor and Sons"),
    ("in-kala-chashma", "Kala Chashma Baar Baar Dekho"),
    ("in-badtameez-dil", "Badtameez Dil Yeh Jawaani Hai Deewani"),
    ("in-gallan-goodiyaan", "Gallan Goodiyaan Dil Dhadakne Do"),
    ("in-dheere-dheere", "Dheere Dheere Se Meri Zindagi Yo Yo Honey Singh"),
    ("in-bom-diggy-diggy", "Bom Diggy Diggy Sonu Ke Titu Ki Sweety"),
    ("in-makhna", "Makhna Drive Tanishk Bagchi"),
    ("in-hook-up-song", "The Hook Up Song Student of the Year 2"),
    ("in-garmi", "Garmi Street Dancer 3D Badshah Neha Kakkar"),
    ("in-sooraj-dooba-hain", "Sooraj Dooba Hain Roy Arijit Singh"),
    ("in-subha-hone-na-de", "Subha Hone Na De Desi Boyz"),
    ("in-london-thumakda", "London Thumakda Queen"),
    ("in-dilbar", "Dilbar Satyameva Jayate Neha Kakkar"),
    ("in-chogada", "Chogada Loveyatri Darshan Raval"),
    ("in-illeegal-weapon-2", "Illegal Weapon 2.0 Street Dancer 3D"),
    ("in-sauda-khara-khara", "Sauda Khara Khara Good Newwz"),
    ("in-sheila-ki-jawani", "Sheila Ki Jawani Tees Maar Khan Sunidhi Chauhan"),
    ("in-munni-badnaam-hui", "Munni Badnaam Hui Dabangg Mamta Sharma"),
    ("in-chikni-chameli", "Chikni Chameli Agneepath Shreya Ghoshal")
]

results = {}
for song_id, query in top_songs:
    print(f"Resolving: {song_id} -> {query}")
    yt_id = get_yt_id(query)
    cover, preview = get_itunes_info(query)
    results[song_id] = {
        "ytId": yt_id,
        "cover": cover or (f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg" if yt_id else None),
        "previewUrl": preview
    }
    time.sleep(0.1)

with open('catalog_resolved.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Resolved {len(results)} songs successfully!")
