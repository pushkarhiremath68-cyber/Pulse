import yt_dlp
import os

clients = [
    'tv',
    'tv_embedded',
    'mweb',
    'android_music',
    'web_safari',
    'web_music',
    'android_vr',
    'android_embedded',
]

for c in clients:
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'extractor_args': {'youtube': {'player_client': [c]}},
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info('https://www.youtube.com/watch?v=lOVPUbSNSUk', download=False)
            print(f"SUCCESS with client '{c}': title={info.get('title')}, duration={info.get('duration')}s")
            break
    except Exception as e:
        print(f"Client '{c}' failed: {e}")
