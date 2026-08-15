import yt_dlp
import os

ydl_opts = {
    'format': 'bestaudio[ext=m4a]/bestaudio/best',
    'outtmpl': os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'storage', 'music', 'en-espresso.%(ext)s'),
    'extractor_args': {
        'youtube': {
            'player_client': ['tv_embedded', 'tv']
        }
    },
    'quiet': False,
    'noplaylist': True,
}

yt_id = "lOVPUbSNSUk" # Sabrina Carpenter Espresso
target = f"https://www.youtube.com/watch?v={yt_id}"

print("Testing yt-dlp with tv_embedded client...")
try:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([target])
    print("SUCCESS! Downloaded full Espresso with tv_embedded!")
except Exception as e:
    print(f"Error: {e}")
