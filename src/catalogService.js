/**
 * Pulse Music - Comprehensive Multi-Genre & Multilingual Catalog Service
 * Provides complete catalog hierarchies, mood shelves, language hubs,
 * curated playlist mixes, quick picks, and featured artists.
 */

export const CATALOG_CATEGORIES = [
  {
    id: "cat-trending",
    title: "Global Viral & Trending Now",
    subtitle: "The hottest streamable anthems dominating worldwide charts",
    icon: "fa-fire-flame-curved",
    color: "#f43f5e",
    tracks: [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", cover: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200, genre: "Pop / Synthwave" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", cover: "https://i.ytimg.com/vi/34Na4j8HLws/hqdefault.jpg", duration: 230, genre: "Pop / R&B" },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233, genre: "Pop" },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", cover: "https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg", duration: 178, genre: "Pop" },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", cover: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg", duration: 167, genre: "Indie Pop" },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", cover: "https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg", duration: 199, genre: "Pop" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", cover: "https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg", duration: 198, genre: "Bollywood" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", cover: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", duration: 268, genre: "Bollywood" }
    ]
  },
  {
    id: "cat-workout",
    title: "High-Energy & Workout EDM",
    subtitle: "High-BPM adrenaline fuel for intense sessions and running",
    icon: "fa-bolt",
    color: "#eab308",
    tracks: [
      { id: "ytm-1_kZ47Lh60s", ytId: "1_kZ47Lh60s", title: "Titanium", artist: "David Guetta ft. Sia", cover: "https://i.ytimg.com/vi/1_kZ47Lh60s/hqdefault.jpg", duration: 245, genre: "EDM" },
      { id: "ytm-60ItHLz5WEA", ytId: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", cover: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg", duration: 212, genre: "Electro" },
      { id: "ytm-YqeW9_5kURI", ytId: "YqeW9_5kURI", title: "Lean On", artist: "Major Lazer & DJ Snake", cover: "https://i.ytimg.com/vi/YqeW9_5kURI/hqdefault.jpg", duration: 176, genre: "Dance" },
      { id: "ytm-JRfuAukYTKg", ytId: "JRfuAukYTKg", title: "Animals", artist: "Martin Garrix", cover: "https://i.ytimg.com/vi/JRfuAukYTKg/hqdefault.jpg", duration: 185, genre: "Big Room House" },
      { id: "ytm-kXYiU_JCYtU", ytId: "kXYiU_JCYtU", title: "Numb / Encore", artist: "Linkin Park & Jay-Z", cover: "https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg", duration: 205, genre: "Rock / Hip-Hop" },
      { id: "ytm-pAgnJDJN4VA", ytId: "pAgnJDJN4VA", title: "Animals (Club Mix)", artist: "Martin Garrix", cover: "https://i.ytimg.com/vi/pAgnJDJN4VA/hqdefault.jpg", duration: 220, genre: "EDM" },
      { id: "ytm-IcrbM1l_BoI", ytId: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii", cover: "https://i.ytimg.com/vi/IcrbM1l_BoI/hqdefault.jpg", duration: 247, genre: "Progressive House" },
      { id: "ytm-09R8_2nJtjg", ytId: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", cover: "https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg", duration: 235, genre: "Pop Funk" }
    ]
  },
  {
    id: "cat-lofi",
    title: "Late Night Lo-Fi & Deep Focus",
    subtitle: "Chilled beats, mellow keys and soothing rhythms to study and unwind",
    icon: "fa-moon",
    color: "#a855f7",
    tracks: [
      { id: "ytm-5qap5aO4i9A", ytId: "5qap5aO4i9A", title: "Lofi Hip Hop Beats", artist: "Lofi Girl", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80", duration: 180, genre: "Lo-Fi" },
      { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", cover: "https://i.ytimg.com/vi/DWcJFNfaw90/hqdefault.jpg", duration: 243, genre: "Synthwave" },
      { id: "ytm-jfKfPfyJRdk", ytId: "jfKfPfyJRdk", title: "Coffee Beats & Rain", artist: "ChilledCow", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80", duration: 210, genre: "Lo-Fi Chill" },
      { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", cover: "https://i.ytimg.com/vi/rR4n-0KYeKQ/hqdefault.jpg", duration: 212, genre: "Chillwave" },
      { id: "ytm-n61ULEU7CO0", ytId: "n61ULEU7CO0", title: "Warm Nights", artist: "Xori", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80", duration: 195, genre: "Lo-Fi" },
      { id: "ytm-HDhR2Yhnvfo", ytId: "HDhR2Yhnvfo", title: "Affection", artist: "Jinsang", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80", duration: 160, genre: "Lo-Fi Beats" }
    ]
  },
  {
    id: "cat-romance",
    title: "Soulful Acoustic & Romantic Hits",
    subtitle: "Heartwarming melodies, acoustic ballads and love anthems",
    icon: "fa-heart",
    color: "#ec4899",
    tracks: [
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", cover: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg", duration: 263, genre: "Acoustic Pop" },
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", cover: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg", duration: 262, genre: "Bollywood Romance" },
      { id: "ytm-450p7goxZqg", ytId: "450p7goxZqg", title: "All of Me", artist: "John Legend", cover: "https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg", duration: 269, genre: "Soul / R&B" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", cover: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg", duration: 201, genre: "Bollywood Romance" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", cover: "https://i.ytimg.com/vi/5mqFmNl11-M/hqdefault.jpg", duration: 233, genre: "Bollywood" },
      { id: "ytm-LPn0KStbm9M", ytId: "LPn0KStbm9M", title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://i.ytimg.com/vi/LPn0KStbm9M/hqdefault.jpg", duration: 182, genre: "Ballad" },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", cover: "https://i.ytimg.com/vi/Yx5V6l9Q-G8/hqdefault.jpg", duration: 200, genre: "Kannada Melody" },
      { id: "ytm-31383g2K6nE", ytId: "31383g2K6nE", title: "Darshana", artist: "Hesham Abdul Wahab", cover: "https://i.ytimg.com/vi/31383g2K6nE/hqdefault.jpg", duration: 224, genre: "Malayalam" }
    ]
  },
  {
    id: "cat-rock",
    title: "Rock Legends & Alternative Anthems",
    subtitle: "Timeless guitar solos, soaring vocals and stadium power chords",
    icon: "fa-guitar",
    color: "#06b6d4",
    tracks: [
      { id: "ytm-fJ9rUzIMcZQ", ytId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen", cover: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg", duration: 354, genre: "Classic Rock" },
      { id: "ytm-kXYiU_JCYtU", ytId: "kXYiU_JCYtU", title: "In the End", artist: "Linkin Park", cover: "https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg", duration: 216, genre: "Alternative Rock" },
      { id: "ytm-hTWKbfoikeg", ytId: "hTWKbfoikeg", title: "Smells Like Teen Spirit", artist: "Nirvana", cover: "https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg", duration: 301, genre: "Grunge" },
      { id: "ytm-1w7OgIMMRc4", ytId: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", cover: "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg", duration: 303, genre: "Hard Rock" },
      { id: "ytm-v2AC41dglnM", ytId: "v2AC41dglnM", title: "Thunderstruck", artist: "AC/DC", cover: "https://i.ytimg.com/vi/v2AC41dglnM/hqdefault.jpg", duration: 292, genre: "Hard Rock" },
      { id: "ytm-eVTXPUF4Oz4", ytId: "eVTXPUF4Oz4", title: "In the Shadows", artist: "The Rasmus", cover: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg", duration: 246, genre: "Rock" }
    ]
  },
  {
    id: "cat-party",
    title: "Club Nights & Party Starters",
    subtitle: "High-octane floor fillers, dancehall rhythms and club bangers",
    icon: "fa-champagne-glasses",
    color: "#10b981",
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", cover: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg", duration: 267, genre: "Punjabi Urban" },
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", cover: "https://i.ytimg.com/vi/99e_0_Z-Bw0/hqdefault.jpg", duration: 230, genre: "Marathi Dance" },
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander", cover: "https://i.ytimg.com/vi/KqNX2xW1Icw/hqdefault.jpg", duration: 279, genre: "Kollywood Dance" },
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", cover: "https://i.ytimg.com/vi/OsU0CGZoV8E/hqdefault.jpg", duration: 215, genre: "Tollywood Dance" },
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", cover: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg", duration: 229, genre: "Latin Pop" },
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", cover: "https://i.ytimg.com/vi/d4OsvFi6mms/hqdefault.jpg", duration: 247, genre: "Gujarati Garba" }
    ]
  }
];

export const LANGUAGE_PLAYLISTS = [
  {
    id: "lang-hindi",
    meta: { title: "Hindi Bollywood Chartbusters", icon: "fa-music", color: "#ff5722", subtitle: "Top trending Bollywood & romantic hits" },
    tracks: [
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg", duration: 262 },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg", duration: 198 },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", duration: 268 },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg", duration: 201 },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/5mqFmNl11-M/hqdefault.jpg", duration: 233 },
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Satranga", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg", duration: 271 },
      { id: "ytm-8Vnm_uN_3oA", ytId: "8Vnm_uN_3oA", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", coverUrl: "https://i.ytimg.com/vi/8Vnm_uN_3oA/hqdefault.jpg", duration: 194 },
      { id: "ytm-60ItHLz5WEA", ytId: "60ItHLz5WEA", title: "Pehle Bhi Main", artist: "Vishal Mishra", coverUrl: "https://i.ytimg.com/vi/60ItHLz5WEA/hqdefault.jpg", duration: 250 }
    ]
  },
  {
    id: "lang-english",
    meta: { title: "Global English Hits & Billboard Top 50", icon: "fa-globe", color: "#3b82f6", subtitle: "Worldwide pop, synth and indie favorites" },
    tracks: [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200 },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", coverUrl: "https://i.ytimg.com/vi/34Na4j8HLws/hqdefault.jpg", duration: 230 },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233 },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg", duration: 178 },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg", duration: 167 },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", coverUrl: "https://i.ytimg.com/vi/G7KNmW9a75Y/hqdefault.jpg", duration: 199 },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg", duration: 263 },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg", duration: 231 }
    ]
  },
  {
    id: "lang-punjabi",
    meta: { title: "Punjabi Urban & Chartbusters", icon: "fa-bolt", color: "#14b8a6", subtitle: "Heavy bass, folk vibes and viral hip-hop" },
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", coverUrl: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg", duration: 267 },
      { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg", duration: 176 },
      { id: "ytm-Z9e7kHnN6wE", ytId: "Z9e7kHnN6wE", title: "Elevated", artist: "Shubh", coverUrl: "https://i.ytimg.com/vi/Z9e7kHnN6wE/hqdefault.jpg", duration: 201 },
      { id: "ytm-N2-0GqH3wM0", ytId: "N2-0GqH3wM0", title: "We Rollin", artist: "Shubh", coverUrl: "https://i.ytimg.com/vi/N2-0GqH3wM0/hqdefault.jpg", duration: 199 },
      { id: "ytm-Zf8q6N4I4Gk", ytId: "Zf8q6N4I4Gk", title: "No Love", artist: "Shubh", coverUrl: "https://i.ytimg.com/vi/Zf8q6N4I4Gk/hqdefault.jpg", duration: 181 },
      { id: "ytm-cl0a3i2wFcc", ytId: "cl0a3i2wFcc", title: "295", artist: "Sidhu Moose Wala", coverUrl: "https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg", duration: 270 },
      { id: "ytm-eZ2_6LgB93k", ytId: "eZ2_6LgB93k", title: "With You", artist: "AP Dhillon", coverUrl: "https://i.ytimg.com/vi/eZ2_6LgB93k/hqdefault.jpg", duration: 154 }
    ]
  },
  {
    id: "lang-kannada",
    meta: { title: "Kannada Sandalwood Sensations", icon: "fa-crown", color: "#8b5cf6", subtitle: "Chartbusters from KGF, Kantara and melodies" },
    tracks: [
      { id: "ytm-d1qgL-Hmsf0", ytId: "d1qgL-Hmsf0", title: "Singara Siriye", artist: "Vijay Prakash, Ananya Bhat", coverUrl: "https://i.ytimg.com/vi/d1qgL-Hmsf0/hqdefault.jpg", duration: 284 },
      { id: "ytm-e1L1Rydm25c", ytId: "e1L1Rydm25c", title: "Ra Ra Rakkamma", artist: "Nakash Aziz, Sunidhi Chauhan", coverUrl: "https://i.ytimg.com/vi/e1L1Rydm25c/hqdefault.jpg", duration: 215 },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", coverUrl: "https://i.ytimg.com/vi/Yx5V6l9Q-G8/hqdefault.jpg", duration: 200 },
      { id: "ytm-h2H7s8hL4O8", ytId: "h2H7s8hL4O8", title: "Belageddu", artist: "Vijay Prakash", coverUrl: "https://i.ytimg.com/vi/h2H7s8hL4O8/hqdefault.jpg", duration: 211 },
      { id: "ytm-hM9mH_O9kYk", ytId: "hM9mH_O9kYk", title: "Munjaane Manju", artist: "Raghu Dixit", coverUrl: "https://i.ytimg.com/vi/hM9mH_O9kYk/hqdefault.jpg", duration: 250 },
      { id: "ytm-j1_069X72mU", ytId: "j1_069X72mU", title: "Toofan (KGF 2)", artist: "Brijesh Shandilya", coverUrl: "https://i.ytimg.com/vi/j1_069X72mU/hqdefault.jpg", duration: 218 }
    ]
  },
  {
    id: "lang-tamil",
    meta: { title: "Tamil Kollywood Chartbusters", icon: "fa-star", color: "#f43f5e", subtitle: "High energy tracks by Anirudh, AR Rahman & Dhee" },
    tracks: [
      { id: "ytm-x6Q7c9RyMzk", ytId: "x6Q7c9RyMzk", title: "Rowdy Baby", artist: "Dhanush, Dhee", coverUrl: "https://i.ytimg.com/vi/x6Q7c9RyMzk/hqdefault.jpg", duration: 284 },
      { id: "ytm-eYq7WapuDLU", ytId: "eYq7WapuDLU", title: "Enjoy Enjaami", artist: "Dhee, Arivu", coverUrl: "https://i.ytimg.com/vi/eYq7WapuDLU/hqdefault.jpg", duration: 298 },
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander, Jonita Gandhi", coverUrl: "https://i.ytimg.com/vi/KqNX2xW1Icw/hqdefault.jpg", duration: 279 },
      { id: "ytm-rN1fS03JvV8", ytId: "rN1fS03JvV8", title: "Naa Ready", artist: "Thalapathy Vijay, Anirudh", coverUrl: "https://i.ytimg.com/vi/rN1fS03JvV8/hqdefault.jpg", duration: 248 },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://i.ytimg.com/vi/fRD_3vJagOU/hqdefault.jpg", duration: 230 },
      { id: "ytm-1b4ZpP_g1g8", ytId: "1b4ZpP_g1g8", title: "Hukum (Jailer)", artist: "Anirudh Ravichander", coverUrl: "https://i.ytimg.com/vi/1b4ZpP_g1g8/hqdefault.jpg", duration: 207 }
    ]
  },
  {
    id: "lang-telugu",
    meta: { title: "Telugu Tollywood Blockbusters", icon: "fa-film", color: "#06b6d4", subtitle: "Viral beats from RRR, Pushpa & Sid Sriram melodies" },
    tracks: [
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", coverUrl: "https://i.ytimg.com/vi/OsU0CGZoV8E/hqdefault.jpg", duration: 215 },
      { id: "ytm-P2uM8E1c-1k", ytId: "P2uM8E1c-1k", title: "Samajavaragamana", artist: "Sid Sriram", coverUrl: "https://i.ytimg.com/vi/P2uM8E1c-1k/hqdefault.jpg", duration: 224 },
      { id: "ytm-hcMzwMrr1tE", ytId: "hcMzwMrr1tE", title: "Srivalli", artist: "Sid Sriram", coverUrl: "https://i.ytimg.com/vi/hcMzwMrr1tE/hqdefault.jpg", duration: 221 },
      { id: "ytm-61X-N712DqY", ytId: "61X-N712DqY", title: "Oo Antava Mava", artist: "Indravathi Chauhan", coverUrl: "https://i.ytimg.com/vi/61X-N712DqY/hqdefault.jpg", duration: 223 },
      { id: "ytm-2mDCVzruVgQ", ytId: "2mDCVzruVgQ", title: "Butta Bomma", artist: "Armaan Malik", coverUrl: "https://i.ytimg.com/vi/2mDCVzruVgQ/hqdefault.jpg", duration: 198 },
      { id: "ytm-W_12qM1F5gA", ytId: "W_12qM1F5gA", title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", coverUrl: "https://i.ytimg.com/vi/W_12qM1F5gA/hqdefault.jpg", duration: 250 }
    ]
  },
  {
    id: "lang-marathi",
    meta: { title: "Marathi Blockbusters", icon: "fa-drum", color: "#eab308", subtitle: "Ajay-Atul classics and modern Marathi pop" },
    tracks: [
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", coverUrl: "https://i.ytimg.com/vi/99e_0_Z-Bw0/hqdefault.jpg", duration: 230 },
      { id: "ytm-p8gq4I26q7k", ytId: "p8gq4I26q7k", title: "Apsara Aali", artist: "Bela Shende", coverUrl: "https://i.ytimg.com/vi/p8gq4I26q7k/hqdefault.jpg", duration: 245 },
      { id: "ytm-mI60DtyDpsk", ytId: "mI60DtyDpsk", title: "Bring It On", artist: "Ajay-Atul", coverUrl: "https://i.ytimg.com/vi/mI60DtyDpsk/hqdefault.jpg", duration: 211 },
      { id: "ytm-n-k4iC1F2E0", ytId: "n-k4iC1F2E0", title: "Yad Lagla", artist: "Ajay Gogavale", coverUrl: "https://i.ytimg.com/vi/n-k4iC1F2E0/hqdefault.jpg", duration: 301 },
      { id: "ytm-Oq8j5Qz9Q6U", ytId: "Oq8j5Qz9Q6U", title: "Sairat Zaala Ji", artist: "Chinmayi Sripaada", coverUrl: "https://i.ytimg.com/vi/Oq8j5Qz9Q6U/hqdefault.jpg", duration: 366 }
    ]
  },
  {
    id: "lang-gujarati",
    meta: { title: "Gujarati Garba & Folk Hits", icon: "fa-gopuram", color: "#f59e0b", subtitle: "Navratri anthems, viral folk and Darshan Raval" },
    tracks: [
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", coverUrl: "https://i.ytimg.com/vi/d4OsvFi6mms/hqdefault.jpg", duration: 247 },
      { id: "ytm-QdXVhEiaY9c", ytId: "QdXVhEiaY9c", title: "Kamariya", artist: "Darshan Raval", coverUrl: "https://i.ytimg.com/vi/QdXVhEiaY9c/hqdefault.jpg", duration: 260 },
      { id: "ytm-Q28K4vDtd4Y", ytId: "Q28K4vDtd4Y", title: "Dholida", artist: "Neha Kakkar", coverUrl: "https://i.ytimg.com/vi/Q28K4vDtd4Y/hqdefault.jpg", duration: 180 },
      { id: "ytm-1_M0i09nK5M", ytId: "1_M0i09nK5M", title: "Gori Radha Ne Kalo Kaan", artist: "Kirtidan Gadhvi", coverUrl: "https://i.ytimg.com/vi/1_M0i09nK5M/hqdefault.jpg", duration: 320 },
      { id: "ytm-uY0Qe6wA0hA", ytId: "uY0Qe6wA0hA", title: "Radha Ne Shyam Mali Jaahe", artist: "Sachin-Jigar", coverUrl: "https://i.ytimg.com/vi/uY0Qe6wA0hA/hqdefault.jpg", duration: 280 }
    ]
  },
  {
    id: "lang-spanish",
    meta: { title: "Latin & Reggaeton Fiesta", icon: "fa-pepper-hot", color: "#ef4444", subtitle: "Global Latin party bangers and reggaeton" },
    tracks: [
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", coverUrl: "https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg", duration: 229 },
      { id: "ytm-7zp1TbIG4fM", ytId: "7zp1TbIG4fM", title: "Danza Kuduro", artist: "Don Omar", coverUrl: "https://i.ytimg.com/vi/7zp1TbIG4fM/hqdefault.jpg", duration: 199 },
      { id: "ytm-TmKhEnGlfG0", ytId: "TmKhEnGlfG0", title: "Dakiti", artist: "Bad Bunny, Jhay Cortez", coverUrl: "https://i.ytimg.com/vi/TmKhEnGlfG0/hqdefault.jpg", duration: 205 },
      { id: "ytm-tbneQDc2H3I", ytId: "tbneQDc2H3I", title: "Tusa", artist: "KAROL G, Nicki Minaj", coverUrl: "https://i.ytimg.com/vi/tbneQDc2H3I/hqdefault.jpg", duration: 200 },
      { id: "ytm-NUsoVlDFqZg", ytId: "NUsoVlDFqZg", title: "Bailando", artist: "Enrique Iglesias", coverUrl: "https://i.ytimg.com/vi/NUsoVlDFqZg/hqdefault.jpg", duration: 243 }
    ]
  },
  {
    id: "lang-kpop",
    meta: { title: "K-Pop Global Wave", icon: "fa-compact-disc", color: "#ec4899", subtitle: "BTS, BLACKPINK, NewJeans and FIFTY FIFTY" },
    tracks: [
      { id: "ytm-gdZLi9oWNZg", ytId: "gdZLi9oWNZg", title: "Dynamite", artist: "BTS", coverUrl: "https://i.ytimg.com/vi/gdZLi9oWNZg/hqdefault.jpg", duration: 199 },
      { id: "ytm-WMweEpGlu_U", ytId: "WMweEpGlu_U", title: "Butter", artist: "BTS", coverUrl: "https://i.ytimg.com/vi/WMweEpGlu_U/hqdefault.jpg", duration: 164 },
      { id: "ytm-ioNng23DkIM", ytId: "ioNng23DkIM", title: "How You Like That", artist: "BLACKPINK", coverUrl: "https://i.ytimg.com/vi/ioNng23DkIM/hqdefault.jpg", duration: 181 },
      { id: "ytm-Qc7_zRjH808", ytId: "Qc7_zRjH808", title: "Cupid (Twin Ver.)", artist: "FIFTY FIFTY", coverUrl: "https://i.ytimg.com/vi/Qc7_zRjH808/hqdefault.jpg", duration: 174 },
      { id: "ytm-QU9c0053UAU", ytId: "QU9c0053UAU", title: "Seven", artist: "Jung Kook ft. Latto", coverUrl: "https://i.ytimg.com/vi/QU9c0053UAU/hqdefault.jpg", duration: 184 }
    ]
  }
];

export const getQuickPicks = (limit = 6) => {
  return [
    { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200 },
    { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg", duration: 262 },
    { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233 },
    { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/34Na4j8HLws/hqdefault.jpg", duration: 230 },
    { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg", duration: 267 },
    { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", duration: 268 }
  ].slice(0, limit);
};

export const getFeaturedArtists = () => {
  return [
    { name: "Arijit Singh", genre: "Bollywood / Soul", avatar: "https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3" },
    { name: "The Weeknd", genre: "Pop / R&B", avatar: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb" },
    { name: "Ed Sheeran", genre: "Pop / Acoustic", avatar: "https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6" },
    { name: "Taylor Swift", genre: "Pop / Country", avatar: "https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0" },
    { name: "Anirudh Ravichander", genre: "Kollywood / Electronic", avatar: "https://i.scdn.co/image/ab6761610000e5eb989ed05e1f0570cc4726c2d3" },
    { name: "AP Dhillon", genre: "Punjabi / Urban", avatar: "https://i.scdn.co/image/ab6761610000e5eb01bd9b08f8f26c6db2057370" },
    { name: "Dua Lipa", genre: "Dance Pop", avatar: "https://i.scdn.co/image/ab6761610000e5ebd42a27db3286b58553da8858" },
    { name: "Bad Bunny", genre: "Latin / Reggaeton", avatar: "https://i.scdn.co/image/ab6761610000e5eb9e2b100863bb0df9f92fc0a3" },
    { name: "Billie Eilish", genre: "Alt-Pop / Indie", avatar: "https://i.scdn.co/image/ab6761610000e5ebd8b9980db671102a4b06830d" },
    { name: "A.R. Rahman", genre: "Soundtrack / World", avatar: "https://i.scdn.co/image/ab6761610000e5ebb19af0ea736c6228d6eb539c" }
  ];
};

export const getCuratedPlaylists = () => {
  return [
    {
      id: "pl-daily-mix-1",
      title: "Daily Mix 1: Pure Synth & Pop",
      description: "The Weeknd, Ed Sheeran, Harry Styles and Miley Cyrus",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
      trackCount: 15,
      tracks: [
        { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200 },
        { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/34Na4j8HLws/hqdefault.jpg", duration: 230 },
        { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233 },
        { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://i.ytimg.com/vi/H5v3kku4y6Q/hqdefault.jpg", duration: 167 }
      ]
    },
    {
      id: "pl-bollywood-heart",
      title: "Bollywood Love Stories",
      description: "The deepest romantic anthems by Arijit Singh & Shreya Ghoshal",
      coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80",
      trackCount: 20,
      tracks: [
        { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg", duration: 262 },
        { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg", duration: 198 },
        { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", duration: 268 },
        { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg", duration: 201 }
      ]
    },
    {
      id: "pl-punjabi-hype",
      title: "Punjabi Hype & Urban Drill",
      description: "AP Dhillon, Shubh, Sidhu Moose Wala and Gurinder Gill",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
      trackCount: 18,
      tracks: [
        { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg", duration: 267 },
        { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg", duration: 176 },
        { id: "ytm-Z9e7kHnN6wE", ytId: "Z9e7kHnN6wE", title: "Elevated", artist: "Shubh", coverUrl: "https://i.ytimg.com/vi/Z9e7kHnN6wE/hqdefault.jpg", duration: 201 }
      ]
    },
    {
      id: "pl-lofi-late-night",
      title: "Late Night Chill & Relax",
      description: "Low-fidelity aesthetic beats for deep meditation and dreaming",
      coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80",
      trackCount: 25,
      tracks: [
        { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", coverUrl: "https://i.ytimg.com/vi/DWcJFNfaw90/hqdefault.jpg", duration: 243 },
        { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", coverUrl: "https://i.ytimg.com/vi/rR4n-0KYeKQ/hqdefault.jpg", duration: 212 }
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
      coverUrl: t.cover || t.coverUrl || `https://i.ytimg.com/vi/${t.ytId}/hqdefault.jpg`,
      duration: t.duration || 220,
      source: "Pulse Catalog Master"
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

export const getArtistDetails = (artistName) => {
  const normalized = (artistName || '').toLowerCase().trim();
  let tracks = [];
  let banner = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80";
  let monthlyListeners = "45,000,000";
  let worldRank = "#5";
  let bio = `Official verified discography and high-fidelity streams for ${artistName}.`;

  if (normalized.includes('arijit')) {
    monthlyListeners = "68,400,000";
    worldRank = "#1 in India";
    banner = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80";
    bio = "Arijit Singh is a celebrated Indian playback singer and music composer, known as the 'King of Playback Singing' in contemporary Bollywood.";
    tracks = [
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg", duration: 262, plays: "1,450,000,000" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://i.ytimg.com/vi/VAdGW7QDJiU/hqdefault.jpg", duration: 198, plays: "820,000,000" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg", duration: 268, plays: "980,000,000" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg", duration: 201, plays: "640,000,000" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://i.ytimg.com/vi/5mqFmNl11-M/hqdefault.jpg", duration: 233, plays: "520,000,000" }
    ];
  } else if (normalized.includes('weeknd')) {
    monthlyListeners = "112,000,000";
    worldRank = "#1 Globally";
    banner = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80";
    bio = "The Weeknd (Abel Tesfaye) is a Canadian singer, songwriter, and record producer known for his sonic versatility and dark lyricism.";
    tracks = [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg", duration: 200, plays: "4,100,000,000" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/34Na4j8HLws/hqdefault.jpg", duration: 230, plays: "3,200,000,000" },
      { id: "ytm-fHI8X48Y36I", ytId: "fHI8X48Y36I", title: "The Hills", artist: "The Weeknd", coverUrl: "https://i.ytimg.com/vi/fHI8X48Y36I/hqdefault.jpg", duration: 242, plays: "2,500,000,000" }
    ];
  } else if (normalized.includes('sheeran')) {
    monthlyListeners = "84,000,000";
    worldRank = "#6 Globally";
    bio = "Ed Sheeran is an English singer-songwriter who has sold more than 150 million records worldwide, making him one of the best-selling artists.";
    tracks = [
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg", duration: 233, plays: "3,800,000,000" },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg", duration: 263, plays: "3,100,000,000" }
    ];
  } else if (normalized.includes('taylor')) {
    monthlyListeners = "105,000,000";
    worldRank = "#2 Globally";
    bio = "Taylor Swift is an American singer-songwriter whose discography spans multiple genres and has broken records across modern music history.";
    tracks = [
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://i.ytimg.com/vi/ic8j13piAhQ/hqdefault.jpg", duration: 178, plays: "2,200,000,000" },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://i.ytimg.com/vi/e-ORhEE9VVg/hqdefault.jpg", duration: 231, plays: "1,900,000,000" }
    ];
  } else if (normalized.includes('anirudh')) {
    monthlyListeners = "28,000,000";
    worldRank = "#1 in South India";
    bio = "Anirudh Ravichander is an Indian music composer and singer who works predominantly in Tamil cinema with worldwide viral chartbusters.";
    tracks = [
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander", coverUrl: "https://i.ytimg.com/vi/KqNX2xW1Icw/hqdefault.jpg", duration: 279, plays: "750,000,000" },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://i.ytimg.com/vi/fRD_3vJagOU/hqdefault.jpg", duration: 230, plays: "620,000,000" }
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
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(artistName)}`,
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
      { name: "Arijit Singh", role: "Playback Legend", avatar: "https://i.scdn.co/image/ab6761610000e5eb0261696c5df3be99da6ed3f3" },
      { name: "Ed Sheeran", role: "Singer-Songwriter", avatar: "https://i.scdn.co/image/ab6761610000e5eb12a2ef08d00dd7451a6dbed6" },
      { name: "The Weeknd", role: "Pop Icon", avatar: "https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb" }
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
  getArtistDetails
};

if (typeof window !== 'undefined') {
  window.catalogService = catalogService;
}

export default catalogService;
