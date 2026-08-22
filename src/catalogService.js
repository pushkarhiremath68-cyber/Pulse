/**
 * Pulse Music - Comprehensive Multi-Genre & Multilingual Catalog Service
 * Provides complete catalog hierarchies, mood shelves, language hubs,
 * curated playlist mixes, quick picks, and featured artists with rich music wallpapers.
 */

export const CATALOG_CATEGORIES = [
  {
    id: "cat-trending",
    title: "Global Viral & Trending Now",
    subtitle: "The hottest streamable anthems dominating worldwide charts",
    icon: "fa-fire-flame-curved",
    color: "#f43f5e",
    tracks: [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg", duration: 200, genre: "Pop / Synthwave" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", duration: 230, genre: "Pop / R&B" },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 233, genre: "Pop" },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg", duration: 178, genre: "Pop" },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/1000x1000bb.jpg", duration: 167, genre: "Indie Pop" },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/1000x1000bb.jpg", duration: 199, genre: "Pop" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/1000x1000bb.jpg", duration: 198, genre: "Bollywood" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", duration: 268, genre: "Bollywood" }
    ]
  },
  {
    id: "cat-workout",
    title: "High-Energy & Workout EDM",
    subtitle: "High-BPM adrenaline fuel for intense sessions and running",
    icon: "fa-bolt",
    color: "#eab308",
    tracks: [
      { id: "ytm-1_kZ47Lh60s", ytId: "1_kZ47Lh60s", title: "Titanium", artist: "David Guetta ft. Sia", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/99/b4/7b/99b47bd8-2b22-e1ef-2e60-c5147f27a861/dj.thrvmjqj.jpg/1000x1000bb.jpg", duration: 245, genre: "EDM" },
      { id: "ytm-60ItHLz5WEA", ytId: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/0d/a3/1a/0da31af7-d0ff-9bee-c427-1b6d0336f6fc/886446321981.jpg/1000x1000bb.jpg", duration: 212, genre: "Electro" },
      { id: "ytm-YqeW9_5kURI", ytId: "YqeW9_5kURI", title: "Lean On", artist: "Major Lazer & DJ Snake", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/3a/9b/bd/3a9bbdba-5829-91c8-1349-cc04cdaf3423/653738030629_Cover.jpg/1000x1000bb.jpg", duration: 176, genre: "Dance" },
      { id: "ytm-JRfuAukYTKg", ytId: "JRfuAukYTKg", title: "Animals", artist: "Martin Garrix", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6e/1e/f0/6e1ef055-195a-bb73-d5a8-5926058366a5/8712944577525.png/1000x1000bb.jpg", duration: 185, genre: "Big Room House" },
      { id: "ytm-kXYiU_JCYtU", ytId: "kXYiU_JCYtU", title: "Numb / Encore", artist: "Linkin Park & Jay-Z", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/ab/2e/8cab2ea3-490b-a9b5-94db-6e1fe30739c4/d191ed5d-23c7-4769-99bc-1385e103ece1.jpg/1000x1000bb.jpg", duration: 205, genre: "Rock / Hip-Hop" },
      { id: "ytm-pAgnJDJN4VA", ytId: "pAgnJDJN4VA", title: "Levels", artist: "Avicii", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/67/38/43/67384338-9ed7-fc68-5927-93f1fcf4705d/11UMGIM36900.rgb.jpg/1000x1000bb.jpg", duration: 220, genre: "EDM" },
      { id: "ytm-IcrbM1l_BoI", ytId: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/18/5b/1e/185b1ef5-5d97-19d8-aebf-8e29e41874ef/13UAAIM59255.rgb.jpg/1000x1000bb.jpg", duration: 247, genre: "Progressive House" },
      { id: "ytm-09R8_2nJtjg", ytId: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/b7/25/76/b72576f1-072e-3da2-60d5-2724a9bccf4a/14UMGIM31673.rgb.jpg/1000x1000bb.jpg", duration: 235, genre: "Pop Funk" }
    ]
  },
  {
    id: "cat-lofi",
    title: "Late Night Lo-Fi & Deep Focus",
    subtitle: "Chilled beats, mellow keys and soothing rhythms to study and unwind",
    icon: "fa-moon",
    color: "#a855f7",
    tracks: [
      { id: "ytm-5qap5aO4i9A", ytId: "5qap5aO4i9A", title: "Lofi Hip Hop Beats", artist: "Lofi Girl", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/81/92/29/81922931-16a5-01ef-4d44-5e6846f77ca7/509.jpg/1000x1000bb.jpg", duration: 180, genre: "Lo-Fi" },
      { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/1000x1000bb.jpg", duration: 243, genre: "Synthwave" },
      { id: "ytm-jfKfPfyJRdk", ytId: "jfKfPfyJRdk", title: "Coffee Beats & Rain", artist: "ChilledCow", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/ae/ef/5e/aeef5edc-d6ed-9891-b79b-af7694c459f4/14656.jpg/1000x1000bb.jpg", duration: 210, genre: "Lo-Fi Chill" },
      { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/13/65/4f1365b0-e97c-c469-c438-2f7d8f204355/872133025584_cover.jpg/1000x1000bb.jpg", duration: 212, genre: "Chillwave" },
      { id: "ytm-n61ULEU7CO0", ytId: "n61ULEU7CO0", title: "Warm Nights", artist: "Xori", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/be/45/64be45d3-66e2-98b0-a9a7-2fce9b6487f6/734167740577_cover.jpg/1000x1000bb.jpg", duration: 195, genre: "Lo-Fi" },
      { id: "ytm-HDhR2Yhnvfo", ytId: "HDhR2Yhnvfo", title: "Affection", artist: "Jinsang", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/33/a5/2f/33a52fc2-d77b-9408-6d5b-af389ee28c43/cover_4018939360092.jpg/1000x1000bb.jpg", duration: 160, genre: "Lo-Fi Beats" }
    ]
  },
  {
    id: "cat-romance",
    title: "Soulful Acoustic & Romantic Hits",
    subtitle: "Heartwarming melodies, acoustic ballads and love anthems",
    icon: "fa-heart",
    color: "#ec4899",
    tracks: [
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 263, genre: "Acoustic Pop" },
      { id: "ytm-IJq0ydg105U", ytId: "IJq0ydg105U", title: "Tum Hi Ho", artist: "Arijit Singh", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", duration: 262, genre: "Bollywood Romance" },
      { id: "ytm-450p7goxZqg", ytId: "450p7goxZqg", title: "All of Me", artist: "John Legend", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/22/71/b9/2271b906-85b3-06ee-e611-489b91df0b73/886444160742.jpg/1000x1000bb.jpg", duration: 269, genre: "Soul / R&B" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/86/35/ee/8635eeea-d38e-1221-2ca6-aabcd481004f/8909024120539.png/1000x1000bb.jpg", duration: 201, genre: "Bollywood Romance" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cf/cf/af/cfcfaf49-f337-eeab-2351-dd0a137dc740/8902894362139_cover.jpg/1000x1000bb.jpg", duration: 233, genre: "Bollywood" },
      { id: "ytm-LPn0KStbm9M", ytId: "LPn0KStbm9M", title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/92/d7/8f/92d78fb1-df3d-049e-c81d-7022808b151f/19UMGIM02973.rgb.jpg/1000x1000bb.jpg", duration: 182, genre: "Ballad" },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3a/ec/34/3aec34e1-fe78-1078-5946-b7b75844c38f/191018009687.jpg/1000x1000bb.jpg", duration: 200, genre: "Kannada Melody" },
      { id: "ytm-31383g2K6nE", ytId: "31383g2K6nE", title: "Darshana", artist: "Hesham Abdul Wahab", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/69/26/34/6926341a-b85f-f853-de47-cb6fa81544aa/cover.jpg/1000x1000bb.jpg", duration: 224, genre: "Malayalam" }
    ]
  },
  {
    id: "cat-rock",
    title: "Rock Legends & Alternative Anthems",
    subtitle: "Timeless guitar solos, soaring vocals and stadium power chords",
    icon: "fa-guitar",
    color: "#06b6d4",
    tracks: [
      { id: "ytm-fJ9rUzIMcZQ", ytId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4d/08/2a/4d082a9e-7898-1aa1-a02f-339810058d9e/14DMGIM05632.rgb.jpg/1000x1000bb.jpg", duration: 354, genre: "Classic Rock" },
      { id: "ytm-eVTXPUF4Oz4", ytId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/53/a7/7f/53a77fab-c54c-a57b-8130-248fc12d0c80/093624948995.jpg/1000x1000bb.jpg", duration: 216, genre: "Alternative Rock" },
      { id: "ytm-hTWKbfoikeg", ytId: "hTWKbfoikeg", title: "Smells Like Teen Spirit", artist: "Nirvana", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/95/fd/b9/95fdb9b2-6d2b-92a6-97f2-51c1a6d77f1a/00602527874609.rgb.jpg/1000x1000bb.jpg", duration: 301, genre: "Grunge" },
      { id: "ytm-1w7OgIMMRc4", ytId: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/56/47/b7/5647b700-6b9d-9e72-ec9f-51140b6d4492/00602567673781.rgb.jpg/1000x1000bb.jpg", duration: 303, genre: "Hard Rock" },
      { id: "ytm-v2AC41dglnM", ytId: "v2AC41dglnM", title: "Thunderstruck", artist: "AC/DC", cover: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/bb/a2/f0/bba2f0d7-4d9e-c617-d49e-3ae02fd5d440/dj.xbkfgllk.jpg/1000x1000bb.jpg", duration: 292, genre: "Hard Rock" },
      { id: "ytm-_ao2u7F_Qzg", ytId: "_ao2u7F_Qzg", title: "In the Shadows", artist: "The Rasmus", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/53/a8/47/53a84700-1148-ea61-85c0-7461383d7c2b/cover.jpg/1000x1000bb.jpg", duration: 246, genre: "Rock" }
    ]
  },
  {
    id: "cat-party",
    title: "Club Nights & Party Starters",
    subtitle: "High-octane floor fillers, dancehall rhythms and club bangers",
    icon: "fa-champagne-glasses",
    color: "#10b981",
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/1000x1000bb.jpg", duration: 267, genre: "Punjabi Urban" },
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/66/5a/e8/665ae8ad-1aab-5d0c-3ca9-4fa062b1606c/8718857670711.png/1000x1000bb.jpg", duration: 230, genre: "Marathi Dance" },
      { id: "ytm-8FAUEv_E_xU", ytId: "8FAUEv_E_xU", title: "Arabic Kuthu", artist: "Anirudh Ravichander", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e9/19/b9/e919b921-d5a8-9e9a-8508-3551da375aee/196626458629.jpg/1000x1000bb.jpg", duration: 279, genre: "Kollywood Dance" },
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/39/14/dd3914e5-a2f3-b355-51f3-9a1f0e3ca246/8903431853592_cover.jpg/1000x1000bb.jpg", duration: 215, genre: "Tollywood Dance" },
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/1000x1000bb.jpg", duration: 229, genre: "Latin Pop" },
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/af/69/79/af697907-7447-e35b-5446-40d3cb3e1f64/8903431684981_cover.jpg/1000x1000bb.jpg", duration: 247, genre: "Gujarati Garba" }
    ]
  }
];

export const LANGUAGE_PLAYLISTS = [
  {
    id: "lang-hindi",
    meta: { title: "Hindi Bollywood Chartbusters", icon: "fa-music", color: "#ff5722", subtitle: "Top trending Bollywood & romantic hits" },
    tracks: [
      { id: "ytm-IJq0ydg105U", ytId: "IJq0ydg105U", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", duration: 262 },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/1000x1000bb.jpg", duration: 198 },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", duration: 268 },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/86/35/ee/8635eeea-d38e-1221-2ca6-aabcd481004f/8909024120539.png/1000x1000bb.jpg", duration: 201 },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cf/cf/af/cfcfaf49-f337-eeab-2351-dd0a137dc740/8902894362139_cover.jpg/1000x1000bb.jpg", duration: 233 },
      { id: "ytm-SbAILuIeFqc", ytId: "SbAILuIeFqc", title: "Satranga", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg", duration: 271 },
      { id: "ytm-8Vnm_uN_3oA", ytId: "8Vnm_uN_3oA", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f0/8c/2a/f08c2aeb-3903-8738-d0a5-8c2e4547eed7/5054197711039.jpg/1000x1000bb.jpg", duration: 194 },
      { id: "ytm-t5MlnGOKGDI", ytId: "t5MlnGOKGDI", title: "Pehle Bhi Main", artist: "Vishal Mishra", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021c90e375ac/8902894362092_cover.jpg/1000x1000bb.jpg", duration: 250 }
    ]
  },
  {
    id: "lang-english",
    meta: { title: "Global English Hits & Billboard Top 50", icon: "fa-globe", color: "#3b82f6", subtitle: "Worldwide pop, synth and indie favorites" },
    tracks: [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg", duration: 200 },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", duration: 230 },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 233 },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg", duration: 178 },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/1000x1000bb.jpg", duration: 167 },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8c/67/ff/8c67ff91-31c3-3fef-1884-ce3ec89f3af4/196589946874.jpg/1000x1000bb.jpg", duration: 199 },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 263 },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a7/98/d8/a798d867-344d-2bf2-fbfe-d2d1412dcef8/14UMDIM03793.rgb.jpg/1000x1000bb.jpg", duration: 231 }
    ]
  },
  {
    id: "lang-punjabi",
    meta: { title: "Punjabi Urban & Chartbusters", icon: "fa-bolt", color: "#14b8a6", subtitle: "Heavy bass, folk vibes and viral hip-hop" },
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/1000x1000bb.jpg", duration: 267 },
      { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/47/47/ac/4747ac85-1658-64ae-bc82-220a4d6213d5/859747478890_cover.jpg/1000x1000bb.jpg", duration: 176 },
      { id: "ytm-qLCHz_qG6zU", ytId: "qLCHz_qG6zU", title: "Elevated", artist: "Shubh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music117/v4/a3/31/f8/a331f824-3dd1-e8b6-5148-8d016d71fc26/191061761174.jpg/1000x1000bb.jpg", duration: 201 },
      { id: "ytm-fukvQcQ3g6U", ytId: "fukvQcQ3g6U", title: "We Rollin", artist: "Shubh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/56/d7/4e/56d74e0d-207f-d65a-83b6-bb4ab53b6f5b/mzi.xdfimjwb.jpg/1000x1000bb.jpg", duration: 199 },
      { id: "ytm-Zf8q6N4I4Gk", ytId: "Zf8q6N4I4Gk", title: "No Love", artist: "Shubh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/a7/b3/80/a7b380b9-9e29-1642-566e-d1ca4b920886/196776912972.jpg/1000x1000bb.jpg", duration: 181 },
      { id: "ytm-n_FCrCQ6-9U", ytId: "n_FCrCQ6-9U", title: "295", artist: "Sidhu Moose Wala", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/97/69/58/976958ae-725e-bd41-6755-f0921c697840/810063889609_cover.jpg/1000x1000bb.jpg", duration: 270 },
      { id: "ytm-eZ2_6LgB93k", ytId: "eZ2_6LgB93k", title: "With You", artist: "AP Dhillon", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5a/ac/00/5aac005f-9403-70e4-bce0-cf452017476e/197189606472.jpg/1000x1000bb.jpg", duration: 154 }
    ]
  },
  {
    id: "lang-kannada",
    meta: { title: "Kannada Sandalwood Sensations", icon: "fa-crown", color: "#8b5cf6", subtitle: "Chartbusters from KGF, Kantara and melodies" },
    tracks: [
      { id: "ytm-d1qgL-Hmsf0", ytId: "d1qgL-Hmsf0", title: "Singara Siriye", artist: "Vijay Prakash, Ananya Bhat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/08/1e/a0/081ea00b-1dd6-876f-860a-a0add84d317e/8904337278427.jpg/1000x1000bb.jpg", duration: 284 },
      { id: "ytm-e1L1Rydm25c", ytId: "e1L1Rydm25c", title: "Ra Ra Rakkamma", artist: "Nakash Aziz, Sunidhi Chauhan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/f8/e2/e2/f8e2e2e1-16af-34a7-9563-adbc9f9f5664/8903431880192_cover.jpg/1000x1000bb.jpg", duration: 215 },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/3a/ec/34/3aec34e1-fe78-1078-5946-b7b75844c38f/191018009687.jpg/1000x1000bb.jpg", duration: 200 },
      { id: "ytm-h2H7s8hL4O8", ytId: "h2H7s8hL4O8", title: "Belageddu", artist: "Vijay Prakash", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f4/57/cd/f457cd5e-b17b-24f1-b597-f82234539184/716894752887.jpg/1000x1000bb.jpg", duration: 211 },
      { id: "ytm-hM9mH_O9kYk", ytId: "hM9mH_O9kYk", title: "Munjaane Manju", artist: "Raghu Dixit", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/23/76/f0/2376f088-bd73-0e11-6baa-e653eed75270/195009001988.jpg/1000x1000bb.jpg", duration: 250 },
      { id: "ytm-j1_069X72mU", ytId: "j1_069X72mU", title: "Toofan (KGF 2)", artist: "Brijesh Shandilya", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/7f/8a/39/7f8a39e7-5a7b-7a46-6cd3-225b21a1f26a/8905936012146.jpg/1000x1000bb.jpg", duration: 218 }
    ]
  },
  {
    id: "lang-tamil",
    meta: { title: "Tamil Kollywood Chartbusters", icon: "fa-star", color: "#f43f5e", subtitle: "High energy tracks by Anirudh, AR Rahman & Dhee" },
    tracks: [
      { id: "ytm-x6Q7c9RyMzk", ytId: "x6Q7c9RyMzk", title: "Rowdy Baby", artist: "Dhanush, Dhee", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/09/0b/4f/090b4ffb-f4eb-f975-ae79-ce5446eeabc8/718598836276.jpg/1000x1000bb.jpg", duration: 284 },
      { id: "ytm-eYq7WapuDLU", ytId: "eYq7WapuDLU", title: "Enjoy Enjaami", artist: "Dhee, Arivu", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cf/c5/9b/cfc59b20-dda2-e4a3-54db-e23ac7a55b80/cover.jpg/1000x1000bb.jpg", duration: 298 },
      { id: "ytm-8FAUEv_E_xU", ytId: "8FAUEv_E_xU", title: "Arabic Kuthu", artist: "Anirudh Ravichander, Jonita Gandhi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e9/19/b9/e919b921-d5a8-9e9a-8508-3551da375aee/196626458629.jpg/1000x1000bb.jpg", duration: 279 },
      { id: "ytm-rN1fS03JvV8", ytId: "rN1fS03JvV8", title: "Naa Ready", artist: "Thalapathy Vijay, Anirudh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/b0/bf/d4/b0bfd46c-da95-2f95-1f7d-a75aa51c2465/196871252386.jpg/1000x1000bb.jpg", duration: 248 },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg", duration: 230 },
      { id: "ytm-1b4ZpP_g1g8", ytId: "1b4ZpP_g1g8", title: "Hukum (Jailer)", artist: "Anirudh Ravichander", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", duration: 207 }
    ]
  },
  {
    id: "lang-telugu",
    meta: { title: "Telugu Tollywood Blockbusters", icon: "fa-film", color: "#06b6d4", subtitle: "Viral beats from RRR, Pushpa & Sid Sriram melodies" },
    tracks: [
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/39/14/dd3914e5-a2f3-b355-51f3-9a1f0e3ca246/8903431853592_cover.jpg/1000x1000bb.jpg", duration: 215 },
      { id: "ytm-P2uM8E1c-1k", ytId: "P2uM8E1c-1k", title: "Samajavaragamana", artist: "Sid Sriram", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/53/98/c1/5398c1cf-7c16-24a6-bfa3-391dc6015376/cover.jpg/1000x1000bb.jpg", duration: 224 },
      { id: "ytm-hcMzwMrr1tE", ytId: "hcMzwMrr1tE", title: "Srivalli", artist: "Sid Sriram", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ec/34/7b/ec347b9b-0add-c529-4746-799277a5e1c0/cover.jpg/1000x1000bb.jpg", duration: 221 },
      { id: "ytm-61X-N712DqY", ytId: "61X-N712DqY", title: "Oo Antava Mava", artist: "Indravathi Chauhan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/59/19/65/591965d4-84b4-d62d-345f-88bd29ce0843/cover.jpg/1000x1000bb.jpg", duration: 223 },
      { id: "ytm-2mDCVzruYzQ", ytId: "2mDCVzruYzQ", title: "Butta Bomma", artist: "Armaan Malik", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/aa/48/46aa4863-c1ec-4574-e98e-80b8c1f3ef69/cover.jpg/1000x1000bb.jpg", duration: 198 },
      { id: "ytm-W_12qM1F5gA", ytId: "W_12qM1F5gA", title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/4d/7c/4a/4d7c4a33-0c3b-b0e5-1e5a-8182d9a25811/cover.jpg/1000x1000bb.jpg", duration: 250 }
    ]
  },
  {
    id: "lang-marathi",
    meta: { title: "Marathi Blockbusters", icon: "fa-drum", color: "#eab308", subtitle: "Ajay-Atul classics and modern Marathi pop" },
    tracks: [
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/66/5a/e8/665ae8ad-1aab-5d0c-3ca9-4fa062b1606c/8718857670711.png/1000x1000bb.jpg", duration: 230 },
      { id: "ytm-p8gq4I26q7k", ytId: "p8gq4I26q7k", title: "Apsara Aali", artist: "Bela Shende", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/c4/d3/61/c4d3615e-b652-e204-026c-827db678a280/8718857704249.png/1000x1000bb.jpg", duration: 245 },
      { id: "ytm-mI60DtyDpsk", ytId: "mI60DtyDpsk", title: "Bring It On", artist: "Ajay-Atul", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/0d/a8/4c/0da84c40-989b-90e9-9d86-1b4a33a75643/840214492952.png/1000x1000bb.jpg", duration: 211 },
      { id: "ytm-n-k4iC1F2E0", ytId: "n-k4iC1F2E0", title: "Yad Lagla", artist: "Ajay Gogavale", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c7/42/27/c742279a-586b-976a-df12-659f8539a788/8718857700166.png/1000x1000bb.jpg", duration: 301 },
      { id: "ytm-Oq8j5Qz9Q6U", ytId: "Oq8j5Qz9Q6U", title: "Sairat Zaala Ji", artist: "Chinmayi Sripaada", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c7/42/27/c742279a-586b-976a-df12-659f8539a788/8718857700166.png/1000x1000bb.jpg", duration: 366 }
    ]
  },
  {
    id: "lang-gujarati",
    meta: { title: "Gujarati Garba & Folk Hits", icon: "fa-gopuram", color: "#f59e0b", subtitle: "Navratri anthems, viral folk and Darshan Raval" },
    tracks: [
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/af/69/79/af697907-7447-e35b-5446-40d3cb3e1f64/8903431684981_cover.jpg/1000x1000bb.jpg", duration: 247 },
      { id: "ytm-QdXVhEiaY9c", ytId: "QdXVhEiaY9c", title: "Kamariya", artist: "Darshan Raval", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/d2/1c/bd/d21cbda3-8080-ba8a-37cb-14adc9682a6f/886447288764.jpg/1000x1000bb.jpg", duration: 260 },
      { id: "ytm-Q28K4vDtd4Y", ytId: "Q28K4vDtd4Y", title: "Dholida", artist: "Neha Kakkar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/6d/3b/ad/6d3bad14-744c-b8bc-53c5-0e01493f5f02/8903431696953_cover.jpg/1000x1000bb.jpg", duration: 180 },
      { id: "ytm-1_M0i09nK5M", ytId: "1_M0i09nK5M", title: "Gori Radha Ne Kalo Kaan", artist: "Kirtidan Gadhvi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/f2/96/82/f29682a7-e780-fbb2-e6f9-8cf346816494/8718857702542.png/1000x1000bb.jpg", duration: 320 },
      { id: "ytm-uY0Qe6wA0hA", ytId: "uY0Qe6wA0hA", title: "Radha Ne Shyam Mali Jaahe", artist: "Sachin-Jigar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/76/f5/e476f57f-c316-c45b-4203-c86c30b2051c/cover.jpg/1000x1000bb.jpg", duration: 280 }
    ]
  },
  {
    id: "lang-spanish",
    meta: { title: "Latin & Reggaeton Fiesta", icon: "fa-pepper-hot", color: "#ef4444", subtitle: "Global Latin party bangers and reggaeton" },
    tracks: [
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e2/ef/f0/e2eff0bc-c51d-7de5-9280-6891ddcee71b/18UMGIM85289.rgb.jpg/1000x1000bb.jpg", duration: 229 },
      { id: "ytm-7zp1TbLFPp8", ytId: "7zp1TbLFPp8", title: "Danza Kuduro", artist: "Don Omar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/be/9d/22/be9d22c2-99b2-9e26-11dd-d1a043779b8d/10UMGIM27798.rgb.jpg/1000x1000bb.jpg", duration: 199 },
      { id: "ytm-TmKhEnGlfG0", ytId: "TmKhEnGlfG0", title: "Dakiti", artist: "Bad Bunny, Jhay Cortez", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", duration: 205 },
      { id: "ytm-tbneQDc2H3I", ytId: "tbneQDc2H3I", title: "Tusa", artist: "KAROL G, Nicki Minaj", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/13/32/be/1332be24-5c7f-8050-36b7-0862c83a1b69/23UM1IM08464.rgb.jpg/1000x1000bb.jpg", duration: 200 },
      { id: "ytm-NUsoVlDFqZg", ytId: "NUsoVlDFqZg", title: "Bailando", artist: "Enrique Iglesias", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c7/18/3e/c7183ef7-49f1-8941-03cf-ad17ca8b97ea/00602537854097.rgb.jpg/1000x1000bb.jpg", duration: 243 }
    ]
  },
  {
    id: "lang-kpop",
    meta: { title: "K-Pop Global Wave", icon: "fa-compact-disc", color: "#ec4899", subtitle: "BTS, BLACKPINK, NewJeans and FIFTY FIFTY" },
    tracks: [
      { id: "ytm-gdZLi9oWNZg", ytId: "gdZLi9oWNZg", title: "Dynamite", artist: "BTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/03/8d/0e/038d0e52-e96d-f386-b8eb-9f77fa013543/195497146918_Cover.jpg/1000x1000bb.jpg", duration: 199 },
      { id: "ytm-WMweEpGlu_U", ytId: "WMweEpGlu_U", title: "Butter", artist: "BTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/27/80/dc/2780dce3-3cdd-d8aa-ec8c-05bf8ad90f9d/196006771362_Cover.jpg/1000x1000bb.jpg", duration: 164 },
      { id: "ytm-ioNng23DkIM", ytId: "ioNng23DkIM", title: "How You Like That", artist: "BLACKPINK", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/48/3b/39/483b3943-ffb2-3e78-0721-623dbdf737b9/20UMGIM50590.rgb.jpg/1000x1000bb.jpg", duration: 181 },
      { id: "ytm-Qc7_zRjH808", ytId: "Qc7_zRjH808", title: "Cupid (Twin Ver.)", artist: "FIFTY FIFTY", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/6b/2e/aa/6b2eaa77-af21-4b0d-5ae0-2062cbf44e55/196872355437.jpg/1000x1000bb.jpg", duration: 174 },
      { id: "ytm-QU9c0053UAU", ytId: "QU9c0053UAU", title: "Seven", artist: "Jung Kook ft. Latto", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a5/a6/56/a5a6561a-f570-2fb1-5a3a-95b150c18f18/196922550928_Cover.jpg/1000x1000bb.jpg", duration: 184 }
    ]
  }
];

export const getQuickPicks = (limit = 6) => {
  return [
    { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg", duration: 200 },
    { id: "ytm-IJq0ydg105U", ytId: "IJq0ydg105U", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", duration: 262 },
    { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 233 },
    { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", duration: 230 },
    { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/1000x1000bb.jpg", duration: 267 },
    { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", duration: 268 }
  ].slice(0, limit);
};

export const getFeaturedArtists = () => {
  return [
    { name: "Arijit Singh", genre: "Bollywood / Soul", avatar: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
    { name: "The Weeknd", genre: "Pop / R&B", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg" },
    { name: "Ed Sheeran", genre: "Pop / Acoustic", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg" },
    { name: "Taylor Swift", genre: "Pop / Country", avatar: "https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg" },
    { name: "Anirudh Ravichander", genre: "Kollywood / Electronic", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg" },
    { name: "AP Dhillon", genre: "Punjabi / Urban", avatar: "https://i.ytimg.com/vi/Ib_eaGBQVNM/hqdefault.jpg" },
    { name: "Dua Lipa", genre: "Dance Pop", avatar: "https://i.ytimg.com/vi/k2qgadSvNyU/hqdefault.jpg" },
    { name: "Bad Bunny", genre: "Latin / Reggaeton", avatar: "https://i.ytimg.com/vi/CPK_IdHe1Yg/hqdefault.jpg" }
  ];
};

export const getCuratedPlaylists = () => {
  return [
    {
      id: "pl-daily-mix-1",
      title: "Daily Mix 1: Pure Synth & Pop",
      description: "The Weeknd, Ed Sheeran, Harry Styles and Miley Cyrus",
      coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
      trackCount: 15,
      tracks: [
        { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg", duration: 200 },
        { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", duration: 230 },
        { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 233 },
        { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/2a/19/fb/2a19fb85-2f70-9e44-f2a9-82abe679b88e/886449990061.jpg/1000x1000bb.jpg", duration: 167 }
      ]
    },
    {
      id: "pl-bollywood-heart",
      title: "Bollywood Love Stories",
      description: "The deepest romantic anthems by Arijit Singh & Shreya Ghoshal",
      coverUrl: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg",
      trackCount: 20,
      tracks: [
        { id: "ytm-IJq0ydg105U", ytId: "IJq0ydg105U", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", duration: 262 },
        { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/1000x1000bb.jpg", duration: 198 },
        { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", duration: 268 },
        { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/86/35/ee/8635eeea-d38e-1221-2ca6-aabcd481004f/8909024120539.png/1000x1000bb.jpg", duration: 201 }
      ]
    },
    {
      id: "pl-punjabi-hype",
      title: "Punjabi Hype & Urban Drill",
      description: "AP Dhillon, Shubh, Sidhu Moose Wala and Gurinder Gill",
      coverUrl: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg",
      trackCount: 18,
      tracks: [
        { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/26/a3/ac/26a3ac64-69e4-95ec-80ab-1f5a477537d2/859742042973_cover.jpg/1000x1000bb.jpg", duration: 267 },
        { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/47/47/ac/4747ac85-1658-64ae-bc82-220a4d6213d5/859747478890_cover.jpg/1000x1000bb.jpg", duration: 176 },
        { id: "ytm-qLCHz_qG6zU", ytId: "qLCHz_qG6zU", title: "Elevated", artist: "Shubh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music117/v4/a3/31/f8/a331f824-3dd1-e8b6-5148-8d016d71fc26/191061761174.jpg/1000x1000bb.jpg", duration: 201 }
      ]
    },
    {
      id: "pl-lofi-late-night",
      title: "Late Night Chill & Relax",
      description: "Low-fidelity aesthetic beats for deep meditation and dreaming",
      coverUrl: "https://i.ytimg.com/vi/DWcJFNfaw90/hqdefault.jpg",
      trackCount: 25,
      tracks: [
        { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/cb/7b/a9/cb7ba903-b5f1-cc21-90db-7a81b7aa0997/724596951057.jpg/1000x1000bb.jpg", duration: 243 },
        { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4f/13/65/4f1365b0-e97c-c469-c438-2f7d8f204355/872133025584_cover.jpg/1000x1000bb.jpg", duration: 212 }
      ]
    }
  ];
};

export const fetchCategoryTracks = async (categoryId, limit = 20) => {
  const cat = CATALOG_CATEGORIES.find(c => c.id === categoryId);
  if (cat && cat.tracks && cat.tracks.length > 0) {
    return cat.tracks.map(t => ({
      id: t.id || (t.ytId ? `ytm-${t.ytId}` : `pulse-${Math.random()}`),
      ytId: t.ytId,
      title: t.title,
      artist: t.artist,
      coverUrl: t.cover || t.coverUrl || "./pulse-logo.png",
      duration: t.duration || 220,
      source: "Studio Master Audio 320k"
    })).slice(0, limit);
  }

  // Fallback search
  try {
    if (typeof window !== 'undefined' && window.musicService?.searchTracks) {
      return await window.musicService.searchTracks(categoryId.replace('cat-', ''), limit);
    }
  } catch (e) {}

  return [];
};

/**
 * Searches across all built-in catalog categories, language playlists, and curated tracks
 */
export function searchCatalogTracks(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  const matched = [];
  const seen = new Set();

  const add = (t, src) => {
    if (!t || !t.title) return;
    const title = (t.title || '').toLowerCase();
    const artist = (t.artist || '').toLowerCase();
    if (title.includes(q) || artist.includes(q) || q.includes(title) || q.includes(artist)) {
      const key = `${title}___${artist}`;
      if (!seen.has(key)) {
        seen.add(key);
        matched.push({
          id: t.id || (t.ytId ? `ytm-${t.ytId}` : `cat-${Math.random()}`),
          ytId: t.ytId,
          title: t.title,
          artist: t.artist,
          album: t.album || 'Pulse Master Catalog',
          coverUrl: t.coverUrl || t.cover || './pulse-logo.png',
          duration: t.duration || 220,
          source: src || 'Studio Master Audio 320k'
        });
      }
    }
  };

  // 1. Search in CATALOG_CATEGORIES
  CATALOG_CATEGORIES.forEach(cat => {
    (cat.tracks || []).forEach(t => add(t, cat.title));
  });

  // 2. Search in LANGUAGE_PLAYLISTS (Hindi, English, Punjabi, Kannada, Tamil, Telugu, Marathi, Gujarati, Spanish, K-Pop)
  LANGUAGE_PLAYLISTS.forEach(lang => {
    (lang.tracks || []).forEach(t => add(t, lang.meta.title));
  });

  // 3. Search in Quick Picks & Curated Playlists
  getQuickPicks(30).forEach(t => add(t, 'Quick Picks'));
  getCuratedPlaylists().forEach(pl => {
    (pl.tracks || []).forEach(t => add(t, pl.title));
  });

  return matched;
}

export const getArtistDetails = (artistName) => {
  const normalized = (artistName || '').toLowerCase().trim();
  let tracks = [];
  let banner = "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg";
  let monthlyListeners = "45,000,000";
  let worldRank = "#5";
  let bio = `Official verified discography and high-fidelity streams for ${artistName}.`;

  if (normalized.includes('arijit')) {
    monthlyListeners = "68,400,000";
    worldRank = "#1 in India";
    banner = "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg";
    bio = "Arijit Singh is a celebrated Indian playback singer and music composer, known as the 'King of Playback Singing' in contemporary Bollywood.";
    tracks = [
      { id: "ytm-IJq0ydg105U", ytId: "IJq0ydg105U", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", duration: 262, plays: "1,450,000,000" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/1e/ff/32/1eff3216-190d-6fd9-8f68-acbba846e6ee/8903431956026_cover.jpg/1000x1000bb.jpg", duration: 198, plays: "820,000,000" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", duration: 268, plays: "980,000,000" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/86/35/ee/8635eeea-d38e-1221-2ca6-aabcd481004f/8909024120539.png/1000x1000bb.jpg", duration: 201, plays: "640,000,000" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/cf/cf/af/cfcfaf49-f337-eeab-2351-dd0a137dc740/8902894362139_cover.jpg/1000x1000bb.jpg", duration: 233, plays: "520,000,000" }
    ];
  } else if (normalized.includes('weeknd')) {
    monthlyListeners = "112,000,000";
    worldRank = "#1 Globally";
    banner = "https://i.ytimg.com/vi/5mqFmNl11-M/hqdefault.jpg";
    bio = "The Weeknd (Abel Tesfaye) is a Canadian singer, songwriter, and record producer known for his sonic versatility and dark lyricism.";
    tracks = [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg", duration: 200, plays: "4,100,000,000" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b5/92/bb/b592bb72-52e3-e756-9b26-9f56d08f47ab/16UMGIM67864.rgb.jpg/1000x1000bb.jpg", duration: 230, plays: "3,200,000,000" },
      { id: "ytm-fHI8X48Y36I", ytId: "fHI8X48Y36I", title: "The Hills", artist: "The Weeknd", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/30/05/1e/30051e57-a63a-3acc-4b30-42568293f5f7/15UMGIM36514.rgb.jpg/1000x1000bb.jpg", duration: 242, plays: "2,500,000,000" }
    ];
  } else if (normalized.includes('sheeran')) {
    monthlyListeners = "84,000,000";
    worldRank = "#6 Globally";
    banner = "https://i.ytimg.com/vi/fHI8X48Y36I/hqdefault.jpg";
    bio = "Ed Sheeran is an English singer-songwriter who has sold more than 150 million records worldwide, making him one of the best-selling artists.";
    tracks = [
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 233, plays: "3,800,000,000" },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", duration: 263, plays: "3,100,000,000" }
    ];
  } else if (normalized.includes('taylor')) {
    monthlyListeners = "105,000,000";
    worldRank = "#2 Globally";
    banner = "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg";
    bio = "Taylor Swift is an American singer-songwriter whose discography spans multiple genres and has broken records across modern music history.";
    tracks = [
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/49/3d/ab/493dab54-f920-9043-6181-80993b8116c9/19UMGIM53909.rgb.jpg/1000x1000bb.jpg", duration: 178, plays: "2,200,000,000" },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/a7/98/d8/a798d867-344d-2bf2-fbfe-d2d1412dcef8/14UMDIM03793.rgb.jpg/1000x1000bb.jpg", duration: 231, plays: "1,900,000,000" }
    ];
  } else if (normalized.includes('anirudh')) {
    monthlyListeners = "28,000,000";
    worldRank = "#1 in South India";
    banner = "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg";
    bio = "Anirudh Ravichander is an Indian music composer and singer who works predominantly in Tamil cinema with worldwide viral chartbusters.";
    tracks = [
      { id: "ytm-8FAUEv_E_xU", ytId: "8FAUEv_E_xU", title: "Arabic Kuthu", artist: "Anirudh Ravichander", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/e9/19/b9/e919b921-d5a8-9e9a-8508-3551da375aee/196626458629.jpg/1000x1000bb.jpg", duration: 279, plays: "750,000,000" },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a3/f2/dc/a3f2dc29-fc54-07bb-8f9c-2a3936d21a5d/886448363347.jpg/1000x1000bb.jpg", duration: 230, plays: "620,000,000" }
    ];
  } else {
    tracks = [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: artistName, coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200, plays: "1,200,000" },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: artistName, coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233, plays: "980,000" }
    ];
  }

  return {
    id: artistName.toLowerCase().replace(/\s+/g, '-'),
    name: artistName,
    monthlyListeners,
    worldRank,
    banner,
    avatar: banner,
    topTracks: tracks,
    albums: [
      { title: "Greatest Studio Hits", year: "2024", type: "Album", coverUrl: tracks[0]?.coverUrl || banner },
      { title: "Live Concert Sessions", year: "2023", type: "Live Album", coverUrl: tracks[1]?.coverUrl || banner }
    ],
    singles: [
      { title: tracks[0]?.title || "Latest Single", year: "2024", type: "Single", coverUrl: tracks[0]?.coverUrl || banner }
    ],
    bio,
    similarArtists: [
      { name: "Arijit Singh", role: "Playback Legend", avatar: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
      { name: "Ed Sheeran", role: "Singer-Songwriter", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg" },
      { name: "The Weeknd", role: "Pop Icon", avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg" }
    ]
  };
};

const catalogService = {
  CATALOG_CATEGORIES,
  LANGUAGE_PLAYLISTS,
  getQuickPicks,
  getFeaturedArtists,
  getCuratedPlaylists,
  fetchCategoryTracks,
  getArtistDetails,
  searchCatalogTracks
};

if (typeof window !== 'undefined') {
  window.catalogService = catalogService;
}

export default catalogService;
