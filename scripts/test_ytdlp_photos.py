import subprocess
import json

songs = [
    "Shayad Arijit Singh",
    "Kabira Yeh Jawaani Hai Deewani",
    "Maan Meri Jaan King",
    "Jo Tum Mere Ho Anuv Jain",
    "Singara Siriye Kantara",
    "Adiga Adiga Nani",
    "52 Gaj Ka Daman Renuka Panwar",
    "Softly Karan Aujla",
    "Excuses AP Dhillon",
    "Srivalli Telugu Pushpa",
    "Dhurandhar",
    "zulfein",
    "udi udi",
    "dheema dheema"
]

for s in songs:
    cmd = ["yt-dlp", "--default-search", "ytsearch1:", "--dump-json", "--no-playlist", "--no-warnings", f"ytsearch1:{s} Official Audio"]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        if proc.returncode == 0:
            data = json.loads(proc.stdout)
            yt_id = data.get('id')
            thumb = data.get('thumbnail') or f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg"
            title = data.get('title')
            print(f"[FOUND PHOTO] '{s}' -> ID: {yt_id} -> {thumb} ({title[:35]})")
        else:
            print(f"[FAILED] '{s}'")
    except Exception as e:
        print(f"[ERROR] '{s}': {e}")
