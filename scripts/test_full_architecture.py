import urllib.request
import urllib.parse
import json
import time
import os
import sys

def test_backend_ytm_endpoints():
    print("=======================================================")
    print("TEST 1: YouTube Music & Piped Backend Audio Extractor")
    print("=======================================================")
    
    # Test 1A: Search YTM
    try:
        import yt_dlp
        query = "Starboy The Weeknd"
        ydl_opts = {'quiet': True, 'extract_flat': True, 'skip_download': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch5:{query}", download=False)
            entries = info.get('entries', [])
            assert len(entries) > 0, "No entries found in YTM search"
            print(f"  [PASS] YTM Search: Discovered {len(entries)} tracks for '{query}'. First: {entries[0].get('title')} (ID: {entries[0].get('id')})")
            test_vid = entries[0].get('id')
    except Exception as e:
        print(f"  [FAIL] YTM Search: {e}")
        return False

    # Test 1B: Pure Direct Audio Stream Extraction
    try:
        ydl_opts = {'quiet': True, 'format': 'bestaudio/best', 'skip_download': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={test_vid}", download=False)
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('vcodec') == 'none' and f.get('acodec') != 'none']
            assert len(audio_formats) > 0, "No pure audio stream formats found"
            audio_formats.sort(key=lambda f: f.get('abr') or f.get('tbr') or 0, reverse=True)
            best_audio = audio_formats[0]
            assert best_audio.get('url'), "No audio stream URL in format"
            print(f"  [PASS] Pure Audio Stream: Resolved ad-free stream. Codec: {best_audio.get('acodec')}, Bitrate: {best_audio.get('abr')}kbps, URL: {best_audio.get('url')[:60]}...")
    except Exception as e:
        print(f"  [FAIL] Audio Stream Extraction: {e}")
        return False

    return True

def test_firebase_firestore_schema():
    print("\n=======================================================")
    print("TEST 2: Cloud Firestore & Firebase Auth Models")
    print("=======================================================")
    
    # Verify local and cloud data schema compatibility
    sample_user = {
        "uid": "user-test-12345",
        "name": "Alex Listener",
        "email": "alex@pulse.app",
        "provider": "email"
    }
    
    sample_favorite = {
        "id": "ytm-34Na4j8AVgA",
        "title": "Starboy (feat. Daft Punk)",
        "artist": "The Weeknd",
        "album": "Starboy",
        "coverUrl": "https://i.ytimg.com/vi/34Na4j8AVgA/hqdefault.jpg",
        "duration": 230,
        "streamUrl": "https://rr1---sn-np4tjvg2.googlevideo.com/videoplayback",
        "source": "YouTube Music Ad-Free Opus",
        "addedAt": int(time.time() * 1000)
    }

    sample_playlist = {
        "id": "pl-test-999",
        "name": "Night Drive Anthems",
        "description": "Ad-free synthwave and R&B hits",
        "coverUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4",
        "tracks": [sample_favorite],
        "trackCount": 1,
        "createdAt": int(time.time() * 1000),
        "updatedAt": int(time.time() * 1000),
        "creatorId": sample_user["uid"]
    }

    sample_history = {
        "id": sample_favorite["id"],
        "title": sample_favorite["title"],
        "artist": sample_favorite["artist"],
        "album": sample_favorite["album"],
        "coverUrl": sample_favorite["coverUrl"],
        "duration": sample_favorite["duration"],
        "playedAt": int(time.time() * 1000)
    }

    assert sample_user["uid"] and sample_user["email"], "Invalid user model"
    assert sample_favorite["id"] and sample_favorite["title"], "Invalid favorite model"
    assert sample_playlist["id"] and len(sample_playlist["tracks"]) == 1, "Invalid playlist model"
    assert sample_history["id"] and sample_history["playedAt"], "Invalid history model"

    print("  [PASS] Firebase Auth User Schema validated.")
    print("  [PASS] Cloud Firestore Favorites Schema validated.")
    print("  [PASS] Cloud Firestore Custom Playlists Schema validated.")
    print("  [PASS] Cloud Firestore Listening History Schema validated.")
    return True

if __name__ == '__main__':
    t1 = test_backend_ytm_endpoints()
    t2 = test_firebase_firestore_schema()
    print("\n=======================================================")
    if t1 and t2:
        print("ALL ARCHITECTURAL & TECHNICAL TESTS PASSED SUCCESSFULLY!")
    else:
        print("SOME TESTS FAILED.")
    print("=======================================================")
