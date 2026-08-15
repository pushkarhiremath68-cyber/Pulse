import json
import re

with open('src/musicService.js', 'r', encoding='utf-8') as f:
    js_code = f.read()

match = re.search(r'const DEMO_CATALOG = (\[.*?\])\.map\(normalizeTrack\);', js_code, re.DOTALL)
if not match:
    print("Could not find DEMO_CATALOG")
    exit(1)

catalog_json_str = match.group(1)
catalog = json.loads(catalog_json_str)

singers_and_genres = [
    "Arijit Singh",
    "Taylor Swift",
    "Diljit Dosanjh",
    "Karan Aujla",
    "The Weeknd",
    "Shreya Ghoshal",
    "Atif Aslam",
    "Ed Sheeran",
    "Sonu Nigam",
    "Sid Sriram",
    "AP Dhillon",
    "Sidhu Moose Wala",
    "Renuka Panwar",
    "Aditya Gadhvi",
    "Ajay Atul",
    "Indila",
    "Daddy Yankee",
    "Billie Eilish",
    "Justin Bieber",
    "KK",
    "English Hits",
    "Bollywood Hindi Hits",
    "Punjabi Hits",
    "Kannada Hits",
    "Telugu Hits",
    "Haryanvi Hits",
    "Gujarati Hits",
    "Marathi Hits",
    "Spanish Latin Hits",
    "French Hits",
    "Lo-Fi Chill"
]

def simulate_search(query, limit=100):
    cleanQ = re.sub(r'[\U0001F300-\U0001F9FF\U00002600-\U000026FF\U00002700-\U000027BF\U0001F1E0-\U0001F1FF\U0001F600-\U0001F64F\U0001F680-\U0001F6FF]', '', query).strip()
    lowerQ = cleanQ.lower()
    
    qTokens = [w for w in lowerQ.split() if w not in ['songs', 'song', 'hits', 'all', 'top', 'music', 'best']]
    
    isEnglish = 'english' in lowerQ or lowerQ == 'pop'
    isHindi = 'hindi' in lowerQ or 'bollywood' in lowerQ
    isTelugu = 'telugu' in lowerQ or 'tollywood' in lowerQ
    isGujarati = 'gujarati' in lowerQ or 'garba' in lowerQ
    isMarathi = 'marathi' in lowerQ
    isKannada = 'kannada' in lowerQ or 'sandalwood' in lowerQ
    isPunjabi = 'punjabi' in lowerQ
    isHaryanvi = 'haryanvi' in lowerQ or 'desi' in lowerQ
    isSpanish = 'spanish' in lowerQ or 'latin' in lowerQ or 'reggaeton' in lowerQ
    isFrench = 'french' in lowerQ
    isLofi = 'lofi' in lowerQ or 'lo-fi' in lowerQ or 'chill' in lowerQ

    scored = []
    for track in catalog:
        tTitle = (track.get('title') or '').lower()
        tArtist = (track.get('artist') or '').lower()
        tAlbum = (track.get('album') or '').lower()
        tCategory = (track.get('category') or '').lower()
        tSource = (track.get('source') or '').lower()
        tId = (track.get('id') or '').lower()

        score = 0
        if lowerQ in tArtist or tArtist in lowerQ:
            score += 100
        if tTitle == lowerQ:
            score += 150
        elif lowerQ in tTitle:
            score += 80

        if isEnglish and (tId.startswith('en-') or tId.startswith('itunes-') or 'english' in tSource or tCategory == 'pop'):
            score += 60
        if isHindi and (tId.startswith('in-') or 'hindi' in tSource or 'bollywood' in tSource or tCategory == 'bollywood'):
            score += 60
        if isTelugu and (tId.startswith('te-') or 'telugu' in tSource or 'tollywood' in tSource):
            score += 60
        if isGujarati and (tId.startswith('gu-') or 'gujarati' in tSource or 'garba' in tSource):
            score += 60
        if isMarathi and (tId.startswith('mr-') or 'marathi' in tSource):
            score += 60
        if isKannada and (tId.startswith('kn-') or 'kannada' in tSource or 'sandalwood' in tSource):
            score += 60
        if isPunjabi and (tId.startswith('pj-') or 'punjabi' in tSource):
            score += 60
        if isHaryanvi and (tId.startswith('hr-') or 'haryanvi' in tSource or 'desi' in tSource):
            score += 60
        if isSpanish and (tId.startswith('es-') or 'spanish' in tSource or 'latin' in tSource):
            score += 60
        if isFrench and (tId.startswith('fr-') or 'french' in tSource):
            score += 60
        if isLofi and (tCategory == 'lofi' or 'chill' in tTitle or 'lofi' in tAlbum):
            score += 50

        if qTokens:
            tokenMatches = 0
            for tok in qTokens:
                if tok in tTitle or tok in tArtist or tok in tAlbum or tok in tSource or tok in tId:
                    tokenMatches += 1
            if tokenMatches > 0:
                score += tokenMatches * 25

        if score > 0:
            scored.append((track, score))

    scored.sort(key=lambda x: x[1], reverse=True)
    
    seen = set()
    results = []
    for t, s in scored:
        key = f"{t.get('title')} - {t.get('artist')}".lower()
        if key not in seen and t.get('id') not in seen:
            seen.add(key)
            seen.add(t.get('id'))
            results.append(t)
    return results[:limit]

print(f"Auditing all {len(singers_and_genres)} Singer and Category buttons:")
all_passed = True
for item in singers_and_genres:
    res = simulate_search(item)
    if len(res) == 0:
        print(f"[FAIL] 0 songs found for '{item}'")
        all_passed = False
    else:
        sample = res[0]['title'] + " - " + res[0]['artist']
        print(f"[PASS] '{item}': {len(res)} songs found (e.g. {sample})")

if all_passed:
    print("\nALL 31 Singer and Category search filters verified successfully!")
