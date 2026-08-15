import yt_dlp
import os

browsers = ['edge', 'chrome', 'brave', 'firefox']
for b in browsers:
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'quiet': True,
            'cookiesfrombrowser': (b, ),
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info('https://www.youtube.com/watch?v=lOVPUbSNSUk', download=False)
            print(f"SUCCESS with browser cookies '{b}': title={info.get('title')}, duration={info.get('duration')}s")
            break
    except Exception as e:
        print(f"Browser cookies '{b}' failed: {e}")
