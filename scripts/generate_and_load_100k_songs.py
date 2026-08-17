"""
Pulse Music - Mega 100,000 Songs Generator & Supabase High-Throughput Batch Loader
Generates 100,000 rich, structured songs across all languages & genres and
batch-inserts them concurrently into Supabase PostgreSQL 'public.songs' table.
"""

import os
import json
import urllib.request
import urllib.error
import time
import random
import hashlib
import concurrent.futures
import threading

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(ROOT, '.env')

SUPABASE_URL = "https://iukyohqoftmrueeucaoo.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1a3lvaHFvZnRtcnVlZXVjYW9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MTg0MCwiZXhwIjoyMTAyNDY3ODQwfQ.U3KaIVmOYC__N1rwhqjZfyxQ6tjovgcMJ6bLVaIFJAs"

EXPANDED_SEEDS = {
    "Hindi": {
        "category": "bollywood",
        "artists": [
            "Arijit Singh", "Shreya Ghoshal", "KK", "Atif Aslam", "Mohit Chauhan",
            "Sonu Nigam", "Kishore Kumar", "Lata Mangeshkar", "Mohammed Rafi", "Asha Bhosle",
            "Udit Narayan", "Alka Yagnik", "Kumar Sanu", "Sunidhi Chauhan", "Vishal Dadlani",
            "Pritam", "Sachin-Jigar", "Shankar-Ehsaan-Loy", "Amit Trivedi", "Jubin Nautiyal",
            "Neha Kakkar", "Armaan Malik", "Darshan Raval", "Stebin Ben", "B Praak",
            "Jasleen Royal", "Prateek Kuhad", "Anuv Jain", "Aditya Rikhari", "Lucky Ali",
            "A.R. Rahman", "Sanam Puri", "Shaan", "Javed Ali", "Mika Singh", "Badshah",
            "Yo Yo Honey Singh", "Raftaar", "Divine", "King", "Guru Randhawa", "Kavita Krishnamurthy",
            "Sadhana Sargam", "Abhijeet Bhattacharya", "Hariharan", "Pankaj Udhas", "Jagjit Singh"
        ],
        "song_prefixes": [
            "Tum", "Dil", "Ishq", "Tere", "Mere", "Hum", "Pyaar", "Raat", "Safar", "Zindagi",
            "Khwaab", "Yaad", "Aasman", "Dhadkan", "Naina", "Humsafar", "Dastaan", "Mehfooz",
            "Deewana", "Dua", "Bawara", "Jaan", "Roshni", "Mast", "Fiza", "Saiyaan", "Chahat",
            "Bekhayali", "Shayad", "Channa", "Agar Tum", "Kesariya", "Apna Bana", "Chaleya",
            "Sajni", "Phir Aur", "O Maahi", "Satranga", "Ve Kamleya", "Heeriye", "Soulmate"
        ],
        "song_suffixes": [
            "Hi Ho", "Bina", "Sath", "Mein", "Se Door", "Ki Baat", "Ka Safar", "Ke Saath",
            "Bana Le", "Ka Nasha", "Rang", "Galiyan", "Aawara", "Deewani", "Hawa", "Jaisi",
            "Ki Raat", "Ke Pal", "Khwaab", "Sanam", "Kahaani", "Taraana", "Nain", "Guzarish",
            "Mereya", "Le", "Vibes", "Acoustic", "Unplugged", "Reprise", "Remix", "Lounge"
        ],
        "target": 22000
    },
    "Punjabi": {
        "category": "punjabi",
        "artists": [
            "Diljit Dosanjh", "Karan Aujla", "AP Dhillon", "Sidhu Moose Wala", "Shubh",
            "Amrinder Gill", "Guru Randhawa", "Harrdy Sandhu", "Jass Manak", "B Praak",
            "Jaani", "Sunanda Sharma", "Ammy Virk", "Parmish Verma", "Gippy Grewal",
            "Jordan Sandhu", "Maninder Buttar", "Kaka", "Prem Dhillon", "Wazir Patar",
            "Sukha", "Chani Nattan", "The PropheC", "Pav Dharia", "Mankirt Aulakh",
            "Navaan Sandhu", "Mickey Singh", "Gurinder Gill", "Arjan Dhillon", "Tegi Pannu",
            "Cheetah", "Jasmine Sandlas", "Nimrat Khaira", "Garry Sandhu", "Kulwinder Billa"
        ],
        "song_prefixes": [
            "Jatt", "Yaar", "Gaddi", "Vibe", "Bandook", "Levels", "Lover", "Born",
            "Winning", "Softly", "No Love", "Cheques", "Baller", "Excuses", "Majhail",
            "Old Skool", "Desires", "Insane", "Toxic", "Summer High", "G.O.A.T.", "Drip",
            "Taara", "Peg", "Brand", "Rider", "Suit", "Koka", "Jutti", "Gabru", "Antidote",
            "52 Bars", "Admiring You", "Bachke", "White Brown Black", "One Love", "King Shit"
        ],
        "song_suffixes": [
            "Life", "Di Gedi", "Da Daur", "Nu", "Wala", "Touch", "Speech", "Style",
            "Squad", "Flow", "Anthem", "Swag", "Mood", "Season", "Chhori", "Scene",
            "Vibes", "Yaari", "Sher", "Clash", "Bars", "Gang", "Raid", "Track", "Jatt Da"
        ],
        "target": 18000
    },
    "Kannada": {
        "category": "kannada",
        "artists": [
            "Sonu Nigam", "Sanjith Hegde", "Vijay Prakash", "SP Balasubrahmanyam",
            "Rajesh Krishnan", "Anuradha Bhat", "Shreya Ghoshal", "Armaan Malik",
            "All OK", "Raghu Dixit", "Charan Raj", "Ravi Basrur", "Arjun Janya",
            "V. Harikrishna", "Hamsalekha", "Chandan Shetty", "Vasuki Vaibhav",
            "K. S. Chithra", "Pancham Jeeva", "Supriya Ram", "C. Ashwath", "Manjula Gururaj"
        ],
        "song_prefixes": [
            "Anisuthide", "Mungaru", "Belageddu", "Singara", "Bombe", "Ninna", "Naguva",
            "Preethi", "Jotheyali", "Kantara", "KGF", "Tagaru", "Kaagadada", "Neenade",
            "Hrudayada", "Marali", "Chuttu", "Pasandaagavne", "Pushpavati", "Ee Sanje",
            "Varaha", "Salaam", "Toofan", "Sulthana", "Mehabooba", "Ra Ra Rakkamma"
        ],
        "song_suffixes": [
            "Maleye", "Siriye", "Helutaite", "Nayana", "Snehadinda", "Doniyalli", "Naa",
            "Kano", "Rakkamma", "Banthu", "Beladingalu", "Hoovagide", "Gellalare", "Haadu",
            "Raga", "Payana", "Loka", "Chinna", "Yenagali", "Roopam", "Shuruvayitu"
        ],
        "target": 12000
    },
    "Telugu": {
        "category": "telugu",
        "artists": [
            "Sid Sriram", "Anurag Kulkarni", "Ram Miriyala", "Devi Sri Prasad",
            "Thaman S", "AR Rahman", "SP Balasubrahmanyam", "KS Chithra", "Mangli",
            "Armaan Malik", "Shreya Ghoshal", "Shankar Mahadevan", "Karthik",
            "Geetha Madhuri", "Rahul Sipligunj", "Anirudh Ravichander", "Hesham Abdul Wahab",
            "M. M. Keeravani", "Kaala Bhairava", "Sunitha Upadrashta", "Deepu", "Hemachandra"
        ],
        "song_prefixes": [
            "Samajavaragamana", "Butta", "Inkem", "Srivalli", "Naatu", "Kalaavathi",
            "Chuttamalle", "Pushpa", "Fear", "Kurchi", "Oo", "Daavudi", "Pilla",
            "Adiga", "Nee Kannu", "Dheevara", "Saami", "Ramuloo", "Top Lesi", "Sooseki",
            "Dum Masala", "Kadalalle", "Inthandham", "Oh Sita Hey Rama", "Arjun Reddy"
        ],
        "song_suffixes": [
            "Bomma", "Inkem", "Naatu", "Song", "Madathapetti", "Antava", "Raa",
            "Adiga", "Neeli Samudram", "Saami", "Ramulaa", "Poddi", "Theme", "Kummudu",
            "Rangu", "Bottesina", "Choodangane", "Vinadhuga", "Mohabbat", "Raju"
        ],
        "target": 12000
    },
    "Tamil": {
        "category": "tamil",
        "artists": [
            "Anirudh Ravichander", "AR Rahman", "Yuvan Shankar Raja", "Harris Jayaraj",
            "Sid Sriram", "Dhanush", "D. Imman", "Santhosh Narayanan", "SP Balasubrahmanyam",
            "KS Chithra", "Jonita Gandhi", "Pradeep Kumar", "Sean Roldan", "Shweta Mohan",
            "G. V. Prakash Kumar", "Vijay Antony", "K. J. Yesudas", "Chinmayi Sripaada"
        ],
        "song_prefixes": [
            "Arabic", "Vaathi", "Rowdy", "Hukum", "Badass", "Kalyana", "Naan", "Enjoy",
            "Chellamma", "Two Two", "Megham", "Marakkuma", "Neeyum", "Kaathuvaakula", "Leo",
            "Jailer", "Vikram", "Master", "Rathamaarey", "Hayyoda", "Bloody Sweet"
        ],
        "song_suffixes": [
            "Kuthu", "Coming", "Baby", "Thalaivar", "Vayasu", "Pizhai", "Enjami", "Karukku",
            "Two", "Rendu", "Nenje", "Bloody", "Sweet", "Rathamaarey", "Ordinary Person", "Vibe"
        ],
        "target": 10000
    },
    "Malayalam": {
        "category": "malayalam",
        "artists": [
            "Sushin Shyam", "Hesham Abdul Wahab", "Vineeth Sreenivasan", "Shaan Rahman",
            "MG Sreekumar", "KS Chithra", "Job Kurian", "Sooraj Santhosh", "Sithara Krishnakumar",
            "K. J. Yesudas", "Sujatha Mohan", "Gopi Sundar", "Bijibal", "Jassie Gift"
        ],
        "song_prefixes": [
            "Aavesham", "Darshana", "Illuminati", "Kuthanthram", "Manavalan", "Parayuvaan",
            "Ranam", "Thalatherichavar", "Neela", "Cherathukal", "Jaathikkathottam", "Kudukku"
        ],
        "song_suffixes": [
            "Thug", "Vibe", "Beat", "Love", "Feel", "Night", "Wave", "Soul", "Groove", "Melody"
        ],
        "target": 4000
    },
    "English": {
        "category": "pop",
        "artists": [
            "Taylor Swift", "The Weeknd", "Drake", "Ariana Grande", "Ed Sheeran",
            "Bruno Mars", "Dua Lipa", "Billie Eilish", "Justin Bieber", "Eminem",
            "Post Malone", "Maroon 5", "Imagine Dragons", "Coldplay", "Harry Styles",
            "Olivia Rodrigo", "Kendrick Lamar", "Travis Scott", "Rihanna", "Beyoncé",
            "Katy Perry", "Adele", "Shawn Mendes", "Charlie Puth", "Sam Smith",
            "Selena Gomez", "Lady Gaga", "Miley Cyrus", "Sia", "OneRepublic",
            "Sabrina Carpenter", "Chappell Roan", "Teddy Swims", "Benson Boone",
            "Doja Cat", "SZA", "Lil Nas X", "Jack Harlow", "Morgan Wallen", "Noah Kahan"
        ],
        "song_prefixes": [
            "Blinding", "Cruel", "Anti", "Die", "As It", "Bad", "Believer", "Birds",
            "Espresso", "Flowers", "Golden", "Good Luck", "Levitating", "Save Your",
            "Shape of", "Starboy", "Sunflower", "Until I", "Vampire", "Watermelon",
            "Lose", "Midnight", "Perfect", "Radioactive", "Someone", "Stay", "Thunder",
            "Not Like Us", "Taste", "Please Please", "Fortnight", "Paint The Town", "Greedy"
        ],
        "song_suffixes": [
            "Lights", "Summer", "Hero", "With A Smile", "Was", "Guy", "Of A Feather",
            "Hour", "Babe", "Tears", "You", "Found You", "Sugar", "Control", "Rain",
            "Memories", "Demons", "Like You", "With Me", "Tonight", "Forever", "City", "Red"
        ],
        "target": 14000
    },
    "Devotional": {
        "category": "devotional",
        "artists": [
            "Gulshan Kumar", "Anuradha Paudwal", "Hariharan", "Anup Jalota",
            "Lakhbir Singh Lakkha", "Jagjit Singh", "Suresh Wadkar", "Maanya Arora",
            "Hansraj Raghuwanshi", "Jubin Nautiyal", "Agam Aggarwal", "Pujya Bhaishri",
            "Ravindra Jain", "Richa Sharma", "Kailash Kher", "Bhavna Sharma"
        ],
        "song_prefixes": [
            "Shri Hanuman", "Shiv Tandav", "Achyutam", "Aigiri", "Kaal Bhairav", "Radha",
            "Shri Krishna", "Namo", "Ram", "Mere Ghar", "Har Har", "Ganesh", "Gayatri",
            "Maha Mrityunjaya", "Waheguru", "Om Jai", "Govinda", "Kondalalo", "Bhagyada",
            "Jai Ganesh", "Sundar Kand", "Bajrang Baan", "Sankat Mochan", "Shiv Amritwani"
        ],
        "song_suffixes": [
            "Chalisa", "Stotram", "Keshavam", "Nandini", "Ashtakam", "Govind Hare",
            "Namo Ji Shankara", "Aayenge", "Ram Aaye Hain", "Shambhu", "Aarti", "Mantra",
            "Simran", "Jagdish Hare", "Namalu", "Nelakonna", "Lakshmi Baaramma", "Amritwani"
        ],
        "target": 4000
    },
    "Lo-Fi & EDM": {
        "category": "lofi",
        "artists": [
            "Alan Walker", "Martin Garrix", "Marshmello", "The Chainsmokers", "Kygo",
            "Avicii", "DJ Snake", "David Guetta", "Kavinsky", "Lofi Fruits Music",
            "Chillhop Music", "Purrple Cat", "Kupla", "Idealism", "Bad Bunny", "Daddy Yankee",
            "J Balvin", "Rauw Alejandro", "Bizarrap", "Peggy Gou", "Fred again..", "Skrillex"
        ],
        "song_prefixes": [
            "Faded", "Alone", "Spectre", "Closer", "Happier", "Wake Me Up", "Levels",
            "Titanium", "Lean On", "Midnight Study", "Rainy Window", "Coffee In Tokyo",
            "Tokyo Sunset", "Night Drive", "Despacito", "Gasolina", "Danza Kuduro", "Pepas",
            "Monaco", "Provenza", "Titi Me Pregunto", "Session 53", "Rumble", "Adore U"
        ],
        "song_suffixes": [
            "Remix", "Lo-Fi Flip", "VIP Mix", "Acoustic Chill", "Slowed + Reverb",
            "Extended Club Mix", "Sunset Edit", "Lounge Version", "Breeze", "Nostalgia", "Club"
        ],
        "target": 4000
    }
}

def generate_100k_dataset():
    print("Generating 100,000 curated song records...")
    all_tracks = []
    seen_ids = set()
    global_counter = 0

    for lang, config in EXPANDED_SEEDS.items():
        category = config["category"]
        artists = config["artists"]
        prefixes = config["song_prefixes"]
        suffixes = config["song_suffixes"]
        target = config["target"]

        count = 0
        combos = []
        for art in artists:
            for p in prefixes:
                for s in suffixes:
                    combos.append((art, f"{p} {s}"))
                    combos.append((art, f"{p} ({s})"))
                    combos.append((art, f"{p} - {s}"))

        random.seed(42 + len(lang))
        random.shuffle(combos)

        idx = 0
        while count < target:
            if idx < len(combos):
                art, title = combos[idx]
            else:
                art = random.choice(artists)
                p = random.choice(prefixes)
                s = random.choice(suffixes)
                title = f"{p} {s} Vol. {random.randint(1, 99)}"

            idx += 1
            clean_title = title.strip()
            slug = f"{clean_title.lower()}-{art.lower()}".replace(" ", "-")
            slug = "".join(c for c in slug if c.isalnum() or c == "-")
            track_id = f"pulse-{lang[:2].lower()}-{slug[:25]}-{hashlib.md5(f'{clean_title}{art}{count}{global_counter}'.encode()).hexdigest()[:6]}"

            if track_id in seen_ids:
                continue
            seen_ids.add(track_id)

            year = random.choice([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026])
            duration_mins = random.randint(2, 5)
            duration_secs = random.randint(10, 59)
            duration = f"{duration_mins}:{duration_secs:02d}"

            encoded_q = clean_title.replace(" ", "+")
            track = {
                "id": track_id,
                "title": clean_title,
                "artist": art,
                "album": f"{clean_title} Hits",
                "cover": f"https://api.dicebear.com/7.x/shapes/svg?seed={track_id}&backgroundColor=0f172a,1e1b4b,311042",
                "duration": duration,
                "year": year,
                "language": lang if lang != "Lo-Fi & EDM" else ("English" if "Bad" not in art else "Spanish"),
                "category": category,
                "audio_url": f"https://api.pulsemusic.app/stream?q={encoded_q}+{art.replace(' ', '+')}",
                "storage_path": f"{track_id}.mp4",
                "source": "Pulse Cloud CDN (320kbps)",
                "play_count": random.randint(50, 50000)
            }

            all_tracks.append(track)
            count += 1
            global_counter += 1

        print(f" - {lang}: {count} songs generated.")

    print(f"\n[DONE] Successfully generated {len(all_tracks)} tracks!")
    return all_tracks

def batch_upload_chunk(chunk, chunk_idx, total_chunks, lock, progress_holder):
    payload = json.dumps(chunk).encode('utf-8')
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/songs",
        data=payload,
        headers={
            'apikey': SERVICE_KEY,
            'Authorization': f'Bearer {SERVICE_KEY}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        method='POST'
    )
    
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                if resp.status in (200, 201):
                    with lock:
                        progress_holder['uploaded'] += len(chunk)
                        curr = progress_holder['uploaded']
                        tot = progress_holder['total']
                        print(f"[{curr}/{tot}] songs uploaded ({(curr/tot)*100:.1f}%) - Chunk {chunk_idx}/{total_chunks} OK")
                    return True
        except Exception as e:
            if attempt == 2:
                print(f"[Chunk {chunk_idx} Failed]: {e}")
            time.sleep(0.5)
    return False

def main():
    print("==================================================")
    print("  Pulse Music - Supabase 100,000 Songs Pipeline")
    print("==================================================")
    
    songs = generate_100k_dataset()
    total = len(songs)
    batch_size = 1000
    chunks = [songs[i:i + batch_size] for i in range(0, total, batch_size)]
    total_chunks = len(chunks)

    print(f"\nUploading {total} songs across {total_chunks} batches (1,000 songs/batch) with 6 parallel workers...")

    lock = threading.Lock()
    progress_holder = {'uploaded': 0, 'total': total}

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = [
            executor.submit(batch_upload_chunk, chunk, idx + 1, total_chunks, lock, progress_holder)
            for idx, chunk in enumerate(chunks)
        ]
        concurrent.futures.wait(futures)

    print("\n==================================================")
    print(f"[COMPLETE] All {progress_holder['uploaded']} / {total} songs populated in Supabase Database!")
    print("==================================================")

if __name__ == '__main__':
    main()
