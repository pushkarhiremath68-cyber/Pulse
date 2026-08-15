import yt_dlp
import time

test_songs = [
    ("in-tera-rastaa-chhodoon-na", "Tera Rastaa Chhodoon Na", "Arijit Singh"),
    ("in-subhanallah", "Subhanallah", "Sreerama Chandra, Shilpa Rao"),
    ("in-ajj-din-chadheya", "Ajj Din Chadheya", "Arijit Singh"),
    ("in-bheegi-si-bhaagi-si", "Bheegi Si Bhaagi Si", "Neeraj Shridhar, Antara Mitra"),
    ("in-chand-sifarish", "Chand Sifarish", "Shaan, Kailash Kher"),
    ("in-main-yahaan-tu-wahaan", "Main Yahaan Tu Wahaan", "Amitabh Bachchan, Alka Yagnik"),
    ("in-yeh-ladka-hai-allah", "Yeh Ladka Hai Allah", "Udit Narayan, Alka Yagnik"),
    ("in-mitwa", "Mitwa", "Shafqat Amanat Ali, Shankar Mahadevan"),
    ("in-humko-humise-chura-lo", "Humko Humise Chura Lo", "Lata Mangeshkar, Udit Narayan"),
    ("in-jiya-jale", "Jiya Jale", "Lata Mangeshkar, M.G. Sreekumar"),
    ("in-tu-hi-re", "Tu Hi Re", "Hariharan, Kavita Krishnamurthy"),
    ("in-udi-udi-jaye", "Udi Udi Jaye", "Sukhwinder Singh"),
    ("en-watermelon-sugar", "Watermelon Sugar", "Harry Styles"),
    ("en-irreplaceable-beyonc", "Irreplaceable", "Beyonce"),
]

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'extract_flat': True,
    'default_search': 'ytsearch1:',
}

print("Testing fast flat-extract for song icons / thumbnails:")
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    for tid, title, artist in test_songs:
        clean_artist = artist.split(',')[0].split('&')[0].strip()
        q = f"{title} {clean_artist} official audio song"
        t0 = time.time()
        try:
            info = ydl.extract_info(q, download=False)
            if 'entries' in info and len(info['entries']) > 0:
                entry = info['entries'][0]
                yid = entry.get('id')
                # HQ default thumbnail
                thumb = f"https://i.ytimg.com/vi/{yid}/hqdefault.jpg"
                elapsed = time.time() - t0
                print(f"[OK {elapsed:.2f}s] {title} -> ytId: {yid} | Icon: {thumb}")
        except Exception as e:
            print(f"[ERR] {title}: {e}")
