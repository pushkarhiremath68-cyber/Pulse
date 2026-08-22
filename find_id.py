import urllib.request
import re
import json

html = urllib.request.urlopen('https://www.youtube.com/results?search_query=shape+of+you+ed+sheeran+official+lyric').read().decode()
# Look for ytInitialData
match = re.search(r'ytInitialData = (\{.*?\});</script>', html)
if match:
    data = json.loads(match.group(1))
    # Extract titles and videoIds from search results
    try:
        contents = data['contents']['twoColumnSearchResultsRenderer']['primaryContents']['sectionListRenderer']['contents'][0]['itemSectionRenderer']['contents']
        for item in contents:
            if 'videoRenderer' in item:
                title = item['videoRenderer']['title']['runs'][0]['text']
                videoId = item['videoRenderer']['videoId']
                print(f"{videoId} - {title}")
    except Exception as e:
        print(e)
