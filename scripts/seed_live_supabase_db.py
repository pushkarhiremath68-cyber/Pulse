import urllib.request
import urllib.parse
import json

SUPABASE_URL = "https://fswnnnmicaakeuhwyyai.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzd25ubm1pY2Fha2V1aHd5eWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5ODc3NzQsImV4cCI6MjEwMjU2Mzc3NH0.lptcHWEtEv-dEOLK_y7AfwHTbedCg1DCIKviOiuO7KQ"

MEGA_SONGS = [
    # Bollywood & Hindi Hits
    {
        "id": "in-kesariya",
        "title": "Kesariya",
        "artist": "Arijit Singh, Pritam",
        "album": "Brahmastra",
        "cover": "https://c.saavncdn.com/191/Kesariya-From-Brahmastra-Hindi-2022-20220717092820-500x500.jpg",
        "duration": "4:28",
        "audio_url": "https://aac.saavncdn.com/191/8cbbcfdd4760086bc7d0e5132204c356_320.mp4",
        "storage_path": "in-kesariya.mp4",
        "language": "Hindi",
        "category": "bollywood",
        "year": 2022,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-chaleya",
        "title": "Chaleya",
        "artist": "Arijit Singh, Shilpa Rao, Anirudh",
        "album": "Jawan",
        "cover": "https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814114324-500x500.jpg",
        "duration": "3:20",
        "audio_url": "https://aac.saavncdn.com/026/020a4fa65b2fa84b806fa1da0b666a7b_320.mp4",
        "storage_path": "in-chaleya.mp4",
        "language": "Hindi",
        "category": "bollywood",
        "year": 2023,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-apna-bana-le",
        "title": "Apna Bana Le",
        "artist": "Arijit Singh, Sachin-Jigar",
        "album": "Bhediya",
        "cover": "https://c.saavncdn.com/815/Bhediya-Hindi-2022-20221124110332-500x500.jpg",
        "duration": "4:21",
        "audio_url": "https://aac.saavncdn.com/815/84e49339e79fe26639fe1000676a6cf3_320.mp4",
        "storage_path": "in-apna-bana-le.mp4",
        "language": "Hindi",
        "category": "romantic",
        "year": 2022,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-tum-hi-ho",
        "title": "Tum Hi Ho",
        "artist": "Arijit Singh, Mithoon",
        "album": "Aashiqui 2",
        "cover": "https://c.saavncdn.com/264/Aashiqui-2-Hindi-2013-500x500.jpg",
        "duration": "4:22",
        "audio_url": "https://aac.saavncdn.com/264/1d07c08cfbc02410f9718feff9ad9372_320.mp4",
        "storage_path": "in-tum-hi-ho.mp4",
        "language": "Hindi",
        "category": "romantic",
        "year": 2013,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-pehle-bhi-main",
        "title": "Pehle Bhi Main",
        "artist": "Vishal Mishra, Raj Shekhar",
        "album": "Animal",
        "cover": "https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191410-500x500.jpg",
        "duration": "4:10",
        "audio_url": "https://aac.saavncdn.com/092/e59fb369804b49463b2db9d2ae27ff87_320.mp4",
        "storage_path": "in-pehle-bhi-main.mp4",
        "language": "Hindi",
        "category": "bollywood",
        "year": 2023,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-shayad",
        "title": "Shayad",
        "artist": "Arijit Singh, Pritam",
        "album": "Love Aaj Kal",
        "cover": "https://c.saavncdn.com/040/Love-Aaj-Kal-Hindi-2020-20200214140417-500x500.jpg",
        "duration": "4:07",
        "audio_url": "https://aac.saavncdn.com/040/9fb4c75953046f14ca55272a8c3d6ee1_320.mp4",
        "storage_path": "in-shayad.mp4",
        "language": "Hindi",
        "category": "romantic",
        "year": 2020,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-raataan-lambiyan",
        "title": "Raataan Lambiyan",
        "artist": "Jubin Nautiyal, Asees Kaur",
        "album": "Shershaah",
        "cover": "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg",
        "duration": "3:50",
        "audio_url": "https://aac.saavncdn.com/238/7c7cb6c5ae5236f01fc63eb5cb741915_320.mp4",
        "storage_path": "in-raataan-lambiyan.mp4",
        "language": "Hindi",
        "category": "romantic",
        "year": 2021,
        "source": "Pulse Master 320k"
    },
    {
        "id": "in-heeriye",
        "title": "Heeriye",
        "artist": "Jasleen Royal, Arijit Singh",
        "album": "Heeriye",
        "cover": "https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.jpg",
        "duration": "3:15",
        "audio_url": "https://aac.saavncdn.com/022/bf8516d2f3493721345eb67a421469e8_320.mp4",
        "storage_path": "in-heeriye.mp4",
        "language": "Hindi",
        "category": "romantic",
        "year": 2023,
        "source": "Pulse Master 320k"
    },

    # Punjabi Hits
    {
        "id": "pj-tauba-tauba",
        "title": "Tauba Tauba",
        "artist": "Karan Aujla",
        "album": "Bad Newz",
        "cover": "https://c.saavncdn.com/978/Tauba-Tauba-From-Bad-Newz-Hindi-2024-20240702111004-500x500.jpg",
        "duration": "3:27",
        "audio_url": "https://aac.saavncdn.com/978/dd6e355609461ce884e93da4c9fb6057_320.mp4",
        "storage_path": "pj-tauba-tauba.mp4",
        "language": "Punjabi",
        "category": "punjabi",
        "year": 2024,
        "source": "Pulse Master 320k"
    },
    {
        "id": "pj-softly",
        "title": "Softly",
        "artist": "Karan Aujla, Ikky",
        "album": "Making Memories",
        "cover": "https://c.saavncdn.com/949/Making-Memories-Punjabi-2023-20230818053240-500x500.jpg",
        "duration": "2:35",
        "audio_url": "https://aac.saavncdn.com/949/a77f0a6d0938f32c3858c17b5e613b5a_320.mp4",
        "storage_path": "pj-softly.mp4",
        "language": "Punjabi",
        "category": "punjabi",
        "year": 2023,
        "source": "Pulse Master 320k"
    },
    {
        "id": "pj-lover",
        "title": "Lover",
        "artist": "Diljit Dosanjh",
        "album": "MoonChild Era",
        "cover": "https://c.saavncdn.com/973/MoonChild-Era-Punjabi-2021-20210822180844-500x500.jpg",
        "duration": "3:10",
        "audio_url": "https://aac.saavncdn.com/973/2bf260a920257ad30894be693246ebc6_320.mp4",
        "storage_path": "pj-lover.mp4",
        "language": "Punjabi",
        "category": "punjabi",
        "year": 2021,
        "source": "Pulse Master 320k"
    },
    {
        "id": "pj-with-you",
        "title": "With You",
        "artist": "AP Dhillon",
        "album": "With You",
        "cover": "https://c.saavncdn.com/624/With-You-Punjabi-2023-20230811053424-500x500.jpg",
        "duration": "2:34",
        "audio_url": "https://aac.saavncdn.com/624/3fe7730e2f5ff50b89b4fcb077a66160_320.mp4",
        "storage_path": "pj-with-you.mp4",
        "language": "Punjabi",
        "category": "punjabi",
        "year": 2023,
        "source": "Pulse Master 320k"
    },
    {
        "id": "pj-cheques",
        "title": "Cheques",
        "artist": "Shubh",
        "album": "Still Rollin",
        "cover": "https://c.saavncdn.com/139/Still-Rollin-Punjabi-2023-20230519060416-500x500.jpg",
        "duration": "3:03",
        "audio_url": "https://aac.saavncdn.com/139/867c2ce4b5539744b82d43ee61ca5c5b_320.mp4",
        "storage_path": "pj-cheques.mp4",
        "language": "Punjabi",
        "category": "punjabi",
        "year": 2023,
        "source": "Pulse Master 320k"
    },

    # Devotional & Sacred Bhakti
    {
        "id": "dev-hanuman-chalisa",
        "title": "Shree Hanuman Chalisa",
        "artist": "Hariharan, Gulshan Kumar",
        "album": "Shree Hanuman Chalisa",
        "cover": "https://c.saavncdn.com/007/Shree-Hanuman-Chalisa-Hanuman-Ashtak-Hindi-1992-500x500.jpg",
        "duration": "9:48",
        "audio_url": "https://aac.saavncdn.com/007/c3ee255476a26cf6b1c7849e7b23fa54_320.mp4",
        "storage_path": "dev-hanuman-chalisa.mp4",
        "language": "Devotional",
        "category": "devotional",
        "year": 1992,
        "source": "Pulse Master 320k"
    },
    {
        "id": "dev-achyutam-keshavam",
        "title": "Achyutam Keshavam",
        "artist": "Vikram Hazra",
        "album": "Krishna Bhajans",
        "cover": "https://c.saavncdn.com/495/Krishna-Bhajans-Hindi-2018-20180829-500x500.jpg",
        "duration": "5:12",
        "audio_url": "https://aac.saavncdn.com/495/48b03043feaeef2ff5d4b533e4bbfa7a_320.mp4",
        "storage_path": "dev-achyutam-keshavam.mp4",
        "language": "Devotional",
        "category": "devotional",
        "year": 2018,
        "source": "Pulse Master 320k"
    },
    {
        "id": "dev-shiv-tandav",
        "title": "Shiv Tandav Stotram",
        "artist": "Shankar Mahadevan",
        "album": "Shiv Stotram",
        "cover": "https://c.saavncdn.com/423/Shiv-Tandav-Stotram-Hindi-2020-20200706173934-500x500.jpg",
        "duration": "9:14",
        "audio_url": "https://aac.saavncdn.com/423/9a6e355609461ce884e93da4c9fb6057_320.mp4",
        "storage_path": "dev-shiv-tandav.mp4",
        "language": "Devotional",
        "category": "devotional",
        "year": 2020,
        "source": "Pulse Master 320k"
    },

    # Global English Hits
    {
        "id": "en-shape-of-you",
        "title": "Shape of You",
        "artist": "Ed Sheeran",
        "album": "÷ (Divide)",
        "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/ba/66/1b/ba661b17-3dd3-29dd-7fb4-0d9c15ff9209/190295851286.jpg/600x600bb.jpg",
        "duration": "3:53",
        "audio_url": "https://aac.saavncdn.com/001/3c1d4cbca98b3fbe3f88ef8ceaa66ec4_320.mp4",
        "storage_path": "en-shape-of-you.mp4",
        "language": "English",
        "category": "pop",
        "year": 2017,
        "source": "Pulse Master 320k"
    },
    {
        "id": "en-starboy",
        "title": "Starboy",
        "artist": "The Weeknd, Daft Punk",
        "album": "Starboy",
        "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/a4/7d/51/a47d519b-640a-ca1d-ff14-c1ab415f33f6/16UMGIM60655.rgb.jpg/600x600bb.jpg",
        "duration": "3:50",
        "audio_url": "https://aac.saavncdn.com/002/9df9f52f36d6ea2f9543e49be9d2146e_320.mp4",
        "storage_path": "en-starboy.mp4",
        "language": "English",
        "category": "pop",
        "year": 2016,
        "source": "Pulse Master 320k"
    },
    {
        "id": "en-blinding-lights",
        "title": "Blinding Lights",
        "artist": "The Weeknd",
        "album": "After Hours",
        "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/b9/8b/6e/b98b6e3b-9e48-8df0-109d-0c58a5e840d5/20UMGIM10243.rgb.jpg/600x600bb.jpg",
        "duration": "3:20",
        "audio_url": "https://aac.saavncdn.com/003/6bb4d52f36d6ea2f9543e49be9d2146e_320.mp4",
        "storage_path": "en-blinding-lights.mp4",
        "language": "English",
        "category": "pop",
        "year": 2020,
        "source": "Pulse Master 320k"
    },
    {
        "id": "en-cruel-summer",
        "title": "Cruel Summer",
        "artist": "Taylor Swift",
        "album": "Lover",
        "cover": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/f5/ec/4bf5ecf8-7f99-ef2e-736f-e3c6a4d7d3d7/19UMGIM68357.rgb.jpg/600x600bb.jpg",
        "duration": "2:58",
        "audio_url": "https://aac.saavncdn.com/004/7fb4d52f36d6ea2f9543e49be9d2146e_320.mp4",
        "storage_path": "en-cruel-summer.mp4",
        "language": "English",
        "category": "pop",
        "year": 2019,
        "source": "Pulse Master 320k"
    },

    # Regional (Kannada, Telugu, Tamil)
    {
        "id": "kn-singara-siriye",
        "title": "Singara Siriye",
        "artist": "Vijay Prakash, Ananya Bhat",
        "album": "Kantara",
        "cover": "https://c.saavncdn.com/129/Kantara-Kannada-2022-20221010165736-500x500.jpg",
        "duration": "4:42",
        "audio_url": "https://aac.saavncdn.com/129/73e970b9eb602166e4a2d81575cce963_320.mp4",
        "storage_path": "kn-singara-siriye.mp4",
        "language": "Kannada",
        "category": "kannada",
        "year": 2022,
        "source": "Pulse Master 320k"
    },
    {
        "id": "te-srivalli",
        "title": "Srivalli",
        "artist": "Sid Sriram, Devi Sri Prasad",
        "album": "Pushpa: The Rise",
        "cover": "https://c.saavncdn.com/513/Pushpa-The-Rise-Telugu-2021-20211217064846-500x500.jpg",
        "duration": "3:44",
        "audio_url": "https://aac.saavncdn.com/513/da60a955e82110c7104b2b1fa4a0fe0e_320.mp4",
        "storage_path": "te-srivalli.mp4",
        "language": "Telugu",
        "category": "telugu",
        "year": 2021,
        "source": "Pulse Master 320k"
    },
    {
        "id": "tm-arabic-kuthu",
        "title": "Arabic Kuthu - Halamithi Habibo",
        "artist": "Anirudh Ravichander, Jonita Gandhi",
        "album": "Beast",
        "cover": "https://c.saavncdn.com/712/Beast-Tamil-2022-20220412124507-500x500.jpg",
        "duration": "4:37",
        "audio_url": "https://aac.saavncdn.com/712/75ba83c2763f0d367464bc4be40713ba_320.mp4",
        "storage_path": "tm-arabic-kuthu.mp4",
        "language": "Tamil",
        "category": "tamil",
        "year": 2022,
        "source": "Pulse Master 320k"
    }
]

def seed_database():
    url = f"{SUPABASE_URL}/rest/v1/songs"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    print(f"Connecting to Supabase project {SUPABASE_URL}...")
    data_bytes = json.dumps(MEGA_SONGS).encode('utf-8')
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            print(f"✅ Successfully seeded {len(MEGA_SONGS)} tracks to Supabase public.songs! Status Code: {status}")
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        print(f"HTTP Error: {e.code} - {error_body}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    seed_database()
