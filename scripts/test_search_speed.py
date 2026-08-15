import yt_dlp
import time

test_queries = [
    ("Kesariya", "Arijit Singh", ""),
    ("Shape of You", "Ed Sheeran", ""),
    ("Blinding Lights", "The Weeknd", ""),
    ("Tauba Tauba", "Karan Aujla", ""),
    ("Tum Se Hi", "Mohit Chauhan, Pritam", ""),
    ("Gulabi Aankhen", "Mohammed Rafi", ""),
    ("Mere Sapno Ki Rani", "Kishore Kumar", ""),
    ("Dil Diyan Gallan", "Atif Aslam", ""),
    ("Channa Mereya", "Arijit Singh", ""),
    ("Espresso", "Sabrina Carpenter", ""),
    ("Cruel Summer", "Taylor Swift", ""),
    ("Brown Munde", "AP Dhillon", ""),
    ("295", "Sidhu Moose Wala", ""),
    ("Udi Udi Jaye", "Sukhwinder Singh", ""),
    ("Ghungroo", "Arijit Singh, Shilpa Rao", ""),
    ("Kala Chashma", "Badshah, Neha Kakkar", ""),
    ("Zara Hatke Zara Bachke", "Tere Vaaste", ""),
    ("Pasoori", "Ali Sethi, Shae Gill", ""),
]

ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'default_search': 'ytsearch1:',
    'socket_timeout': 6,
    'extract_flat': False,
}

print("Testing 18 varied tracks with yt-dlp search:")
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    for title, artist, ytid in test_queries:
        clean_artist = artist.split(',')[0].split('&')[0].strip()
        q = f"{title} {clean_artist} audio" if clean_artist else f"{title} audio"
        t0 = time.time()
        try:
            info = ydl.extract_info(q, download=False)
            if 'entries' in info and len(info['entries']) > 0:
                info = info['entries'][0]
            url = info.get('url')
            dur = info.get('duration')
            elapsed = time.time() - t0
            print(f"[{'OK' if url else 'FAIL'} {elapsed:.2f}s] {title} ({artist}) -> {dur}s | {info.get('title')[:45]}")
        except Exception as e:
            elapsed = time.time() - t0
            print(f"[ERR {elapsed:.2f}s] {title} ({artist}) -> {e}")
