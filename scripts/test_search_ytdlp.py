import yt_dlp
import json

query = "ytsearch10:Starboy The Weeknd"
ydl_opts = {
    'quiet': True,
    'extract_flat': True,
    'skip_download': True
}
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    info = ydl.extract_info(query, download=False)
    entries = info.get('entries', [])
    print(f"Found {len(entries)} search results for '{query}':")
    for idx, e in enumerate(entries[:5]):
        print(f"  {idx+1}. {e.get('title')} (ID: {e.get('id')}) - by {e.get('uploader')}")
