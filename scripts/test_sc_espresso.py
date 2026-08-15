import yt_dlp
import os

MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music')

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': os.path.join(MUSIC_DIR, "en-espresso.%(ext)s"),
    'quiet': False,
    'noplaylist': True,
    'default_search': 'scsearch1:',
}

try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download(["scsearch1:Sabrina Carpenter Espresso"])
    for ext in ['.mp3', '.m4a', '.webm', '.ogg']:
        f = os.path.join(MUSIC_DIR, f"en-espresso{ext}")
        if os.path.exists(f):
            print(f"SUCCESS SoundCloud: {f} ({os.path.getsize(f)} bytes)")
except Exception as e:
    print(f"Error: {e}")
