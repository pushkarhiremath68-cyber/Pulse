import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')

BONUS_TRACKS = [
    # Devotional Extra
    ("dev-om-jai-shiv-omkara", "Om Jai Shiv Omkara", "Anuradha Paudwal", "Shiv Aarti", "6:12", "devotional", "hindi", "Om Jai Shiv Omkara Anuradha Paudwal"),
    ("dev-jai-lakshmi-mata", "Jai Lakshmi Mata", "Anuradha Paudwal", "Lakshmi Aarti", "5:45", "devotional", "hindi", "Jai Lakshmi Mata Anuradha Paudwal"),
    ("dev-jai-santoshi-mata", "Jai Santoshi Mata", "Usha Mangeshkar", "Santoshi Mata", "5:20", "devotional", "hindi", "Jai Santoshi Mata Usha Mangeshkar"),
    ("dev-amritwani-hanuman", "Shri Hanuman Amritwani", "Anuradha Paudwal", "Hanuman Amritwani", "14:30", "devotional", "hindi", "Shri Hanuman Amritwani Anuradha Paudwal"),
    ("dev-shree-krishna-chaitanya", "Maha Mantra Hare Krishna", "Krishna Das", "Pilgrim Heart", "8:40", "devotional", "sanskrit", "Hare Krishna Maha Mantra Krishna Das"),
    ("dev-govinda-hari-govinda", "Govinda Hari Govinda", "K.J. Yesudas", "Venkateswara Bhakthi", "6:15", "devotional", "telugu", "Govinda Hari Govinda Yesudas"),
    ("dev-kn-sharade-daye-toride", "Sharade Daye Thoride", "Dr. Rajkumar", "Saraswathi Stuti", "4:30", "devotional", "kannada", "Sharade Daye Thoride Dr Rajkumar"),
    ("dev-kn-kailasavasa-gowrishankara", "Kailasavasa Gowrishankara", "Dr. Rajkumar", "Shiva Bhakthi", "5:12", "devotional", "kannada", "Kailasavasa Gowrishankara Dr Rajkumar"),
    ("dev-kn-shiva-shiva-ennada", "Shiva Shiva Ennada Nalige Yeke", "P.B. Sreenivas", "Bhakti Geethe", "4:50", "devotional", "kannada", "Shiva Shiva Ennada Nalige Yeke"),
    ("dev-kn-guruvara-banthamma", "Guruvara Banthamma Rayara Neneyire", "Bhimsen Joshi", "Raghavendra Bhakti", "5:35", "devotional", "kannada", "Guruvara Banthamma Rayara Neneyire"),

    # English Pop & R&B
    ("en-cruel-summer-live", "Cruel Summer (Live Ghero)", "Taylor Swift", "The Eras Tour", "3:15", "pop", "english", "Cruel Summer Taylor Swift Live"),
    ("en-wildest-dreams-taylors-version", "Wildest Dreams (Taylor's Version)", "Taylor Swift", "1989 (Taylor's Version)", "3:40", "pop", "english", "Wildest Dreams Taylors Version"),
    ("en-all-too-well-10-min", "All Too Well (10 Minute Version)", "Taylor Swift", "Red (Taylor's Version)", "10:13", "romantic", "english", "All Too Well 10 Minute Version Taylor Swift"),
    ("en-style-taylors-version", "Style (Taylor's Version)", "Taylor Swift", "1989 (Taylor's Version)", "3:51", "pop", "english", "Style Taylors Version Taylor Swift"),
    ("en-espresso-extended", "Espresso (Double Shot Extended)", "Sabrina Carpenter", "Short n' Sweet", "3:20", "pop", "english", "Espresso Sabrina Carpenter"),
    ("en-espresso-sabrina-full", "Espresso", "Sabrina Carpenter", "Short n' Sweet", "2:55", "pop", "english", "Sabrina Carpenter Espresso full official audio"),
    ("en-good-luck-babe-full", "Good Luck, Babe!", "Chappell Roan", "Good Luck Babe", "3:38", "pop", "english", "Good Luck Babe Chappell Roan full official"),
    ("en-feather-full", "Feather", "Sabrina Carpenter", "emails i can't send fwd:", "3:05", "pop", "english", "Feather Sabrina Carpenter official"),
    ("en-starboy-the-weeknd-full", "Starboy", "The Weeknd ft. Daft Punk", "Starboy", "3:50", "trending", "english", "Starboy The Weeknd Daft Punk"),
    ("en-die-for-you-weeknd-full", "Die For You", "The Weeknd", "Starboy", "4:20", "romantic", "english", "Die For You The Weeknd"),
    ("en-save-your-tears-weeknd-full", "Save Your Tears", "The Weeknd", "After Hours", "3:35", "pop", "english", "Save Your Tears The Weeknd"),
    ("en-as-it-was-harry-full", "As It Was", "Harry Styles", "Harry's House", "2:47", "pop", "english", "As It Was Harry Styles"),
    ("en-water-melon-sugar-full", "Watermelon Sugar", "Harry Styles", "Fine Line", "2:54", "pop", "english", "Watermelon Sugar Harry Styles"),
    ("en-vampire-olivia-full", "vampire", "Olivia Rodrigo", "GUTS", "3:39", "pop", "english", "vampire Olivia Rodrigo"),
    ("en-drivers-license-full", "drivers license", "Olivia Rodrigo", "SOUR", "4:02", "romantic", "english", "drivers license Olivia Rodrigo"),
    ("en-flowers-miley-full-hd", "Flowers", "Miley Cyrus", "Endless Summer Vacation", "3:20", "pop", "english", "Flowers Miley Cyrus official"),
    ("en-bad-guy-billie-full", "bad guy", "Billie Eilish", "WHEN WE ALL FALL ASLEEP", "3:14", "trending", "english", "bad guy Billie Eilish"),
    ("en-birds-of-a-feather-full", "Birds of a Feather", "Billie Eilish", "HIT ME HARD AND SOFT", "3:18", "pop", "english", "Birds of a Feather Billie Eilish official"),
    ("en-lose-control-teddy-full", "Lose Control", "Teddy Swims", "I've Tried Everything But Therapy", "3:30", "pop", "english", "Lose Control Teddy Swims official"),
    ("en-beautiful-things-benson-full", "Beautiful Things", "Benson Boone", "Fireworks & Rollerblades", "3:00", "pop", "english", "Beautiful Things Benson Boone official"),

    # Hindi Extra
    ("in-sajni-re-arijit", "Sajni (From Laapataa Ladies)", "Arijit Singh, Ram Sampath", "Laapataa Ladies", "2:50", "romantic", "hindi", "Sajni Arijit Singh Ram Sampath Laapataa Ladies"),
    ("in-ve-kamleya-arijit", "Ve Kamleya", "Arijit Singh, Shreya Ghoshal", "Rocky Aur Rani Kii Prem Kahaani", "4:07", "romantic", "hindi", "Ve Kamleya Arijit Singh"),
    ("in-pehle-bhi-main-animal", "Pehle Bhi Main", "Vishal Mishra", "Animal", "4:10", "romantic", "hindi", "Pehle Bhi Main Vishal Mishra"),
    ("in-arjan-vailly-animal", "Arjan Vailly", "Bhupinder Babbal", "Animal", "3:02", "trending", "hindi", "Arjan Vailly Bhupinder Babbal"),
    ("in-o-maahi-dunki", "O Maahi", "Arijit Singh", "Dunki", "3:53", "romantic", "hindi", "O Maahi Arijit Singh"),
    ("in-aaj-ki-raat-stree", "Aaj Ki Raat", "Madhubanti Bagchi, Sachin-Jigar", "Stree 2", "3:48", "party", "hindi", "Aaj Ki Raat Madhubanti Bagchi Stree 2"),
    ("in-khoobsurat-stree", "Khoobsurat", "Vishal Mishra, Sachin-Jigar", "Stree 2", "4:04", "romantic", "hindi", "Khoobsurat Vishal Mishra Stree 2"),
    ("in-taras-munjya-song", "Taras", "Jasmine Sandlas, Sachin-Jigar", "Munjya", "3:18", "party", "hindi", "Taras Jasmine Sandlas Munjya"),
    ("in-heeriye-jasleen-arijit", "Heeriye", "Jasleen Royal, Arijit Singh", "Heeriye", "3:14", "romantic", "hindi", "Heeriye Jasleen Royal Arijit Singh"),
    ("in-dhurandhar-big-dawgs", "Big Dawgs", "Hanumankind, Kalmi", "Big Dawgs", "3:54", "trending", "english", "Big Dawgs Hanumankind Kalmi"),

    # Telugu Extra
    ("te-sooseki-pushpa-full", "Sooseki (The Couple Song)", "Shreya Ghoshal, Devi Sri Prasad", "Pushpa 2: The Rule", "4:20", "romantic", "telugu", "Sooseki Pushpa 2 Shreya Ghoshal"),
    ("te-pushpa-pushpa-telugu", "Pushpa Pushpa", "Nakash Aziz, Devi Sri Prasad", "Pushpa 2: The Rule", "4:15", "trending", "telugu", "Pushpa Pushpa Nakash Aziz Pushpa 2"),
    ("te-fear-song-devara-full", "Fear Song", "Anirudh Ravichander", "Devara: Part 1", "3:15", "trending", "telugu", "Fear Song Anirudh Devara"),
    ("te-chuttamalle-devara-full", "Chuttamalle", "Shilpa Rao, Anirudh Ravichander", "Devara: Part 1", "3:44", "romantic", "telugu", "Chuttamalle Shilpa Rao Anirudh Devara"),
    ("te-daavudi-devara-full", "Daavudi", "Nakash Aziz, Akasa Singh, Anirudh", "Devara: Part 1", "3:26", "party", "telugu", "Daavudi Anirudh Devara"),
    ("te-kurchi-madathapetti-telugu", "Kurchi Madathapetti", "Sahithi Chaganti, Sri Krishna, Thaman S", "Guntur Kaaram", "3:38", "party", "telugu", "Kurchi Madathapetti Thaman S Guntur Kaaram"),
    ("te-dum-masala-telugu", "Dum Masala", "Sanjith Hegde, Thaman S", "Guntur Kaaram", "3:25", "trending", "telugu", "Dum Masala Sanjith Hegde Guntur Kaaram"),
    ("te-naa-roja-nuvve-full", "Naa Roja Nuvve", "Hesham Abdul Wahab", "Kushi", "3:58", "romantic", "telugu", "Naa Roja Nuvve Hesham Abdul Wahab"),
    ("te-aradhya-kushi-full", "Aradhya", "Sid Sriram, Chinmayi, Hesham Abdul Wahab", "Kushi", "4:44", "romantic", "telugu", "Aradhya Sid Sriram Hesham"),
    ("te-ammaadi-hi-nanna-full", "Ammaadi", "Kaala Bhairava, Shakthisree Gopalan, Hesham", "Hi Nanna", "4:05", "romantic", "telugu", "Ammaadi Hesham Abdul Wahab Hi Nanna"),

    # Kannada Extra
    ("kn-singara-siriye-kantara", "Singara Siriye", "Vijay Prakash, Ananya Bhat, B. Ajaneesh Loknath", "Kantara", "4:42", "romantic", "kannada", "Singara Siriye Vijay Prakash Kantara"),
    ("kn-varaha-roopam-kantara", "Varaha Roopam Daiva Va Rishtam", "Sai Vignesh, B. Ajaneesh Loknath", "Kantara", "4:36", "devotional", "kannada", "Varaha Roopam Sai Vignesh Kantara"),
    ("kn-toofan-kgf2-kannada", "Toofan", "Ravi Basrur", "K.G.F: Chapter 2", "3:40", "trending", "kannada", "Toofan Ravi Basrur KGF 2"),
    ("kn-sulthana-kgf2-kannada", "Sulthana", "Ravi Basrur", "K.G.F: Chapter 2", "3:48", "trending", "kannada", "Sulthana Ravi Basrur KGF 2"),
    ("kn-mehabooba-kgf2-kannada", "Mehabooba", "Ananya Bhat, Ravi Basrur", "K.G.F: Chapter 2", "3:37", "romantic", "kannada", "Mehabooba Ananya Bhat KGF 2"),
    ("kn-ra-ra-rakkamma-kannada", "Ra Ra Rakkamma", "Sunidhi Chauhan, Nakash Aziz", "Vikrant Rona", "3:45", "party", "kannada", "Ra Ra Rakkamma Sunidhi Chauhan Vikrant Rona"),
    ("kn-belageddu-kirik", "Belageddu", "Vijay Prakash, B. Ajaneesh Loknath", "Kirik Party", "3:40", "party", "kannada", "Belageddu Vijay Prakash Kirik Party"),
    ("kn-anisuthide-mungaru", "Anisuthide Yaako Indu", "Sonu Nigam, Mano Murthy", "Mungaru Male", "4:48", "romantic", "kannada", "Anisuthide Yaako Indu Sonu Nigam Mungaru Male"),
    ("kn-mungaru-maleye-song", "Mungaru Maleye", "Sonu Nigam, Mano Murthy", "Mungaru Male", "4:55", "romantic", "kannada", "Mungaru Maleye Sonu Nigam Mungaru Male"),
    ("kn-ninnindale-milana-song", "Ninnindale", "Sonu Nigam, Mano Murthy", "Milana", "4:35", "romantic", "kannada", "Ninnindale Sonu Nigam Milana"),

    # Gujarati Extra
    ("gu-khalasi-gotilo-aditya", "Khalasi (Gotilo)", "Aditya Gadhvi, Achint", "Coke Studio Bharat", "3:58", "trending", "gujarati", "Khalasi Gotilo Aditya Gadhvi"),
    ("gu-chogada-tara-darshan", "Chogada", "Darshan Raval, Asees Kaur", "Loveyatri", "4:10", "party", "gujarati", "Chogada Tara Darshan Raval"),
    ("gu-kamariya-darshan-mitron", "Kamariya", "Darshan Raval", "Mitron", "3:08", "party", "gujarati", "Kamariya Darshan Raval Mitron"),
    ("gu-dholida-gangubai-song", "Dholida", "Jahnvi Shrimankar, Sanjay Leela Bhansali", "Gangubai Kathiawadi", "2:59", "party", "gujarati", "Dholida Jahnvi Shrimankar"),
    ("gu-radha-ne-shyam-sachin", "Radha Ne Shyam Mali Jashe", "Sachin-Jigar, Shruti Pathak", "Radha Ne Shyam", "4:45", "romantic", "gujarati", "Radha Ne Shyam Mali Jashe Sachin Jigar"),
    ("gu-rona-ser-ma-geeta", "Rona Ser Ma", "Geeta Rabari", "Rona Ser Ma", "4:32", "party", "gujarati", "Rona Ser Ma Geeta Rabari"),
    ("gu-char-bangadi-kinjal", "Char Char Bangadi Vadi Gadi", "Kinjal Dave", "Char Bangadi", "4:15", "party", "gujarati", "Char Char Bangadi Vadi Gadi Kinjal Dave"),
    ("gu-nagada-sang-dhol-ramleela", "Nagada Sang Dhol", "Shreya Ghoshal, Osman Mir", "Goliyon Ki Raasleela Ram-Leela", "4:33", "party", "gujarati", "Nagada Sang Dhol Shreya Ghoshal"),

    # Punjabi Extra
    ("pj-lover-diljit-song", "Lover", "Diljit Dosanjh", "MoonChild Era", "3:05", "romantic", "punjabi", "Lover Diljit Dosanjh"),
    ("pj-goat-diljit-song", "G.O.A.T.", "Diljit Dosanjh", "G.O.A.T.", "3:43", "trending", "punjabi", "GOAT Diljit Dosanjh"),
    ("pj-born-to-shine-song", "Born to Shine", "Diljit Dosanjh", "G.O.A.T.", "3:32", "trending", "punjabi", "Born to Shine Diljit Dosanjh"),
    ("pj-kinni-kinni-song", "Kinni Kinni", "Diljit Dosanjh", "Ghost", "3:18", "party", "punjabi", "Kinni Kinni Diljit Dosanjh"),
    ("pj-hass-hass-song", "Hass Hass", "Diljit Dosanjh, Sia", "Hass Hass", "2:34", "romantic", "punjabi", "Hass Hass Diljit Dosanjh Sia"),
    ("pj-softly-karan-song", "Softly", "Karan Aujla, Ikky", "Making Memories", "2:35", "romantic", "punjabi", "Softly Karan Aujla Ikky"),
    ("pj-admiring-you-karan-song", "Admiring You", "Karan Aujla, Preston Pablo, Ikky", "Making Memories", "3:34", "romantic", "punjabi", "Admiring You Karan Aujla"),
    ("pj-winning-speech-karan-song", "Winning Speech", "Karan Aujla, Mxrci", "Street Dreams", "3:12", "trending", "punjabi", "Winning Speech Karan Aujla"),
    ("pj-52-bars-karan-song", "52 Bars", "Karan Aujla, Ikky", "Four You", "3:24", "trending", "punjabi", "52 Bars Karan Aujla"),
    ("pj-excuses-ap-song", "Excuses", "AP Dhillon, Gurinder Gill", "Hidden Gems", "2:56", "romantic", "punjabi", "Excuses AP Dhillon"),
    ("pj-insane-ap-song", "Insane", "AP Dhillon, Shinda Kahlon", "Insane", "3:26", "trending", "punjabi", "Insane AP Dhillon"),
    ("pj-with-you-ap-song", "With You", "AP Dhillon", "With You", "2:32", "romantic", "punjabi", "With You AP Dhillon"),
    ("pj-summer-high-ap-song", "Summer High", "AP Dhillon", "Summer High", "2:57", "romantic", "punjabi", "Summer High AP Dhillon"),
    ("pj-cheques-shubh-song", "Cheques", "Shubh", "Still Rollin", "3:03", "trending", "punjabi", "Cheques Shubh"),
    ("pj-no-love-shubh-song", "No Love", "Shubh", "No Love", "2:50", "trending", "punjabi", "No Love Shubh"),
    ("pj-we-rollin-shubh-song", "We Rollin", "Shubh", "We Rollin", "3:19", "trending", "punjabi", "We Rollin Shubh"),
    ("pj-295-sidhu-song", "295", "Sidhu Moose Wala", "Moosetape", "4:30", "trending", "punjabi", "295 Sidhu Moose Wala"),
    ("pj-so-high-sidhu-song", "So High", "Sidhu Moose Wala", "PBX 1", "3:38", "trending", "punjabi", "So High Sidhu Moose Wala"),
]

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    ms_content = f.read()

end_pattern = r'(\n\s*\}\s*\n)(\s*\]\.map\(normalizeTrack\);)'
match = re.search(end_pattern, ms_content)
if not match:
    print("Could not find end of DEMO_CATALOG array")
    exit(1)

existing_ids = set(re.findall(r'"id":\s*"([^"]+)"', ms_content))
print(f"Existing tracks in catalog: {len(existing_ids)}")

tracks_to_add = []
for tid, title, artist, album, duration, category, lang, query in BONUS_TRACKS:
    if tid not in existing_ids:
        track_obj = {
            "id": tid,
            "title": title,
            "artist": artist,
            "album": album,
            "duration": duration,
            "category": category,
            "ytId": "",
            "ytSearchQuery": query,
            "storagePath": f"{tid}.mp3",
            "source": f"Pulse {category.title()} Vault"
        }
        tracks_to_add.append(track_obj)
        existing_ids.add(tid)

if tracks_to_add:
    formatted_new_tracks = ",\n" + ",\n".join([f"  {json.dumps(t, indent=2)}" for t in tracks_to_add])
    updated_ms_content = ms_content[:match.end(1)] + formatted_new_tracks + "\n" + ms_content[match.start(2):]
    with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
        f.write(updated_ms_content)
    print(f"Added {len(tracks_to_add)} bonus tracks. Total catalog size: {len(existing_ids)}")
else:
    print("All bonus tracks already present.")
