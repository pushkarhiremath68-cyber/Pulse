import os
import json
import re
import time
import yt_dlp
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_DIR = os.path.join(ROOT, 'storage', 'music')
os.makedirs(MUSIC_DIR, exist_ok=True)

TOP_SONGS = [
    ("in-kesariya", "Kesariya", "Arijit Singh", "W1S9AbHpWFY"),
    ("in-apna-bana-le", "Apna Bana Le", "Arijit Singh", "ElZfdU54Cp8"),
    ("in-chaleya", "Chaleya", "Arijit Singh", "VAdGW7QDJiU"),
    ("in-sajni", "Sajni", "Arijit Singh", "k3g_WjLCsXM"),
    ("in-satranga", "Satranga", "Arijit Singh", "HrnrqYxYrbk"),
    ("in-o-maahi", "O Maahi", "Arijit Singh", "Etkd-07gnxM"),
    ("in-tauba-tauba", "Tauba Tauba", "Karan Aujla", "LK7-_dgAVQE"),
    ("in-aaj-ki-raat", "Aaj Ki Raat", "Madhubanti Bagchi", "hxMNYkLN7tI"),
    ("in-heeriye", "Heeriye", "Jasleen Royal", "RLzC55ai0eo"),
    ("in-tum-se-hi", "Tum Se Hi", "Mohit Chauhan", "Cb6wuzOurPc"),
    ("in-tum-hi-ho", "Tum Hi Ho", "Arijit Singh", "Umqb9KENgmk"),
    ("in-agar-tum-saath-ho", "Agar Tum Saath Ho", "Arijit Singh", "sK7riqg2mr4"),
    ("in-channa-mereya", "Channa Mereya", "Arijit Singh", "bzSTpdcs-EI"),
    ("in-ve-kamleya", "Ve Kamleya", "Arijit Singh", "QXJyMpxd210"),
    ("in-ve-haaniyaan", "Ve Haaniyaan", "Danny", "E_SbwSe15y0"),
    ("in-baarish-ban-jaana", "Baarish Ban Jaana", "Stebin Ben", "KVh4KtUSW3A"),
    ("in-phir-aur-kya-chahiye", "Phir Aur Kya Chahiye", "Arijit Singh", "PR_mFnjFidk"),
    ("in-dil-diyan-gallan", "Dil Diyan Gallan", "Atif Aslam", "SAcpESN_Fk4"),
    ("in-ranjha", "Ranjha", "B Praak", "V7LwfY5U5WI"),
    ("in-pal-pal-dil-ke-paas", "Pal Pal Dil Ke Paas", "Kishore Kumar", "lgTHGZF3BQw"),
    ("in-lag-ja-gale", "Lag Ja Gale", "Lata Mangeshkar", "HnLtNrvfZTU"),
    ("in-mere-sapno-ki-rani", "Mere Sapno Ki Rani", "Kishore Kumar", "7Ib33wy6OT4"),
    ("in-baarishein", "Baarishein", "Anuv Jain", "PJWemSzExXs"),
    ("in-husn", "Husn", "Anuv Jain", "gJLVTKhTnog"),
    ("in-choo-lo", "Choo Lo", "The Local Train", "sFMRqxCexDk"),
    ("in-kasoor", "Kasoor", "Prateek Kuhad", "BmUe3-sfr7E"),
    ("in-udi-udi-jaye", "Udi Udi Jaye", "Sukhwinder Singh", "WQfdwsPao9E"),
    ("in-aye-udi-udi", "Aye Udi Udi Udi", "Adnan Sami", "0ZINK1mD-jM"),
    ("in-udi-guzaarish", "Udi", "Sunidhi Chauhan", "hbP3vLetsnM"),
    ("in-udd-gaye", "Udd Gaye", "Ritviz", "v2-9rIL_f4w"),
    ("en-shape-of-you", "Shape of You", "Ed Sheeran", "JGwWNGJdvx8"),
    ("en-blinding-lights", "Blinding Lights", "The Weeknd", "4NRXx6U8ABQ"),
    ("en-espresso", "Espresso", "Sabrina Carpenter", "lOVPUbSNSUk"),
    ("en-cruel-summer", "Cruel Summer", "Taylor Swift", "ic8j13piAhQ"),
    ("in-brown-munde", "Brown Munde", "AP Dhillon", "VNs_cCtdbPc"),
    ("in-295-sidhu", "295", "Sidhu Moose Wala", "n_FCrCQ6-bA"),
]

def download_track(item):
    track_id, title, artist, ytid = item
    m4a_path = os.path.join(MUSIC_DIR, f"{track_id}.m4a")
    mp3_path = os.path.join(MUSIC_DIR, f"{track_id}.mp3")
    
    if os.path.exists(m4a_path) or os.path.exists(mp3_path):
        print(f"[ALREADY EXISTS] {title}")
        return True
        
    target = f"https://www.youtube.com/watch?v={ytid}" if (ytid and len(ytid) == 11) else f"{title} {artist} audio"
    out_tmpl = os.path.join(MUSIC_DIR, f"{track_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'outtmpl': out_tmpl,
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'default_search': 'ytsearch1:',
        'socket_timeout': 10,
    }
    
    t0 = time.time()
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([target])
        elapsed = time.time() - t0
        print(f"[DOWNLOADED {elapsed:.1f}s] {title}")
        return True
    except Exception as e:
        print(f"[ERROR] {title}: {e}")
        return False

print(f"Starting parallel download of {len(TOP_SONGS)} top popular songs into storage/music/...")
with ThreadPoolExecutor(max_workers=5) as executor:
    results = list(executor.map(download_track, TOP_SONGS))

print(f"\nCompleted: {sum(1 for r in results if r)} / {len(TOP_SONGS)} available on disk!")
print("Audio files on disk:", len(os.listdir(MUSIC_DIR)))
