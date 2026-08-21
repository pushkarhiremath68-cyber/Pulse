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
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200, genre: "Pop / Synthwave" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 230, genre: "Pop / R&B" },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233, genre: "Pop" },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 178, genre: "Pop" },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 167, genre: "Indie Pop" },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 199, genre: "Pop" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 198, genre: "Bollywood" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 268, genre: "Bollywood" }
    ]
  },
  {
    id: "cat-workout",
    title: "High-Energy & Workout EDM",
    subtitle: "High-BPM adrenaline fuel for intense sessions and running",
    icon: "fa-bolt",
    color: "#eab308",
    tracks: [
      { id: "ytm-1_kZ47Lh60s", ytId: "1_kZ47Lh60s", title: "Titanium", artist: "David Guetta ft. Sia", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 245, genre: "EDM" },
      { id: "ytm-60ItHLz5WEA", ytId: "60ItHLz5WEA", title: "Faded", artist: "Alan Walker", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 212, genre: "Electro" },
      { id: "ytm-YqeW9_5kURI", ytId: "YqeW9_5kURI", title: "Lean On", artist: "Major Lazer & DJ Snake", cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80", duration: 176, genre: "Dance" },
      { id: "ytm-JRfuAukYTKg", ytId: "JRfuAukYTKg", title: "Animals", artist: "Martin Garrix", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 185, genre: "Big Room House" },
      { id: "ytm-kXYiU_JCYtU", ytId: "kXYiU_JCYtU", title: "Numb / Encore", artist: "Linkin Park & Jay-Z", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80", duration: 205, genre: "Rock / Hip-Hop" },
      { id: "ytm-pAgnJDJN4VA", ytId: "pAgnJDJN4VA", title: "Levels", artist: "Avicii", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 220, genre: "EDM" },
      { id: "ytm-IcrbM1l_BoI", ytId: "IcrbM1l_BoI", title: "Wake Me Up", artist: "Avicii", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 247, genre: "Progressive House" },
      { id: "ytm-09R8_2nJtjg", ytId: "09R8_2nJtjg", title: "Sugar", artist: "Maroon 5", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 235, genre: "Pop Funk" }
    ]
  },
  {
    id: "cat-lofi",
    title: "Late Night Lo-Fi & Deep Focus",
    subtitle: "Chilled beats, mellow keys and soothing rhythms to study and unwind",
    icon: "fa-moon",
    color: "#a855f7",
    tracks: [
      { id: "ytm-5qap5aO4i9A", ytId: "5qap5aO4i9A", title: "Lofi Hip Hop Beats", artist: "Lofi Girl", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 180, genre: "Lo-Fi" },
      { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 243, genre: "Synthwave" },
      { id: "ytm-jfKfPfyJRdk", ytId: "jfKfPfyJRdk", title: "Coffee Beats & Rain", artist: "ChilledCow", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 210, genre: "Lo-Fi Chill" },
      { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 212, genre: "Chillwave" },
      { id: "ytm-n61ULEU7CO0", ytId: "n61ULEU7CO0", title: "Warm Nights", artist: "Xori", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 195, genre: "Lo-Fi" },
      { id: "ytm-HDhR2Yhnvfo", ytId: "HDhR2Yhnvfo", title: "Affection", artist: "Jinsang", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 160, genre: "Lo-Fi Beats" }
    ]
  },
  {
    id: "cat-romance",
    title: "Soulful Acoustic & Romantic Hits",
    subtitle: "Heartwarming melodies, acoustic ballads and love anthems",
    icon: "fa-heart",
    color: "#ec4899",
    tracks: [
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 263, genre: "Acoustic Pop" },
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 262, genre: "Bollywood Romance" },
      { id: "ytm-450p7goxZqg", ytId: "450p7goxZqg", title: "All of Me", artist: "John Legend", cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 269, genre: "Soul / R&B" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 201, genre: "Bollywood Romance" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 233, genre: "Bollywood" },
      { id: "ytm-LPn0KStbm9M", ytId: "LPn0KStbm9M", title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 182, genre: "Ballad" },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 200, genre: "Kannada Melody" },
      { id: "ytm-31383g2K6nE", ytId: "31383g2K6nE", title: "Darshana", artist: "Hesham Abdul Wahab", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 224, genre: "Malayalam" }
    ]
  },
  {
    id: "cat-rock",
    title: "Rock Legends & Alternative Anthems",
    subtitle: "Timeless guitar solos, soaring vocals and stadium power chords",
    icon: "fa-guitar",
    color: "#06b6d4",
    tracks: [
      { id: "ytm-fJ9rUzIMcZQ", ytId: "fJ9rUzIMcZQ", title: "Bohemian Rhapsody", artist: "Queen", cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80", duration: 354, genre: "Classic Rock" },
      { id: "ytm-kXYiU_JCYtU", ytId: "kXYiU_JCYtU", title: "In the End", artist: "Linkin Park", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 216, genre: "Alternative Rock" },
      { id: "ytm-hTWKbfoikeg", ytId: "hTWKbfoikeg", title: "Smells Like Teen Spirit", artist: "Nirvana", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 301, genre: "Grunge" },
      { id: "ytm-1w7OgIMMRc4", ytId: "1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 303, genre: "Hard Rock" },
      { id: "ytm-v2AC41dglnM", ytId: "v2AC41dglnM", title: "Thunderstruck", artist: "AC/DC", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 292, genre: "Hard Rock" },
      { id: "ytm-eVTXPUF4Oz4", ytId: "eVTXPUF4Oz4", title: "In the Shadows", artist: "The Rasmus", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 246, genre: "Rock" }
    ]
  },
  {
    id: "cat-party",
    title: "Club Nights & Party Starters",
    subtitle: "High-octane floor fillers, dancehall rhythms and club bangers",
    icon: "fa-champagne-glasses",
    color: "#10b981",
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 267, genre: "Punjabi Urban" },
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80", duration: 230, genre: "Marathi Dance" },
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander", cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 279, genre: "Kollywood Dance" },
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 215, genre: "Tollywood Dance" },
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 229, genre: "Latin Pop" },
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 247, genre: "Gujarati Garba" }
    ]
  }
];

export const LANGUAGE_PLAYLISTS = [
  {
    id: "lang-hindi",
    meta: { title: "Hindi Bollywood Chartbusters", icon: "fa-music", color: "#ff5722", subtitle: "Top trending Bollywood & romantic hits" },
    tracks: [
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 262 },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 198 },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 268 },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 201 },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 233 },
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Satranga", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 271 },
      { id: "ytm-8Vnm_uN_3oA", ytId: "8Vnm_uN_3oA", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 194 },
      { id: "ytm-60ItHLz5WEA", ytId: "60ItHLz5WEA", title: "Pehle Bhi Main", artist: "Vishal Mishra", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 250 }
    ]
  },
  {
    id: "lang-english",
    meta: { title: "Global English Hits & Billboard Top 50", icon: "fa-globe", color: "#3b82f6", subtitle: "Worldwide pop, synth and indie favorites" },
    tracks: [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200 },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd ft. Daft Punk", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 230 },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233 },
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 178 },
      { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 167 },
      { id: "ytm-G7KNmW9a75Y", ytId: "G7KNmW9a75Y", title: "Flowers", artist: "Miley Cyrus", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 199 },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 263 },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 231 }
    ]
  },
  {
    id: "lang-punjabi",
    meta: { title: "Punjabi Urban & Chartbusters", icon: "fa-bolt", color: "#14b8a6", subtitle: "Heavy bass, folk vibes and viral hip-hop" },
    tracks: [
      { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon, Gurinder Gill", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 267 },
      { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 176 },
      { id: "ytm-Z9e7kHnN6wE", ytId: "Z9e7kHnN6wE", title: "Elevated", artist: "Shubh", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 201 },
      { id: "ytm-N2-0GqH3wM0", ytId: "N2-0GqH3wM0", title: "We Rollin", artist: "Shubh", coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 199 },
      { id: "ytm-Zf8q6N4I4Gk", ytId: "Zf8q6N4I4Gk", title: "No Love", artist: "Shubh", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 181 },
      { id: "ytm-cl0a3i2wFcc", ytId: "cl0a3i2wFcc", title: "295", artist: "Sidhu Moose Wala", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80", duration: 270 },
      { id: "ytm-eZ2_6LgB93k", ytId: "eZ2_6LgB93k", title: "With You", artist: "AP Dhillon", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 154 }
    ]
  },
  {
    id: "lang-kannada",
    meta: { title: "Kannada Sandalwood Sensations", icon: "fa-crown", color: "#8b5cf6", subtitle: "Chartbusters from KGF, Kantara and melodies" },
    tracks: [
      { id: "ytm-d1qgL-Hmsf0", ytId: "d1qgL-Hmsf0", title: "Singara Siriye", artist: "Vijay Prakash, Ananya Bhat", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 284 },
      { id: "ytm-e1L1Rydm25c", ytId: "e1L1Rydm25c", title: "Ra Ra Rakkamma", artist: "Nakash Aziz, Sunidhi Chauhan", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 215 },
      { id: "ytm-Yx5V6l9Q-G8", ytId: "Yx5V6l9Q-G8", title: "Neene Neene", artist: "Armaan Malik", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 200 },
      { id: "ytm-h2H7s8hL4O8", ytId: "h2H7s8hL4O8", title: "Belageddu", artist: "Vijay Prakash", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 211 },
      { id: "ytm-hM9mH_O9kYk", ytId: "hM9mH_O9kYk", title: "Munjaane Manju", artist: "Raghu Dixit", coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 250 },
      { id: "ytm-j1_069X72mU", ytId: "j1_069X72mU", title: "Toofan (KGF 2)", artist: "Brijesh Shandilya", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80", duration: 218 }
    ]
  },
  {
    id: "lang-tamil",
    meta: { title: "Tamil Kollywood Chartbusters", icon: "fa-star", color: "#f43f5e", subtitle: "High energy tracks by Anirudh, AR Rahman & Dhee" },
    tracks: [
      { id: "ytm-x6Q7c9RyMzk", ytId: "x6Q7c9RyMzk", title: "Rowdy Baby", artist: "Dhanush, Dhee", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 284 },
      { id: "ytm-eYq7WapuDLU", ytId: "eYq7WapuDLU", title: "Enjoy Enjaami", artist: "Dhee, Arivu", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 298 },
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander, Jonita Gandhi", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 279 },
      { id: "ytm-rN1fS03JvV8", ytId: "rN1fS03JvV8", title: "Naa Ready", artist: "Thalapathy Vijay, Anirudh", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 248 },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 230 },
      { id: "ytm-1b4ZpP_g1g8", ytId: "1b4ZpP_g1g8", title: "Hukum (Jailer)", artist: "Anirudh Ravichander", coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop&q=80", duration: 207 }
    ]
  },
  {
    id: "lang-telugu",
    meta: { title: "Telugu Tollywood Blockbusters", icon: "fa-film", color: "#06b6d4", subtitle: "Viral beats from RRR, Pushpa & Sid Sriram melodies" },
    tracks: [
      { id: "ytm-OsU0CGZoV8E", ytId: "OsU0CGZoV8E", title: "Naatu Naatu", artist: "Rahul Sipligunj, Kaala Bhairava", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 215 },
      { id: "ytm-P2uM8E1c-1k", ytId: "P2uM8E1c-1k", title: "Samajavaragamana", artist: "Sid Sriram", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 224 },
      { id: "ytm-hcMzwMrr1tE", ytId: "hcMzwMrr1tE", title: "Srivalli", artist: "Sid Sriram", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 221 },
      { id: "ytm-61X-N712DqY", ytId: "61X-N712DqY", title: "Oo Antava Mava", artist: "Indravathi Chauhan", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 223 },
      { id: "ytm-2mDCVzruVgQ", ytId: "2mDCVzruVgQ", title: "Butta Bomma", artist: "Armaan Malik", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 198 },
      { id: "ytm-W_12qM1F5gA", ytId: "W_12qM1F5gA", title: "Ramuloo Ramulaa", artist: "Anurag Kulkarni", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 250 }
    ]
  },
  {
    id: "lang-marathi",
    meta: { title: "Marathi Blockbusters", icon: "fa-drum", color: "#eab308", subtitle: "Ajay-Atul classics and modern Marathi pop" },
    tracks: [
      { id: "ytm-99e_0_Z-Bw0", ytId: "99e_0_Z-Bw0", title: "Zingaat", artist: "Ajay-Atul", coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80", duration: 230 },
      { id: "ytm-p8gq4I26q7k", ytId: "p8gq4I26q7k", title: "Apsara Aali", artist: "Bela Shende", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 245 },
      { id: "ytm-mI60DtyDpsk", ytId: "mI60DtyDpsk", title: "Bring It On", artist: "Ajay-Atul", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 211 },
      { id: "ytm-n-k4iC1F2E0", ytId: "n-k4iC1F2E0", title: "Yad Lagla", artist: "Ajay Gogavale", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 301 },
      { id: "ytm-Oq8j5Qz9Q6U", ytId: "Oq8j5Qz9Q6U", title: "Sairat Zaala Ji", artist: "Chinmayi Sripaada", coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 366 }
    ]
  },
  {
    id: "lang-gujarati",
    meta: { title: "Gujarati Garba & Folk Hits", icon: "fa-gopuram", color: "#f59e0b", subtitle: "Navratri anthems, viral folk and Darshan Raval" },
    tracks: [
      { id: "ytm-d4OsvFi6mms", ytId: "d4OsvFi6mms", title: "Chogada", artist: "Darshan Raval", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 247 },
      { id: "ytm-QdXVhEiaY9c", ytId: "QdXVhEiaY9c", title: "Kamariya", artist: "Darshan Raval", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 260 },
      { id: "ytm-Q28K4vDtd4Y", ytId: "Q28K4vDtd4Y", title: "Dholida", artist: "Neha Kakkar", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 180 },
      { id: "ytm-1_M0i09nK5M", ytId: "1_M0i09nK5M", title: "Gori Radha Ne Kalo Kaan", artist: "Kirtidan Gadhvi", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 320 },
      { id: "ytm-uY0Qe6wA0hA", ytId: "uY0Qe6wA0hA", title: "Radha Ne Shyam Mali Jaahe", artist: "Sachin-Jigar", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 280 }
    ]
  },
  {
    id: "lang-spanish",
    meta: { title: "Latin & Reggaeton Fiesta", icon: "fa-pepper-hot", color: "#ef4444", subtitle: "Global Latin party bangers and reggaeton" },
    tracks: [
      { id: "ytm-kJQP7kiw5Fk", ytId: "kJQP7kiw5Fk", title: "Despacito", artist: "Luis Fonsi ft. Daddy Yankee", coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 229 },
      { id: "ytm-7zp1TbIG4fM", ytId: "7zp1TbIG4fM", title: "Danza Kuduro", artist: "Don Omar", coverUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80", duration: 199 },
      { id: "ytm-TmKhEnGlfG0", ytId: "TmKhEnGlfG0", title: "Dakiti", artist: "Bad Bunny, Jhay Cortez", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 205 },
      { id: "ytm-tbneQDc2H3I", ytId: "tbneQDc2H3I", title: "Tusa", artist: "KAROL G, Nicki Minaj", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 200 },
      { id: "ytm-NUsoVlDFqZg", ytId: "NUsoVlDFqZg", title: "Bailando", artist: "Enrique Iglesias", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 243 }
    ]
  },
  {
    id: "lang-kpop",
    meta: { title: "K-Pop Global Wave", icon: "fa-compact-disc", color: "#ec4899", subtitle: "BTS, BLACKPINK, NewJeans and FIFTY FIFTY" },
    tracks: [
      { id: "ytm-gdZLi9oWNZg", ytId: "gdZLi9oWNZg", title: "Dynamite", artist: "BTS", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 199 },
      { id: "ytm-WMweEpGlu_U", ytId: "WMweEpGlu_U", title: "Butter", artist: "BTS", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 164 },
      { id: "ytm-ioNng23DkIM", ytId: "ioNng23DkIM", title: "How You Like That", artist: "BLACKPINK", coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 181 },
      { id: "ytm-Qc7_zRjH808", ytId: "Qc7_zRjH808", title: "Cupid (Twin Ver.)", artist: "FIFTY FIFTY", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 174 },
      { id: "ytm-QU9c0053UAU", ytId: "QU9c0053UAU", title: "Seven", artist: "Jung Kook ft. Latto", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 184 }
    ]
  }
];

export const getQuickPicks = (limit = 6) => {
  return [
    { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200 },
    { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 262 },
    { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233 },
    { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 230 },
    { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 267 },
    { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 268 }
  ].slice(0, limit);
};

export const getFeaturedArtists = () => {
  return [
    { name: "Arijit Singh", genre: "Bollywood / Soul", avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80" },
    { name: "The Weeknd", genre: "Pop / R&B", avatar: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80" },
    { name: "Ed Sheeran", genre: "Pop / Acoustic", avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80" },
    { name: "Taylor Swift", genre: "Pop / Country", avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80" },
    { name: "Anirudh Ravichander", genre: "Kollywood / Electronic", avatar: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80" },
    { name: "AP Dhillon", genre: "Punjabi / Urban", avatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80" },
    { name: "Dua Lipa", genre: "Dance Pop", avatar: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80" },
    { name: "Bad Bunny", genre: "Latin / Reggaeton", avatar: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80" }
  ];
};

export const getCuratedPlaylists = () => {
  return [
    {
      id: "pl-daily-mix-1",
      title: "Daily Mix 1: Pure Synth & Pop",
      description: "The Weeknd, Ed Sheeran, Harry Styles and Miley Cyrus",
      coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
      trackCount: 15,
      tracks: [
        { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200 },
        { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 230 },
        { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233 },
        { id: "ytm-H5v3kku4y6Q", ytId: "H5v3kku4y6Q", title: "As It Was", artist: "Harry Styles", coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80", duration: 167 }
      ]
    },
    {
      id: "pl-bollywood-heart",
      title: "Bollywood Love Stories",
      description: "The deepest romantic anthems by Arijit Singh & Shreya Ghoshal",
      coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80",
      trackCount: 20,
      tracks: [
        { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 262 },
        { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 198 },
        { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 268 },
        { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 201 }
      ]
    },
    {
      id: "pl-punjabi-hype",
      title: "Punjabi Hype & Urban Drill",
      description: "AP Dhillon, Shubh, Sidhu Moose Wala and Gurinder Gill",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      trackCount: 18,
      tracks: [
        { id: "ytm-VNs_cCtdbPc", ytId: "VNs_cCtdbPc", title: "Brown Munde", artist: "AP Dhillon", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 267 },
        { id: "ytm-vX2cDW8LUWk", ytId: "vX2cDW8LUWk", title: "Excuses", artist: "AP Dhillon", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 176 },
        { id: "ytm-Z9e7kHnN6wE", ytId: "Z9e7kHnN6wE", title: "Elevated", artist: "Shubh", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 201 }
      ]
    },
    {
      id: "pl-lofi-late-night",
      title: "Late Night Chill & Relax",
      description: "Low-fidelity aesthetic beats for deep meditation and dreaming",
      coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80",
      trackCount: 25,
      tracks: [
        { id: "ytm-DWcJFNfaw90", ytId: "DWcJFNfaw90", title: "Midnight City", artist: "M83", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 243 },
        { id: "ytm-rR4n-0KYeKQ", ytId: "rR4n-0KYeKQ", title: "Resonance", artist: "HOME", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 212 }
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
      { id: "ytm-Umqb9KENgmk", ytId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 262, plays: "1,450,000,000" },
      { id: "ytm-VAdGW7QDJiU", ytId: "VAdGW7QDJiU", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 198, plays: "820,000,000" },
      { id: "ytm-BddP6PYo2gs", ytId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 268, plays: "980,000,000" },
      { id: "ytm-ElZfdU54Cp8", ytId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80", duration: 201, plays: "640,000,000" },
      { id: "ytm-5mqFmNl11-M", ytId: "5mqFmNl11-M", title: "O Maahi", artist: "Arijit Singh", coverUrl: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80", duration: 233, plays: "520,000,000" }
    ];
  } else if (normalized.includes('weeknd')) {
    monthlyListeners = "112,000,000";
    worldRank = "#1 Globally";
    banner = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80";
    bio = "The Weeknd (Abel Tesfaye) is a Canadian singer, songwriter, and record producer known for his sonic versatility and dark lyricism.";
    tracks = [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200, plays: "4,100,000,000" },
      { id: "ytm-34Na4j8HLws", ytId: "34Na4j8HLws", title: "Starboy", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80", duration: 230, plays: "3,200,000,000" },
      { id: "ytm-fHI8X48Y36I", ytId: "fHI8X48Y36I", title: "The Hills", artist: "The Weeknd", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 242, plays: "2,500,000,000" }
    ];
  } else if (normalized.includes('sheeran')) {
    monthlyListeners = "84,000,000";
    worldRank = "#6 Globally";
    banner = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80";
    bio = "Ed Sheeran is an English singer-songwriter who has sold more than 150 million records worldwide, making him one of the best-selling artists.";
    tracks = [
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233, plays: "3,800,000,000" },
      { id: "ytm-2Vv-BfVoq4g", ytId: "2Vv-BfVoq4g", title: "Perfect", artist: "Ed Sheeran", coverUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80", duration: 263, plays: "3,100,000,000" }
    ];
  } else if (normalized.includes('taylor')) {
    monthlyListeners = "105,000,000";
    worldRank = "#2 Globally";
    banner = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80";
    bio = "Taylor Swift is an American singer-songwriter whose discography spans multiple genres and has broken records across modern music history.";
    tracks = [
      { id: "ytm-ic8j13piAhQ", ytId: "ic8j13piAhQ", title: "Cruel Summer", artist: "Taylor Swift", coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80", duration: 178, plays: "2,200,000,000" },
      { id: "ytm-e-ORhEE9VVg", ytId: "e-ORhEE9VVg", title: "Blank Space", artist: "Taylor Swift", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 231, plays: "1,900,000,000" }
    ];
  } else if (normalized.includes('anirudh')) {
    monthlyListeners = "28,000,000";
    worldRank = "#1 in South India";
    banner = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&auto=format&fit=crop&q=80";
    bio = "Anirudh Ravichander is an Indian music composer and singer who works predominantly in Tamil cinema with worldwide viral chartbusters.";
    tracks = [
      { id: "ytm-KqNX2xW1Icw", ytId: "KqNX2xW1Icw", title: "Arabic Kuthu", artist: "Anirudh Ravichander", coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80", duration: 279, plays: "750,000,000" },
      { id: "ytm-fRD_3vJagOU", ytId: "fRD_3vJagOU", title: "Vaathi Coming", artist: "Anirudh Ravichander", coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 230, plays: "620,000,000" }
    ];
  } else {
    tracks = [
      { id: "ytm-4NRXx6U8ABQ", ytId: "4NRXx6U8ABQ", title: "Blinding Lights", artist: artistName, coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80", duration: 200, plays: "1,200,000" },
      { id: "ytm-JGwWNGJdvx8", ytId: "JGwWNGJdvx8", title: "Shape of You", artist: artistName, coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80", duration: 233, plays: "980,000" }
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
      { name: "Arijit Singh", role: "Playback Legend", avatar: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80" },
      { name: "Ed Sheeran", role: "Singer-Songwriter", avatar: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80" },
      { name: "The Weeknd", role: "Pop Icon", avatar: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80" }
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
