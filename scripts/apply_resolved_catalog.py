import json
import re

with open('catalog_resolved.json', 'r', encoding='utf-8') as f:
    resolved = json.load(f)

# 1. Update musicService.js
with open('src/musicService.js', 'r', encoding='utf-8') as f:
    ms_code = f.read()

for song_id, data in resolved.items():
    cover = data.get('cover')
    yt_id = data.get('ytId')
    audio = data.get('previewUrl')

    if yt_id:
        # Check if ytId is present or needs to be inserted/updated
        # Try replacing existing ytId
        yt_pattern = rf'("id":\s*"{song_id}".*?"ytId":\s*")[^"]*(")'
        if re.search(yt_pattern, ms_code, flags=re.DOTALL):
            ms_code = re.sub(yt_pattern, rf'\g<1>{yt_id}\g<2>', ms_code, count=1, flags=re.DOTALL)
        else:
            # Insert ytId after category or title
            insert_pattern = rf'("id":\s*"{song_id}".*?"category":\s*"[^"]*",)'
            ms_code = re.sub(insert_pattern, rf'\g<1>\n    "ytId": "{yt_id}",', ms_code, count=1, flags=re.DOTALL)

    if cover:
        # Update cover
        cover_pattern = rf'("id":\s*"{song_id}".*?"cover":\s*")[^"]*(")'
        ms_code = re.sub(cover_pattern, rf'\g<1>{cover}\g<2>', ms_code, count=1, flags=re.DOTALL)

    if audio:
        # Add or update audioUrl
        audio_pattern = rf'("id":\s*"{song_id}".*?"audioUrl":\s*")[^"]*(")'
        if re.search(audio_pattern, ms_code, flags=re.DOTALL):
            ms_code = re.sub(audio_pattern, rf'\g<1>{audio}\g<2>', ms_code, count=1, flags=re.DOTALL)
        else:
            insert_pattern = rf'("id":\s*"{song_id}".*?"cover":\s*"[^"]*",)'
            ms_code = re.sub(insert_pattern, rf'\g<1>\n    "audioUrl": "{audio}",', ms_code, count=1, flags=re.DOTALL)

with open('src/musicService.js', 'w', encoding='utf-8') as f:
    f.write(ms_code)

print("Updated src/musicService.js successfully!")

# 2. Update YOUTUBE_TRACKS_MAP in src/main.js
with open('src/main.js', 'r', encoding='utf-8') as f:
    main_code = f.read()

map_entries = []
for song_id, data in resolved.items():
    yt_id = data.get('ytId')
    if yt_id:
        map_entries.append(f"    '{song_id}': '{yt_id}',")

new_map_str = "  const YOUTUBE_TRACKS_MAP = {\n" + "\n".join(map_entries) + "\n  };"

main_code = re.sub(r'  const YOUTUBE_TRACKS_MAP = \{.*?\};', new_map_str, main_code, flags=re.DOTALL)

with open('src/main.js', 'w', encoding='utf-8') as f:
    f.write(main_code)

print("Updated src/main.js YOUTUBE_TRACKS_MAP successfully!")
