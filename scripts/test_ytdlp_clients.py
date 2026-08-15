import yt_dlp

clients_to_test = [
    ['android'],
    ['ios'],
    ['mweb'],
    ['web_embedded'],
    ['tv_embedded'],
    ['android_vr'],
    ['android_creator'],
    ['tv'],
    ['web'],
]

for c in clients_to_test:
    opts = {
        'format': 'bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'extractor_args': {'youtube': {'player_client': c}},
        'socket_timeout': 6,
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info('https://www.youtube.com/watch?v=W1S9AbHpWFY', download=False)
            print(f"SUCCESS with client {c}: title={info.get('title')}")
            break
    except Exception as e:
        print(f"FAIL with client {c}: {str(e)[:100]}")
