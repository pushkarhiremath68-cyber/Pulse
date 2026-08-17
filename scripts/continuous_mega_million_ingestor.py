"""
PULSE MUSIC - CONTINUOUS MULTI-MILLION SONG INGESTOR (HIGH-THROUGHPUT MULTI-THREADED ENGINE)
Scales your Supabase catalog across millions of songs using 25 parallel worker threads.
"""

import json
import urllib.request
import urllib.parse
import time
import string
import itertools
from concurrent.futures import ThreadPoolExecutor, as_completed

SUPABASE_URL = "https://fswnnnmicaakeuhwyyai.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd25ubm1pY2Fha2V1aHd5eWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc3NzQsImV4cCI6MjEwMjU2Mzc3NH0.lptcHWEtEv-dEOLK_y7AfwHTbedCg1DCIKviOiuO7KQ"

# Generate exhaustive search combinations for universal coverage
CORE_WORDS = [
    # Top Hindi / Bollywood Roots
    "dil", "ishq", "pyar", "tere", "mera", "jaan", "zindagi", "raat", "mohabbat", "khuda", "sanam", "deewana",
    "tu hi", "humko", "tumko", "tum hi", "pehli", "kabhi", "saath", "duniya", "chale", "aashiqui", "yaara",
    "Arijit Singh", "Atif Aslam", "Shreya Ghoshal", "Pritam", "Sonu Nigam", "KK", "Mohit Chauhan", "Sunidhi Chauhan",
    "Kishore Kumar", "Lata Mangeshkar", "Mohammed Rafi", "Mukesh", "R.D. Burman", "A.R. Rahman", "Jubin Nautiyal",
    "Vishal Mishra", "Sachin Jigar", "Ankit Tiwari", "Badshah", "Yo Yo Honey Singh", "Neha Kakkar", "Armaan Malik",
    # Top English / Global Roots
    "love", "you", "me", "night", "day", "forever", "heart", "dream", "baby", "time", "world", "light",
    "dark", "fire", "rain", "dance", "stay", "eyes", "away", "feel", "life", "star", "home", "good",
    "Taylor Swift", "The Weeknd", "Ed Sheeran", "Drake", "Billie Eilish", "Justin Bieber", "Dua Lipa",
    "Bruno Mars", "Post Malone", "Ariana Grande", "Eminem", "Coldplay", "Imagine Dragons", "Adele", "Rihanna",
    "Maroon 5", "Michael Jackson", "Queen", "Lady Gaga", "Katy Perry", "Harry Styles", "Sam Smith", "Sia",
    # Top Punjabi Roots
    "jatt", "pyaar", "akhiyan", "yaari", "mittran", "gedi", "nachna", "suit", "soorma", "vibe", "gabru",
    "Karan Aujla", "Diljit Dosanjh", "AP Dhillon", "Shubh", "Sidhu Moose Wala", "B Praak", "Jaani", "Ammy Virk",
    # Top Devotional Roots
    "shree", "ram", "krishna", "shiva", "hanuman", "ganesh", "om", "mantra", "bhajan", "aarti", "chalisa",
    "Hanuman Chalisa Hariharan", "Shiv Tandav Shankar Mahadevan", "Achyutam Keshavam", "Gayatri Mantra",
    # Top South Indian Roots
    "prema", "kadhal", "anbe", "kanmani", "nanna", "neenu", "kantara", "pushpa", "srivalli", "singara",
    "Sid Sriram", "Vijay Prakash", "Anirudh Ravichander", "S.P. Balasubrahmanyam", "Devi Sri Prasad", "Thaman S"
]

# Add all 2-letter alphabet combinations ('aa' to 'zz') + Years (1960 to 2026) + Common Prefixes
ALPHABET_COMBOS = [''.join(p) for p in itertools.product(string.ascii_lowercase, repeat=2)]
THREE_LETTER_COMBOS = [f"{a}{b}{c}" for a in 'abcdef' for b in 'aeiou' for c in 'rstlne']
YEARS = [str(y) for y in range(1960, 2027)]

ALL_SEARCH_TERMS = list(dict.fromkeys(CORE_WORDS + YEARS + THREE_LETTER_COMBOS + ALPHABET_COMBOS))

def fetch_saavn_songs(term):
    results = []
    try:
        url = f"https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=40&p=1&_marker=0&ctx=android&q={urllib.parse.quote(term)}"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=6) as res:
            data = json.loads(res.read().decode('utf-8'))
            if data and "results" in data and isinstance(data["results"], list):
                for r in data["results"]:
                    song_id = f"saavn-{r.get('id', str(time.time()))}"
                    title = r.get("song") or r.get("title") or "Unknown"
                    artist = r.get("singers") or r.get("primary_artists") or r.get("artist") or "Various Artists"
                    album = r.get("album") or "Single"
                    cover = (r.get("image") or "").replace("150x150", "500x500").replace("50x50", "500x500")
                    dur_secs = int(r.get("duration", 210))
                    duration = f"{dur_secs // 60}:{(dur_secs % 60):02d}"
                    lang = r.get("language", "Hindi").capitalize()
                    
                    media_url = r.get("media_preview_url", "")
                    if media_url and "preview" in media_url:
                        media_url = media_url.replace("_96_p.mp4", "_320.mp4").replace("preview.saavncdn.com", "aac.saavncdn.com")
                    
                    results.append({
                        "id": song_id,
                        "title": title,
                        "artist": artist,
                        "album": album,
                        "cover": cover,
                        "duration": duration,
                        "audio_url": media_url,
                        "storage_path": f"{song_id}.mp3",
                        "language": lang,
                        "category": "bollywood" if lang == "Hindi" else lang.lower(),
                        "year": int(r.get("year", 2026)),
                        "source": "Pulse Studio Master MP3 (320kbps)"
                    })
    except:
        pass
    return results

def fetch_itunes_songs(term):
    results = []
    try:
        url = f"https://itunes.apple.com/search?term={urllib.parse.quote(term)}&entity=song&limit=40"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=6) as res:
            data = json.loads(res.read().decode('utf-8'))
            if data and "results" in data and isinstance(data["results"], list):
                for r in data["results"]:
                    track_id = f"itunes-{r.get('trackId', str(time.time()))}"
                    title = r.get("trackName") or "Unknown Track"
                    artist = r.get("artistName") or "Various Artists"
                    album = r.get("collectionName") or "Single"
                    cover = (r.get("artworkUrl100") or "").replace("100x100bb.jpg", "600x600bb.jpg")
                    dur_ms = r.get("trackTimeMillis", 210000)
                    dur_secs = dur_ms // 1000
                    duration = f"{dur_secs // 60}:{(dur_secs % 60):02d}"
                    genre = r.get("primaryGenreName", "Pop")

                    results.append({
                        "id": track_id,
                        "title": title,
                        "artist": artist,
                        "album": album,
                        "cover": cover,
                        "duration": duration,
                        "audio_url": None,
                        "storage_path": f"{track_id}.mp3",
                        "language": "English",
                        "category": genre.lower(),
                        "year": int((r.get("releaseDate", "2026"))[:4]),
                        "source": "Pulse Studio Master MP3 (320kbps)"
                    })
    except:
        pass
    return results

def upsert_bulk_batch(batch):
    if not batch:
        return 0
    url = f"{SUPABASE_URL}/rest/v1/songs"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    data_bytes = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status in [200, 201, 204]:
                return len(batch)
    except:
        pass
    return 0

def process_query_task(term):
    s_tracks = fetch_saavn_songs(term)
    i_tracks = fetch_itunes_songs(term)
    combined = s_tracks + i_tracks
    if combined:
        return upsert_bulk_batch(combined)
    return 0

def start_continuous_million_ingestor():
    print("=" * 75)
    print(f"[START] HIGH-THROUGHPUT MULTI-MILLION SONG INGESTOR (25 WORKER THREADS)")
    print(f"Target Project: {SUPABASE_URL}")
    print(f"Total Universal Search Keys: {len(ALL_SEARCH_TERMS)}")
    print("=" * 75)

    total_ingested = 0
    start_time = time.time()

    with ThreadPoolExecutor(max_workers=25) as executor:
        futures = {executor.submit(process_query_task, term): term for term in ALL_SEARCH_TERMS}
        for future in as_completed(futures):
            term = futures[future]
            try:
                count = future.result()
                if count > 0:
                    total_ingested += count
                    rate = total_ingested / max(1, (time.time() - start_time))
                    print(f"   [+] '{term}' -> Ingested {count} MP3 tracks (Running Total: {total_ingested} | Speed: {rate:.1f} songs/sec)")
            except Exception as e:
                pass

    print("\n" + "=" * 75)
    print(f"[COMPLETED] Successfully ingested {total_ingested} MP3 songs into Supabase!")
    print("=" * 75)

if __name__ == "__main__":
    start_continuous_million_ingestor()
