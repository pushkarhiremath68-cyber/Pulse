import yt_dlp
import os

MUSIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music')

# Test fetching full Espresso track with yt-dlp
dest = os.path.join(MUSIC_DIR, "en-espresso.mp4")

ydl_opts = {
    'format': 'bestaudio/best',
    'outtmpl': os.path.join(MUSIC_DIR, "en-espresso.%(ext)s"),
    'quiet': False,
    'noplaylist': True,
    'default_search': 'ytsearch1:',
    'extractor_args': {
        'youtube': {
            'player_client': ['web_creator', 'ios', 'android_vr'],
            'player_skip': ['webpage', 'configs'],
        }
    },
}

queries_to_try = [
    "ytsearch1:Sabrina Carpenter Espresso official audio",
    "ytsearch1:Sabrina Carpenter Espresso official music video",
    "https://www.youtube.com/watch?v=lOVPUbSNSUk"
]

for q in queries_to_try:
    try:
        print(f"Trying: {q}")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([q])
        f = os.path.join(MUSIC_DIR, "en-espresso.mp4")
        if not os.path.exists(f):
            f = os.path.join(MUSIC_DIR, "en-espresso.m4a")
        if os.path.exists(f) and os.path.getsize(f) > 1000000:
            print(f"SUCCESS! Downloaded full Espresso: {os.path.getsize(f)} bytes")
            break
    except Exception as e:
        print(f"Error with {q}: {e}")
