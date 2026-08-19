import json
try:
    import yt_dlp
    print("yt_dlp version:", yt_dlp.version.__version__)
    
    test_target = "https://www.youtube.com/watch?v=fHI8X4OXluQ" # Blinding Lights
    ydl_opts = {
        'quiet': True,
        'format': 'bestaudio/best',
        'skip_download': True,
        'socket_timeout': 10
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(test_target, download=False)
        formats = info.get('formats', [])
        audio_formats = [f for f in formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none']
        print(f"Extracted {len(audio_formats)} direct pure audio streams for '{info.get('title')}'")
        if audio_formats:
            audio_formats.sort(key=lambda f: f.get('abr') or f.get('tbr') or 0, reverse=True)
            best = audio_formats[0]
            print(f"Top Pure Audio Stream: acodec={best.get('acodec')}, abr={best.get('abr')}k, url={best.get('url')[:80]}...")
except Exception as e:
    print("yt_dlp test notice:", e)
