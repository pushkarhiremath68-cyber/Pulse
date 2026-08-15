import yt_dlp
import json

ydl_opts = {
    'quiet': True,
    'no_warnings': True,
    'noplaylist': True,
    'default_search': 'ytsearch1:',
    'socket_timeout': 10,
    'extract_flat': True,
    'extractor_args': {'youtube': {'player_client': ['ios', 'android', 'mweb']}},
}

test_queries = [
    "Shayad Arijit Singh Love Aaj Kal",
    "Kabira Yeh Jawaani Hai Deewani Pritam",
    "Maan Meri Jaan King",
    "Jo Tum Mere Ho Anuv Jain",
    "Singara Siriye Kantara",
    "52 Gaj Ka Daman Renuka Panwar",
    "Softly Karan Aujla",
    "Excuses AP Dhillon",
    "Naatu Naatu RRR",
    "Dhurandhar",
    "zulfein",
    "udi udi",
    "dheema dheema"
]

with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    for q in test_queries:
        try:
            info = ydl.extract_info(f"ytsearch1:{q} official", download=False)
            entries = info.get('entries', [])
            if entries:
                first = entries[0]
                yt_id = first.get('id')
                # Best thumbnail resolution
                thumb = f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"
                title = first.get('title')
                print(f"[SUCCESS] '{q}' -> ID: {yt_id} -> {thumb} ({title[:40]})")
            else:
                print(f"[NO ENTRY] '{q}'")
        except Exception as e:
            print(f"[ERROR] '{q}': {e}")
