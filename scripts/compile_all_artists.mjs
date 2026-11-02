import fs from 'fs';
import { createArtist } from './mega_artists_data.mjs';

// We import the current ARTIST_DATABASE from catalogService.js to preserve existing 22 artists
import { ARTIST_DATABASE as EXISTING_DB } from '../src/catalogService.js';

const NEW_ARTISTS = {};

// 1. Shreya Ghoshal
NEW_ARTISTS['shreya-ghoshal'] = createArtist({
  name: "Shreya Ghoshal",
  listeners: "38,400,000",
  followersCount: "32,100,000",
  rank: "#1 Female Playback Icon in India",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bf/fb/14/bffb1456-42bb-d86b-722a-283181829cb8/8902894357739_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bf/fb/14/bffb1456-42bb-d86b-722a-283181829cb8/8902894357739_cover.jpg/1000x1000bb.jpg",
  bio: "Shreya Ghoshal is universally acclaimed as the Queen of Melody in contemporary Indian music. Winner of five National Film Awards, four Kerala State Film Awards, and seven Filmfare Awards, her ethereal vocal range spans classical, ghazals, Bollywood romantic ballads, and regional masterpieces across over 20 languages. From her historic debut in Devdas at age 16 to global stadium tours, her voice remains the gold standard of Indian melody.",
  instagram: "shreyaghoshal",
  x: "shreyaghoshal",
  facebook: "shreyaghoshal",
  youtube: "shreyaghoshal",
  tourName: "Shreya Ghoshal All Hearts Tour 2026",
  tourDates: "Mumbai, Delhi, London, Dubai, Toronto, San Jose",
  topTracks: [
    { title: "Sunn Raha Hai", album: "Aashiqui 2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bb/23/ee/bb23eeed-0c35-4f1d-2b11-485622777ae4/8902894353007_cover.jpg/1000x1000bb.jpg", ytId: "inEu2qQuGZ8", duration: 390 },
    { title: "Deewani Mastani", album: "Bajirao Mastani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/bf/fb/14/bffb1456-42bb-d86b-722a-283181829cb8/8902894357739_cover.jpg/1000x1000bb.jpg", ytId: "zRtPUIumXCY", duration: 340 },
    { title: "Teri Ore", album: "Singh Is Kinng", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "V_90B_tV6hI", duration: 339 },
    { title: "Ghoomar", album: "Padmaavat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "6cKErCWrb44", duration: 282 },
    { title: "Agar Tum Mil Jao", album: "Zeher", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/dc/4b/aa/dc4baa30-d326-8c65-2766-3dca376174bb/8902894623094_cover.jpg/1000x1000bb.jpg", ytId: "6jO_iX3Uf1g", duration: 358 },
    { title: "Manwa Laage", album: "Happy New Year", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/28/fc/21/28fc2142-b9b6-9bb8-4fc7-bce4cce2763f/8902894356497_cover.jpg/1000x1000bb.jpg", ytId: "d8IT-163M8U", duration: 271 },
    { title: "Barso Re", album: "Guru", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "72UVTUx551E", duration: 329 },
    { title: "Chikni Chameli", album: "Agneepath", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/71/84/e8/7184e8b0-a544-d890-5807-6ba8a91da58c/886443301054.jpg/1000x1000bb.jpg", ytId: "MQM7CNoAsBI", duration: 303 },
    { title: "Saibo", album: "Shor in the City", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e5/bd/2b/e5bd2bb0-8be2-32b7-a36c-94119853fa77/8902894623193_cover.jpg/1000x1000bb.jpg", ytId: "yWJy_mS9b-I", duration: 196 },
    { title: "Param Sundari", album: "Mimi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "nfnc0_hZne8", duration: 200 }
  ]
});

// 2. Sonu Nigam
NEW_ARTISTS['sonu-nigam'] = createArtist({
  name: "Sonu Nigam",
  listeners: "31,800,000",
  followersCount: "26,500,000",
  rank: "#1 Legendary Playback Singer",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4c/16/13/4c161318-5bf1-ea55-774d-2f55e2361d10/8902894623179_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4c/16/13/4c161318-5bf1-ea55-774d-2f55e2361d10/8902894623179_cover.jpg/1000x1000bb.jpg",
  bio: "Sonu Nigam is celebrated as the 'Lord of Chords' and one of the greatest playback vocalists in Indian musical history. Honored with the Padma Shri, National Film Award, and multiple Filmfare trophies, his pristine pitch, unmatched classical versatility, and emotional resonance have shaped the golden era of 90s and 2000s Bollywood. From timeless ghazals to unforgettable cinema anthems, his voice remains immortal.",
  instagram: "sonunigamofficial",
  x: "sonunigam",
  facebook: "SonuNigamSpace",
  youtube: "sonunigam",
  tourName: "Sonu Nigam The Symphony Tour 2026",
  tourDates: "London, Dubai, Sydney, New York, Mumbai, Delhi",
  topTracks: [
    { title: "Kal Ho Naa Ho", album: "Kal Ho Naa Ho", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/4c/16/13/4c161318-5bf1-ea55-774d-2f55e2361d10/8902894623179_cover.jpg/1000x1000bb.jpg", ytId: "g0eO74UmRBs", duration: 321 },
    { title: "Abhi Mujh Mein Kahin", album: "Agneepath", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/71/84/e8/7184e8b0-a544-d890-5807-6ba8a91da58c/886443301054.jpg/1000x1000bb.jpg", ytId: "oWKgpB2zpgw", duration: 364 },
    { title: "Main Agar Kahoon", album: "Om Shanti Om", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/21/df/b8/21dfb858-a894-3ee1-f9b9-c6e73ec8b9ba/8902894623126_cover.jpg/1000x1000bb.jpg", ytId: "DAYszemgPxc", duration: 310 },
    { title: "Suraj Hua Maddham", album: "Kabhi Khushi Kabhie Gham", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/91/97/eb/9197eb20-e4b2-299d-83b6-200922849e79/886443290655.jpg/1000x1000bb.jpg", ytId: "L0zKdWZtgZg", duration: 428 },
    { title: "Tumse Milke Dil Ka", album: "Main Hoon Na", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "mXkbWKr5CII", duration: 362 },
    { title: "Sandese Aate Hain", album: "Border", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "B_49H4qZz-0", duration: 620 },
    { title: "Saathiya", album: "Saathiya", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "f4o9f8G6yXg", duration: 357 },
    { title: "Dil Dooba", album: "Khakee", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/5a/09/25/5a092524-118e-4a4a-0a7b-3dca592cfdf3/8902894623101_cover.jpg/1000x1000bb.jpg", ytId: "T7wNnC8R00I", duration: 230 },
    { title: "Tanhayee", album: "Dil Chahta Hai", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "yH8yJ9rD8y8", duration: 370 },
    { title: "Soniyo", album: "Raaz: The Mystery Continues", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/dc/4b/aa/dc4baa30-d326-8c65-2766-3dca376174bb/8902894623094_cover.jpg/1000x1000bb.jpg", ytId: "Qp4C_4kL-r8", duration: 329 }
  ]
});

// 3. KK (Krishnakumar Kunnath)
NEW_ARTISTS['kk'] = createArtist({
  name: "KK",
  listeners: "28,900,000",
  followersCount: "22,400,000",
  rank: "#1 Nostalgia & Rock Icon",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg",
  bio: "Krishnakumar Kunnath, affectionately known as KK, was the defining voice of love, heartbreak, and youthful nostalgia for an entire generation. With raw vocal power, crystal-clear emotional delivery, and a complete absence of formal classical training, KK created everlasting anthems like 'Pal' and 'Yaaron' that became the soundtrack of millions of lives.",
  instagram: "kk_live_now",
  x: "kksings",
  facebook: "KKSingsOfficial",
  youtube: "KKMemorialOfficial",
  tourName: "KK Forever - Tribute Symphony",
  tourDates: "Worldwide Celebration of KK's Musical Legacy",
  topTracks: [
    { title: "Yaaron", album: "Pal", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "ZgIeBq14F30", duration: 279 },
    { title: "Pal", album: "Pal", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "y_S_K0m8o-s", duration: 260 },
    { title: "Zara Sa", album: "Jannat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/e9/a3/cf/e9a3cf5e-09c3-3d6b-3bf2-c609475b6543/888880551801.jpg/1000x1000bb.jpg", ytId: "5ioX4Oomqoc", duration: 303 },
    { title: "Labon Ko", album: "Bhool Bhulaiyaa", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 343 },
    { title: "Kya Mujhe Pyar Hai", album: "Woh Lamhe", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "mX4Z74c-4xI", duration: 273 },
    { title: "Aankhon Mein Teri", album: "Om Shanti Om", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/21/df/b8/21dfb858-a894-3ee1-f9b9-c6e73ec8b9ba/8902894623126_cover.jpg/1000x1000bb.jpg", ytId: "bdbeNfMm0rM", duration: 242 },
    { title: "Tu Hi Meri Shab Hai", album: "Gangster", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/dc/4b/aa/dc4baa30-d326-8c65-2766-3dca376174bb/8902894623094_cover.jpg/1000x1000bb.jpg", ytId: "7L_L5wT6j-U", duration: 388 },
    { title: "Dil Ibadat", album: "Tum Mile", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 329 },
    { title: "Alvida", album: "Life in a... Metro", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "5d0rUe8T-20", duration: 339 },
    { title: "Zindagi Do Pal Ki", album: "Kites", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "fO_p3_r8jX4", duration: 254 }
  ]
});

// 4. Sid Sriram
NEW_ARTISTS['sid-sriram'] = createArtist({
  name: "Sid Sriram",
  listeners: "24,500,000",
  followersCount: "17,800,000",
  rank: "#1 Carnatic & Indie Soul",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg",
  bio: "Sid Sriram is an Indian-American vocalist, songwriter, and producer who pioneered the bridge between traditional South Indian Carnatic music and contemporary American soul and R&B. Trained under legendary musicians and championed by A.R. Rahman, his revolutionary vocal stylings have broken records across Tamil, Telugu, Kannada, Malayalam, and Hindi cinema.",
  instagram: "sidsriram",
  x: "sidsriram",
  facebook: "sidsrirammusic",
  youtube: "sidsriram",
  tourName: "Sid Sriram Boundless Tour 2026",
  tourDates: "Chennai, Bengaluru, Hyderabad, San Francisco, London",
  topTracks: [
    { title: "Srivalli", album: "Pushpa: The Rise", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e0/75/a3/e075a3d7-4001-c88c-eec4-d0ae38d017b2/8902894362870_cover.jpg/1000x1000bb.jpg", ytId: "hcMzwMrr1tE", duration: 224 },
    { title: "Inkem Inkem", album: "Geetha Govindam", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "8j_T_P3E0gY", duration: 268 },
    { title: "Adiga Adiga", album: "Ninnu Kori", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "f0-jC_w8T3U", duration: 236 },
    { title: "Samajavaragamana", album: "Ala Vaikunthapurramuloo", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "pe3G_8qS_9c", duration: 222 },
    { title: "Ennodu Nee Irundhaal", album: "I", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "r8sL9-p0F1Y", duration: 350 },
    { title: "Kannaana Kanney", album: "Viswasam", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "kL_M-wL6X5c", duration: 269 },
    { title: "Maruvaarthai", album: "Enai Noki Paayum Thota", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "yO_J7vR9Z6c", duration: 350 },
    { title: "Vachindamma", album: "Geetha Govindam", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "eX0gV5m9Qp4", duration: 242 },
    { title: "Thalli Pogathey", album: "Achcham Yenbadhu Madamaiyada", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "IAns4kFshB8", duration: 270 },
    { title: "Urike Urike", album: "Hit 2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7e/38/30/7e3830a6-5776-6ffc-5290-77a834e022f6/8902894358897_cover.jpg/1000x1000bb.jpg", ytId: "t1Z-P8x7vU4", duration: 236 }
  ]
});

// 5. Sidhu Moosewala
NEW_ARTISTS['sidhu-moosewala'] = createArtist({
  name: "Sidhu Moosewala",
  listeners: "34,200,000",
  followersCount: "28,700,000",
  rank: "#1 Global Punjabi Hip-Hop Legend",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg",
  bio: "Shubhdeep Singh Sidhu, known worldwide as Sidhu Moosewala, was an iconoclastic Punjabi singer, lyricist, and cultural powerhouse who transformed Punjabi music on the world stage. Blending fearless rural folk idioms with explosive West Coast hip-hop beats, he broke onto Billboard Global 200 and UK charts, becoming the voice of defiance, honor, and grassroots pride for millions across the diaspora.",
  instagram: "sidhu_moosewala",
  x: "iSidhuMooseWala",
  facebook: "SidhuMooseWalaOfficial",
  youtube: "SidhuMooseWalaOfficial",
  tourName: "Sidhu Moosewala Immortal Legacy Tour",
  tourDates: "Worldwide Celebration of Punjabi Hip-Hop",
  topTracks: [
    { title: "295", album: "Moosetape", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "n_FCrCQ6-9U", duration: 270 },
    { title: "The Last Ride", album: "No Name", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "6xN44Jq4W9g", duration: 254 },
    { title: "So High", album: "PBX 1", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "Gg8_N5Z4W-8", duration: 236 },
    { title: "Same Beef", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "f0KqX9m6VwI", duration: 276 },
    { title: "Old Skool", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "y1T8q_sL0-0", duration: 254 },
    { title: "Levels", album: "No Name", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "w_R8e_xY7t4", duration: 232 },
    { title: "Bambiha Bole", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "m1Y8d_gK9-w", duration: 300 },
    { title: "Famous", album: "PBX 1", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "x0N3e-cR1y8", duration: 247 },
    { title: "Dollar", album: "Dakuaan Da Munda", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "uK8_v7vL4Z8", duration: 202 },
    { title: "Tibeyan Da Putt", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/ca/84/f0/ca84f00b-6060-63c3-e290-0081d4a0ea8d/196589083818.jpg/1000x1000bb.jpg", ytId: "t2C7s0_qL1E", duration: 312 }
  ]
});

// 6. Karan Aujla
NEW_ARTISTS['karan-aujla'] = createArtist({
  name: "Karan Aujla",
  listeners: "31,400,000",
  followersCount: "21,600,000",
  rank: "#2 in Punjabi Global Hits",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg",
  bio: "Jaskaran Singh Aujla, known universally as Karan Aujla ('Geetan Di Machine'), is a Canadian-based Indian singer, rapper, and songwriter at the pinnacle of modern Punjabi music. Renowned for hyper-creative rhyme schemes, infectious hooks, and mega-hits like 'Tauba Tauba', 'Softly', and 'Winning Speech', Aujla made history by winning the Juno Fan Choice Award and dominating Billboard Canadian Albums.",
  instagram: "karanaujla_official",
  x: "GeetanDiMachine",
  facebook: "KaranAujlaOfficial",
  youtube: "KaranAujlaOfficial",
  tourName: "Karan Aujla It Was All A Dream Tour",
  tourDates: "Toronto, Vancouver, London, Chandigarh, Delhi, Mumbai",
  topTracks: [
    { title: "Tauba Tauba", album: "Bad Newz", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/4b/3c/6e/4b3c6e94-39f2-2bf2-2287-3d1f3088b284/8902894364409_cover.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 206 },
    { title: "Softly", album: "Making Memories", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "cWMxCE2HTag", duration: 156 },
    { title: "Winning Speech", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "fn382fN5F1g", duration: 221 },
    { title: "Admirin' You", album: "Making Memories", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 215 },
    { title: "White Brown Black", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "k_O3rW4t2uY", duration: 178 },
    { title: "Chithiyaan", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "y1W8-x7q5Xg", duration: 254 },
    { title: "52 Bars", album: "Four You", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "4Z_mP0k-1sI", duration: 211 },
    { title: "On Top", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "6rD8f_zM2-4", duration: 188 },
    { title: "Don't Look", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "t8X7e_qL3kM", duration: 204 },
    { title: "Mexico", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/eb/3a/02/eb3a0279-b1d5-e51c-ef53-90d1bf3a5f78/5054197779032.jpg/1000x1000bb.jpg", ytId: "m1K7t_xR9uY", duration: 226 }
  ]
});

// 7. Drake
NEW_ARTISTS['drake'] = createArtist({
  name: "Drake",
  listeners: "86,200,000",
  followersCount: "92,500,000",
  rank: "#3 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg",
  bio: "Aubrey Drake Graham is a Canadian rapper, singer, and songwriter credited with popularizing singing and R&B sensibilities in modern hip-hop. Winner of five Grammy Awards and holder of unprecedented Billboard records—including the most charted songs, most top 10 hits, and the most weeks on the Hot 100—Drake has stood at the epicenter of global pop culture for over fifteen consecutive years.",
  instagram: "champagnepapi",
  x: "drake",
  facebook: "Drake",
  youtube: "DrakeOfficial",
  tourName: "It's All A Blur World Tour",
  tourDates: "Toronto, Los Angeles, New York, London, Paris",
  topTracks: [
    { title: "God's Plan", album: "Scorpion", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "xpVfcZ0ZcFM", duration: 198 },
    { title: "One Dance", album: "Views", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "qL7zrWcv6XY", duration: 173 },
    { title: "Hotline Bling", album: "Views", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "uxpDa-c-4Mc", duration: 267 },
    { title: "In My Feelings", album: "Scorpion", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "DRS_PpOrUZ4", duration: 217 },
    { title: "Rich Flex", album: "Her Loss", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "78p_k_X0Z7E", duration: 239 },
    { title: "Passionfruit", album: "More Life", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "COz9lDCFHjw", duration: 298 },
    { title: "Hold On, We're Going Home", album: "Nothing Was the Same", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "GxgqpCdOKak", duration: 227 },
    { title: "Nonstop", album: "Scorpion", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "XwmrkM_0FvA", duration: 238 },
    { title: "First Person Shooter", album: "For All The Dogs", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "Xty2gi5cMa8", duration: 247 },
    { title: "Laugh Now Cry Later", album: "Certified Lover Boy", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/0d/17/28/0d172828-0955-44f3-a442-901e8c75ff74/21UMGIM52358.rgb.jpg/1000x1000bb.jpg", ytId: "JFm7YDVlqnI", duration: 261 }
  ]
});

// 8. Kendrick Lamar
NEW_ARTISTS['kendrick-lamar'] = createArtist({
  name: "Kendrick Lamar",
  listeners: "68,900,000",
  followersCount: "35,400,000",
  rank: "#1 Hip-Hop Visionary",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg",
  bio: "Kendrick Lamar Duckworth is widely regarded as one of the most influential and technically gifted hip-hop artists in musical history. The only non-classical, non-jazz musician to win the Pulitzer Prize for Music, Lamar has claimed 17 Grammy Awards and widespread cultural reverence for groundbreaking conceptual albums like good kid, m.A.A.d city, To Pimp a Butterfly, and DAMN.",
  instagram: "kendricklamar",
  x: "kendricklamar",
  facebook: "kendricklamar",
  youtube: "KendrickLamarVEVO",
  tourName: "The Big Steppers World Tour",
  tourDates: "Los Angeles, London, Paris, Tokyo, Sydney",
  topTracks: [
    { title: "Not Like Us", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/91/9f/bd/919fbd1a-a128-6411-cfdc-8f430635caeb/24UM1IM41857.rgb.jpg/1000x1000bb.jpg", ytId: "H58vbez_m4E", duration: 274 },
    { title: "HUMBLE.", album: "DAMN.", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "tvTRZJ-4EyI", duration: 177 },
    { title: "All The Stars", album: "Black Panther", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "JQbjS0_ZfJ0", duration: 232 },
    { title: "Money Trees", album: "good kid, m.A.A.d city", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "smqhSl0u_WQ", duration: 386 },
    { title: "Swimming Pools (Drank)", album: "good kid, m.A.A.d city", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "B5YNiCfWC3A", duration: 247 },
    { title: "DNA.", album: "DAMN.", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "NLZRYQMLDW4", duration: 185 },
    { title: "Alright", album: "To Pimp a Butterfly", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "Z-48u_uWMHY", duration: 212 },
    { title: "LOVE.", album: "DAMN.", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "ox7RsX1VD34", duration: 213 },
    { title: "King Kunta", album: "To Pimp a Butterfly", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "hRK7PV4FReE", duration: 234 },
    { title: "Bitch, Don't Kill My Vibe", album: "good kid, m.A.A.d city", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/bc/d0/ea/bcd0ea01-38ee-a63d-4c31-7b00344d5641/22UMGIM41829.rgb.jpg/1000x1000bb.jpg", ytId: "GF8aaTu2kg0", duration: 310 }
  ]
});

// 9. Post Malone
NEW_ARTISTS['post-malone'] = createArtist({
  name: "Post Malone",
  listeners: "81,200,000",
  followersCount: "44,600,000",
  rank: "#4 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg",
  bio: "Austin Richard Post, known professionally as Post Malone, is an American singer, rapper, and songwriter celebrated for blending genres across hip-hop, pop, country, and grunge rock. With eight RIAA Diamond-certified singles and billions of streams on Spotify, he holds the record for the most diamond certifications in recording history.",
  instagram: "postmalone",
  x: "postmalone",
  facebook: "postmalone",
  youtube: "PostMalone",
  tourName: "F-1 Trillion World Tour 2026",
  tourDates: "Dallas, Nashville, New York, London, Tokyo",
  topTracks: [
    { title: "Sunflower", album: "Spider-Man: Into the Spider-Verse", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "ApXoWvfEYVU", duration: 158 },
    { title: "Circles", album: "Hollywood's Bleeding", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "wXhTHyIgQ_U", duration: 215 },
    { title: "rockstar", album: "beerbongs & bentleys", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "UceaB4D0jpo", duration: 218 },
    { title: "Congratulations", album: "Stoney", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "SC4xZwuaCjo", duration: 220 },
    { title: "I Had Some Help", album: "F-1 Trillion", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "o5V3m9QoV-0", duration: 178 },
    { title: "Better Now", album: "beerbongs & bentleys", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "UYwF-jdcVjY", duration: 231 },
    { title: "White Iverson", album: "Stoney", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "slit4e3k8vI", duration: 256 },
    { title: "Chemical", album: "AUSTIN", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "Da4vN5c8T3E", duration: 184 },
    { title: "Goodbyes", album: "Hollywood's Bleeding", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "ba7mB8TupXk", duration: 175 },
    { title: "Psycho", album: "beerbongs & bentleys", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/28/7f/05/287f05eb-62a2-3f5f-00eb-14b35e076632/23UM1IM11060.rgb.jpg/1000x1000bb.jpg", ytId: "inW3m1F8f7U", duration: 237 }
  ]
});

// 10. Justin Bieber
NEW_ARTISTS['justin-bieber'] = createArtist({
  name: "Justin Bieber",
  listeners: "76,500,000",
  followersCount: "82,400,000",
  rank: "#7 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg",
  bio: "Justin Drew Bieber is a Canadian pop and R&B powerhouse who rose from teenage acoustic phenomenon to one of the best-selling and most awarded artists of all time. Recipient of two Grammys and 33 Guinness World Records, Bieber became the first artist in Spotify history to surpass 90 million monthly listeners, defining the contemporary sound of global pop.",
  instagram: "justinbieber",
  x: "justinbieber",
  facebook: "JustinBieber",
  youtube: "JustinBieber",
  tourName: "Justice World Stadium Tour",
  tourDates: "Worldwide Arena Tour",
  topTracks: [
    { title: "STAY", album: "F*CK LOVE 3: OVERKILL", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "kTJczUoc268", duration: 141 },
    { title: "Peaches", album: "Justice", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "tQ0yjYUFKAE", duration: 198 },
    { title: "Ghost", album: "Justice", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "Fp8msa5uYsc", duration: 153 },
    { title: "Sorry", album: "Purpose", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "fRh_vgS2dFE", duration: 200 },
    { title: "Love Yourself", album: "Purpose", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "oyEuk8j8imI", duration: 233 },
    { title: "What Do You Mean?", album: "Purpose", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "DK_0jXPuIr0", duration: 205 },
    { title: "Baby", album: "My World 2.0", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "kffacxfA7G4", duration: 214 },
    { title: "Intentions", album: "Changes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "3AyMjyHu1bA", duration: 212 },
    { title: "Despacito (Remix)", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "72UO0v5ESUo", duration: 228 },
    { title: "Hold On", album: "Justice", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/09/a6/7b09a639-66bf-e935-7798-8ec23fbc55fc/21UMGIM13926.rgb.jpg/1000x1000bb.jpg", ytId: "LkWnuvN_n8Y", duration: 170 }
  ]
});

// 11. Ariana Grande
NEW_ARTISTS['ariana-grande'] = createArtist({
  name: "Ariana Grande",
  listeners: "82,500,000",
  followersCount: "94,100,000",
  rank: "#6 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg",
  bio: "Ariana Grande-Butera is an American pop and R&B powerhouse endowed with a legendary four-octave vocal range and signature whistle register. A two-time Grammy winner and Billboard chart record-holder, her albums Sweetener, Thank U, Next, Positions, and Eternal Sunshine have dominated global streaming, marking her as one of the definitive vocalists of the 21st century.",
  instagram: "arianagrande",
  x: "ArianaGrande",
  facebook: "arianagrande",
  youtube: "ArianaGrande",
  tourName: "Eternal Sunshine Live World Tour",
  tourDates: "New York, London, Paris, Tokyo, Los Angeles",
  topTracks: [
    { title: "we can't be friends (wait for your love)", album: "eternal sunshine", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "KNtJGQkC-WI", duration: 228 },
    { title: "7 rings", album: "thank u, next", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "QYh6mYIJG2Y", duration: 178 },
    { title: "thank u, next", album: "thank u, next", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "gl1aHhXnN1k", duration: 207 },
    { title: "positions", album: "Positions", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "tcYodQoapMg", duration: 172 },
    { title: "yes, and?", album: "eternal sunshine", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "eB6txyhHFG4", duration: 214 },
    { title: "Side to Side", album: "Dangerous Woman", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "SXiSVQZLje8", duration: 226 },
    { title: "Into You", album: "Dangerous Woman", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "1ekZEVeXwek", duration: 244 },
    { title: "Bang Bang", album: "My Everything", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "0HDdjwpPM3Y", duration: 199 },
    { title: "no tears left to cry", album: "Sweetener", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "ffxKSjUwKdU", duration: 205 },
    { title: "God is a woman", album: "Sweetener", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/05/27/ec/0527ec31-6b94-81d7-2f3b-dc94ad140134/24UMGIM08855.rgb.jpg/1000x1000bb.jpg", ytId: "kHLHSlExFis", duration: 197 }
  ]
});

// 12. BTS
NEW_ARTISTS['bts'] = createArtist({
  name: "BTS",
  listeners: "36,800,000",
  followersCount: "74,200,000",
  rank: "#1 Global K-Pop Icons",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg",
  bio: "BTS (Bangtan Sonyeondan), comprising RM, Jin, SUGA, j-hope, Jimin, V, and Jung Kook, is a Grammy-nominated South Korean group that became a 21st-century cultural titan. The first Korean group to top the US Billboard Hot 100 with 'Dynamite' and 'Butter', BTS has sold over 40 million albums, addressed the United Nations, and fostered a global ARMY of millions with messages of self-love and unity.",
  instagram: "bts.bighitofficial",
  x: "bts_bighit",
  facebook: "bangtan.official",
  youtube: "BANGTANTV",
  tourName: "BTS World Stadium Tour",
  tourDates: "Seoul, Los Angeles, Tokyo, London, Singapore",
  topTracks: [
    { title: "Dynamite", album: "BE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "gdZLi9oWNZg", duration: 199 },
    { title: "Butter", album: "Butter", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "WMweEpGlu_U", duration: 164 },
    { title: "Boy With Luv (feat. Halsey)", album: "Map of the Soul: Persona", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "XsX3ATc3FbA", duration: 229 },
    { title: "Fake Love", album: "Love Yourself: Tear", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "7C2z4GqqS5E", duration: 242 },
    { title: "DNA", album: "Love Yourself: Her", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "MBdVXkSdhwU", duration: 223 },
    { title: "Life Goes On", album: "BE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "-5q5mZbe3V8", duration: 207 },
    { title: "Mic Drop (Steve Aoki Remix)", album: "Love Yourself: Answer", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "kTlv5_Bs8aw", duration: 238 },
    { title: "Idol", album: "Love Yourself: Answer", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "pBuZEGYXA6E", duration: 222 },
    { title: "Spring Day", album: "You Never Walk Alone", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "xEeFrLSkMm8", duration: 274 },
    { title: "Blood Sweat & Tears", album: "Wings", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/d4/06/f0/d406f0e4-5778-9e5c-0974-9eb22ee5108d/196589179925.jpg/1000x1000bb.jpg", ytId: "hmE9f-TEutc", duration: 217 }
  ]
});

// 13. Travis Scott
NEW_ARTISTS['travis-scott'] = createArtist({
  name: "Travis Scott",
  listeners: "69,400,000",
  followersCount: "38,500,000",
  rank: "#2 in Trap & Hip-Hop",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg",
  bio: "Jacques Bermon Webster II, known professionally as Travis Scott, is a Houston-born rapper, producer, and cultural architect whose cinematic soundscapes, psychedelic auto-tune mastery, and chaotic live energy redefined contemporary trap music. With masterworks Rodeo, ASTROWORLD, and UTOPIA, Scott has amassed multiple Diamond certifications and 10 Grammy nominations.",
  instagram: "travisscott",
  x: "trvisXX",
  facebook: "travisscott",
  youtube: "TravisScottXX",
  tourName: "Circus Maximus Stadium World Tour",
  tourDates: "Houston, Chicago, Rome, London, Paris, Tokyo",
  topTracks: [
    { title: "SICKO MODE", album: "ASTROWORLD", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "6ONRf7h3Mdk", duration: 312 },
    { title: "FE!N", album: "UTOPIA", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "B9synWjqBn8", duration: 191 },
    { title: "Goosebumps", album: "Birds in the Trap Sing McKnight", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "Dst9gZkq1a8", duration: 243 },
    { title: "HIGHEST IN THE ROOM", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "tfSS1e3kYeo", duration: 175 },
    { title: "Antidote", album: "Rodeo", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "KnZ8h3MRuYg", duration: 262 },
    { title: "BUTTERFLY EFFECT", album: "ASTROWORLD", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "_EyZUTDAgBE", duration: 190 },
    { title: "STARGAZING", album: "ASTROWORLD", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "2a8PgqWrc_4", duration: 270 },
    { title: "MY EYES", album: "UTOPIA", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "yWJ0eM5r9z8", duration: 251 },
    { title: "TELEKINESIS", album: "UTOPIA", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "K1p8qX2m9x0", duration: 353 },
    { title: "I KNOW ?", album: "UTOPIA", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/f1/b7/c7/f1b7c7b8-6c84-88aa-324c-208b0a943715/196588239021.jpg/1000x1000bb.jpg", ytId: "8fL-N0_bWc0", duration: 211 }
  ]
});

// 14. Kishore Kumar
NEW_ARTISTS['kishore-kumar'] = createArtist({
  name: "Kishore Kumar",
  listeners: "22,500,000",
  followersCount: "19,800,000",
  rank: "#1 Golden Era Legend of Indian Cinema",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  bio: "Kishore Kumar (Abhas Kumar Ganguly) was a once-in-a-century creative genius: playback singer, actor, composer, and director whose exuberant yodeling, incomparable emotional depth, and peerless comedic timing defined the soundtrack of 20th-century India. Winner of eight Filmfare Best Male Playback Awards, his collaboration with R.D. Burman and Rajesh Khanna produced the greatest catalog in Indian cinema history.",
  instagram: "kishorekumarofficial",
  x: "KishoreKumarLegends",
  facebook: "KishoreKumarLegacy",
  youtube: "KishoreKumarOfficial",
  tourName: "Kishore Kumar Immortal Classics Symphony",
  tourDates: "Worldwide Golden Era Retrospective",
  topTracks: [
    { title: "Yeh Shaam Mastani", album: "Kati Patang", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "6mU7e0s7k2c", duration: 279 },
    { title: "Roop Tera Mastana", album: "Aradhana", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "HENak7d_36I", duration: 225 },
    { title: "Mere Sapno Ki Rani", album: "Aradhana", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "vo1MykK4uG4", duration: 300 },
    { title: "Pal Pal Dil Ke Paas", album: "Blackmail", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "AMuRRXCuy-4", duration: 329 },
    { title: "O Mere Dil Ke Chain", album: "Mere Jeevan Saathi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "d1nL9NqS7Wk", duration: 277 },
    { title: "Khaike Paan Banaraswala", album: "Don", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "J8aX5-u8sI4", duration: 236 },
    { title: "Ek Ladki Bheegi Bhaagi Si", album: "Chalti Ka Naam Gaadi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "h_P3w8L0e8c", duration: 240 },
    { title: "Humein Tumse Pyar Kitna", album: "Kudrat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "v8L2f-e8k4A", duration: 243 },
    { title: "Chala Jata Hoon", album: "Mere Jeevan Saathi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "c_3kX8e0g1U", duration: 270 },
    { title: "Zindagi Ek Safar Hai Suhana", album: "Andaz", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "k0_1n4E2s1I", duration: 254 }
  ]
});

// 15. Lata Mangeshkar
NEW_ARTISTS['lata-mangeshkar'] = createArtist({
  name: "Lata Mangeshkar",
  listeners: "24,800,000",
  followersCount: "21,200,000",
  rank: "#1 Immortal Nightingale of India",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  bio: "Lata Mangeshkar, the revered 'Nightingale of India' and recipient of the Bharat Ratna (India's highest civilian honor), is the most iconic voice in the history of Indian culture. Spanning a monumental eight-decade career with over 30,000 recorded songs across thirty-six regional languages, her pure tonal devotion brought prime ministers to tears with 'Aye Mere Watan Ke Logo' and defined the soul of the nation.",
  instagram: "mangeshkar.lata",
  x: "mangeshkarlata",
  facebook: "LataMangeshkarOfficial",
  youtube: "LataMangeshkarLegacy",
  tourName: "Lata Mangeshkar Memorial Heritage Symphony",
  tourDates: "National & Global Cultural Tribute",
  topTracks: [
    { title: "Lag Jaa Gale", album: "Woh Kaun Thi?", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "TFr6G5zveS8", duration: 258 },
    { title: "Aap Ki Nazron Ne Samjha", album: "Anpadh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "5jX9Y1Z7c0c", duration: 236 },
    { title: "Tujhe Dekha Toh", album: "Dilwale Dulhania Le Jayenge", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "cNVtK3oo9Co", duration: 304 },
    { title: "Tere Bina Zindagi Se", album: "Aandhi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "T_p0n4g8jE8", duration: 351 },
    { title: "Ajeeb Dastan Hai Yeh", album: "Dil Apna Aur Preet Parai", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "1p0mR9n3K2I", duration: 312 },
    { title: "Aye Mere Watan Ke Logo", album: "Patriotic Classics", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "X_eYF8x4rI0", duration: 374 },
    { title: "Kora Kagaz Tha Yeh Man Mera", album: "Aradhana", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 338 },
    { title: "Kabhi Kabhie Mere Dil Mein", album: "Kabhi Kabhie", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "k0p9k_r8vI0", duration: 288 },
    { title: "Hothon Mein Aisi Baat", album: "Jewel Thief", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "r8sL9-p0F1Y", duration: 504 },
    { title: "Lukka Chuppi", album: "Rang De Basanti", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "y6rS8x8s-20", duration: 396 }
  ]
});

// 16. A.R. Rahman
NEW_ARTISTS['ar-rahman'] = createArtist({
  name: "A.R. Rahman",
  listeners: "41,200,000",
  followersCount: "36,400,000",
  rank: "#1 Film Score & Global Music Maestro",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  bio: "Allah-Rakha Rahman, revered globally as 'The Mozart of Madras', is an Indian composer, record producer, singer, and songwriter who revolutionized Indian film music. Winner of two Academy Awards, two Grammy Awards, a BAFTA Award, and six National Film Awards, his genre-defying synthesis of Eastern classical traditions with electronic music and Western orchestral grandeur placed Indian music on the global pedestal.",
  instagram: "arrahman",
  x: "arrahman",
  facebook: "arrahman",
  youtube: "arrahman",
  tourName: "A.R. Rahman Wonderment Symphony Tour",
  tourDates: "Chennai, London, Dubai, New York, Singapore, Los Angeles",
  topTracks: [
    { title: "Jai Ho", album: "Slumdog Millionaire", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "xwwAVRyNmgQ", duration: 319 },
    { title: "Kun Faya Kun", album: "Rockstar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "T94PHkuydcw", duration: 473 },
    { title: "Maa Tujhe Salaam", album: "Vande Mataram", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "jDn2n5N8Uf8", duration: 367 },
    { title: "Chaiyya Chaiyya", album: "Dil Se..", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "PQmrmVs10X8", duration: 395 },
    { title: "Agar Tum Saath Ho", album: "Tamasha", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/d5/9c/0b/d59c0b11-b0f3-d022-d7cb-e52ca0a76be5/886445582314.jpg/1000x1000bb.jpg", ytId: "sK7riqg2mr4", duration: 341 },
    { title: "Nadaan Parindey", album: "Rockstar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "ttKG4NqD_w4", duration: 384 },
    { title: "Roja Janeman", album: "Roja", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "i0kK2mR1VvM", duration: 304 },
    { title: "Tere Bina", album: "Guru", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "x0Z7p_r1r8c", duration: 310 },
    { title: "Rehna Tu", album: "Delhi-6", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "5bL_k7vQ_6A", duration: 391 },
    { title: "Chinna Chinna Aasai", album: "Roja", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "a0pGvX8n-0o", duration: 295 }
  ]
});

// 17. Badshah
NEW_ARTISTS['badshah'] = createArtist({
  name: "Badshah",
  listeners: "31,800,000",
  followersCount: "25,400,000",
  rank: "#1 Indian Party & Rap Hitmaker",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg",
  bio: "Aditya Prateek Singh Sisodia, known mononymously as Badshah, is an Indian rapper, singer, music producer, and entrepreneur whose mega-viral club bangers have collected billions of YouTube and streaming plays. Recognized as the undisputed king of Indian party and commercial rap, his record-shattering anthems like 'Genda Phool', 'Jugnu', and 'Garmi' dominate dancefloors worldwide.",
  instagram: "badboyshah",
  x: "Its_Badshah",
  facebook: "OfficialBadshah",
  youtube: "Badshah",
  tourName: "The Paagal Tour 2026",
  tourDates: "Mumbai, Delhi, London, Dubai, Toronto",
  topTracks: [
    { title: "Genda Phool", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "SD4Z8z4sR4s", duration: 172 },
    { title: "Jugnu", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "V_90B_tV6hI", duration: 230 },
    { title: "Kala Chashma", album: "Baar Baar Dekho", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "k4yXQkGLeAk", duration: 187 },
    { title: "Garmi", album: "Street Dancer 3D", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 184 },
    { title: "Abhi Toh Party Shuru Hui Hai", album: "Khoobsurat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "89_K-HZyC-4", duration: 180 },
    { title: "Kar Gayi Chull", album: "Kapoor & Sons", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "NTHz9e-Nqzk", duration: 187 },
    { title: "DJ Waley Babu", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "OpeP03P1XvY", duration: 165 },
    { title: "Proper Patola", album: "Namaste England", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "tZp5k8N9r_M", duration: 178 },
    { title: "Soulmate", album: "Ek Tha Raja", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "3t-cK_k9v_8", duration: 213 },
    { title: "Mercy", album: "O.N.E.", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/d5/43/fa/d543fa3d-b4b9-8041-3ef8-278b17a14e10/8902894364003_cover.jpg/1000x1000bb.jpg", ytId: "Jyst8oIHOAY", duration: 162 }
  ]
});

// 18. Yo Yo Honey Singh
NEW_ARTISTS['honey-singh'] = createArtist({
  name: "Yo Yo Honey Singh",
  listeners: "27,400,000",
  followersCount: "23,900,000",
  rank: "#1 Commercial Desi Hip-Hop Pioneer",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg",
  bio: "Hirdesh Singh, known across the globe as Yo Yo Honey Singh, is the trailblazing music director, rapper, and pop sensation who brought commercial hip-hop into mainstream Indian cinema. His debut independent album International Villager became the highest-selling Punjabi album of all time, igniting an era of high-octane club anthems across the globe.",
  instagram: "yoyohoneysingh",
  x: "asliyoyo",
  facebook: "YoyoMahiofficial",
  youtube: "YoYoHoneySingh",
  tourName: "Honey 3.0 Glory Arena World Tour",
  tourDates: "Dubai, Delhi, Mumbai, London, Toronto, Sydney",
  topTracks: [
    { title: "Dope Shope", album: "International Villager", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 191 },
    { title: "Blue Eyes", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "NbyHNASFi6U", duration: 220 },
    { title: "Love Dose", album: "Desi Kalakaar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "TvngY4unnL4", duration: 228 },
    { title: "Lungi Dance", album: "Chennai Express", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "69CEiHfS_mc", duration: 275 },
    { title: "Desi Kalakaar", album: "Desi Kalakaar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "KhnVcACrwFE", duration: 259 },
    { title: "Brown Rang", album: "International Villager", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "PqFMFVcCZgI", duration: 179 },
    { title: "Angreji Beat", album: "International Villager", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "f0-jC_w8T3U", duration: 210 },
    { title: "High Heels Te Nachche", album: "Ki & Ka", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 212 },
    { title: "Makhna", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "HqUeS9v8t6s", duration: 183 },
    { title: "Payal", album: "Glory", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/33/27/9d/33279d4f-3765-ca75-8025-a136bfb1d83c/8902894363297_cover.jpg/1000x1000bb.jpg", ytId: "t2C7s0_qL1E", duration: 188 }
  ]
});

// 19. Neha Kakkar
NEW_ARTISTS['neha-kakkar'] = createArtist({
  name: "Neha Kakkar",
  listeners: "33,500,000",
  followersCount: "38,200,000",
  rank: "#2 Female Vocalist in India",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg",
  bio: "Neha Kakkar is one of the most followed and streamed Indian female vocalists of all time, acclaimed for her infectious energy, signature husky tone, and chart-topping dance numbers. Rising from religious jagran performances to winning India's heart on national television, she has become an unstoppable hitmaker with billions of streams.",
  instagram: "nehakakkar",
  x: "iAmNehaKakkar",
  facebook: "NehaKakkarOfficial",
  youtube: "NehaKakkarOfficial",
  tourName: "Neha Kakkar Live In Concert",
  tourDates: "Mumbai, Delhi, London, Dubai, Toronto",
  topTracks: [
    { title: "Mile Ho Tum", album: "Fever", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "N2-HsIYd0Go", duration: 264 },
    { title: "Dilbar", album: "Satyameva Jayate", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "n2u814n3u6g", duration: 184 },
    { title: "Aankh Marey", album: "Simmba", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "_KhQT-LGb-4", duration: 213 },
    { title: "O Saki Saki", album: "Batla House", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "_u-K8w0-8c0", duration: 191 },
    { title: "Garmi", album: "Street Dancer 3D", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 184 },
    { title: "Kala Chashma", album: "Baar Baar Dekho", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "k4yXQkGLeAk", duration: 187 },
    { title: "Kar Gayi Chull", album: "Kapoor & Sons", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "NTHz9e-Nqzk", duration: 187 },
    { title: "Coca Cola", album: "Luka Chuppi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 179 },
    { title: "Chamma Chamma", album: "Fraud Saiyaan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "fO_p3_r8jX4", duration: 194 },
    { title: "Yaad Piya Ki Aane Lagi", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1e/8a/8d/1e8a8d05-49e0-cb8f-0925-5e6fca790a35/8902894623124_cover.jpg/1000x1000bb.jpg", ytId: "y1T8q_sL0-0", duration: 257 }
  ]
});

// 20. Sunidhi Chauhan
NEW_ARTISTS['sunidhi-chauhan'] = createArtist({
  name: "Sunidhi Chauhan",
  listeners: "26,200,000",
  followersCount: "20,500,000",
  rank: "#1 Live Vocal Powerhouse",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg",
  bio: "Sunidhi Chauhan is universally regarded as the fiercest vocal powerhouse in modern Indian music. Renowned for raw stage intensity, astonishing dynamic range, and electrifying versatility, she has recorded thousands of songs across Hindi, Tamil, Telugu, and Punjabi cinema, earning multiple Filmfare Awards and headlining global arena spectacles.",
  instagram: "sunidhichauhan5",
  x: "SunidhiChauhan5",
  facebook: "sunidhi.chauhan",
  youtube: "SunidhiChauhanOfficial",
  tourName: "I Am Home Live Arena Tour",
  tourDates: "Mumbai, Bengaluru, Delhi, London, Dubai, Toronto",
  topTracks: [
    { title: "Kamli", album: "Dhoom:3", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "C8kSrkz8Hz8", duration: 312 },
    { title: "Sheila Ki Jawani", album: "Tees Maar Khan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "ZTmF2v59CtI", duration: 284 },
    { title: "Dhoom Machale", album: "Dhoom", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "sK7riqg2mr4", duration: 374 },
    { title: "Crazy Kiya Re", album: "Dhoom:2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 295 },
    { title: "Desi Girl", album: "Dostana", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "MQM7CNoAsBI", duration: 307 },
    { title: "Beedi", album: "Omkara", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "v8L2f-e8k4A", duration: 304 },
    { title: "Saaki", album: "Musafir", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "6jO_iX3Uf1g", duration: 326 },
    { title: "Ainvayi Ainvayi", album: "Band Baaja Baaraat", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "pBuZEGYXA6E", duration: 265 },
    { title: "Dance Pe Chance", album: "Rab Ne Bana Di Jodi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "yWJy_mS9b-I", duration: 262 },
    { title: "The Disco Song", album: "Student of the Year", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/1e/18/be/1e18bed8-9842-8c17-6490-67c858dc42ba/8902894623100_cover.jpg/1000x1000bb.jpg", ytId: "d8IT-163M8U", duration: 334 }
  ]
});

// 21. Jubin Nautiyal
NEW_ARTISTS['jubin-nautiyal'] = createArtist({
  name: "Jubin Nautiyal",
  listeners: "32,100,000",
  followersCount: "24,800,000",
  rank: "#2 Soulful Balladeer in India",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg",
  bio: "Jubin Nautiyal is an Indian playback singer and performer revered for rich baritone warmth, heartfelt acoustic renditions, and blockbuster romantic ballads. Winner of IIFA and Filmfare honors for 'Raataan Lambiyan' from Shershaah, his songs regularly cross hundreds of millions of views, making him one of the most bankable romantic voices of the modern streaming era.",
  instagram: "jubin_nautiyal",
  x: "JubinNautiyal",
  facebook: "JubinNautiyalOfficial",
  youtube: "JubinNautiyal",
  tourName: "Jubin Nautiyal Live In Concert",
  tourDates: "Dehradun, Delhi, Mumbai, London, Dubai",
  topTracks: [
    { title: "Raataan Lambiyan", album: "Shershaah", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "gvyUuxdRdR4", duration: 230 },
    { title: "Lut Gaye", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "sCbbMZ-q4-I", duration: 228 },
    { title: "Tum Hi Aana", album: "Marjaavaan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "tLqtnGLfm4Q", duration: 249 },
    { title: "Humnava Mere", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "N2-HsIYd0Go", duration: 334 },
    { title: "Tujhe Kitna Chahein Aur", album: "Kabir Singh", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "2a8PgqWrc_4", duration: 276 },
    { title: "Kinna Sona", album: "Marjaavaan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 273 },
    { title: "Bawara Mann", album: "Jolly LLB 2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 213 },
    { title: "Taaron Ke Shehar", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "w_R8e_xY7t4", duration: 239 },
    { title: "Dil Galti Kar Baitha Hai", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 260 },
    { title: "Kuch Baatein", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f4/62/5d/f4625dc8-5ce0-35e6-ec61-c8a7732db3c1/8902894362146_cover.jpg/1000x1000bb.jpg", ytId: "y1W8-x7q5Xg", duration: 276 }
  ]
});

// 22. Nusrat Fateh Ali Khan
NEW_ARTISTS['nusrat-fateh-ali-khan'] = createArtist({
  name: "Nusrat Fateh Ali Khan",
  listeners: "29,800,000",
  followersCount: "25,100,000",
  rank: "#1 Shahenshah-e-Qawwali Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  bio: "Ustad Nusrat Fateh Ali Khan, universally revered as 'Shahenshah-e-Qawwali' (The King of Kings of Qawwali), possessed one of the most transcendent, powerful, and acrobatic vocal instruments in the recorded history of humankind. Introducing the mystical ecstatic ecstasy of 700-year-old Sufi qawwali to world stages from WOMAD to Peter Gabriel and Eddie Vedder, his voice remains an eternal spiritual conduit.",
  instagram: "nusrat_fateh_ali_khan_legacy",
  x: "NFAKLegacy",
  facebook: "NusratFatehAliKhanOfficial",
  youtube: "NFAKOfficial",
  tourName: "Nusrat Fateh Ali Khan Eternal Spiritual Heritage",
  tourDates: "Worldwide Sufi Tribute & Heritage Symphony",
  topTracks: [
    { title: "Yeh Jo Halka Halka Suroor Hai", album: "Qawwali Masters", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "B7T8s5j0s_g", duration: 960 },
    { title: "Afreen Afreen", album: "Sangam", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "OpeP03P1XvY", duration: 384 },
    { title: "Sanu Ik Pal Chain Na Aave", album: "Qawwali Classics", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 420 },
    { title: "Mere Rashke Qamar", album: "Qawwali Masters", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 512 },
    { title: "Kinna Sohna Tainu", album: "Qawwali Classics", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 480 },
    { title: "Dum Mast Qalandar", album: "Mustt Mustt", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 340 },
    { title: "Tumhe Dillagi Bhool Jaani Padegi", album: "Qawwali Masters", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "fn382fN5F1g", duration: 720 },
    { title: "Mustt Mustt (Lost in His Work)", album: "Mustt Mustt", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "cWMxCE2HTag", duration: 315 },
    { title: "Piya Re Piya Re", album: "Sangam", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "SD4Z8z4sR4s", duration: 360 },
    { title: "Allah Hoo", album: "Day, Night, Dawn, Dusk", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 480 }
  ]
});

// 23. Rahat Fateh Ali Khan
NEW_ARTISTS['rahat-fateh-ali-khan'] = createArtist({
  name: "Rahat Fateh Ali Khan",
  listeners: "30,500,000",
  followersCount: "23,100,000",
  rank: "#1 Sufi & Bollywood Playback King",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg",
  bio: "Ustad Rahat Fateh Ali Khan is a world-renowned Pakistani musician and playback singer belonging to the 600-year-old Qawwal Bachhon gharana. Trained directly by his uncle Nusrat Fateh Ali Khan, Rahat has conquered both Bollywood and international concert halls, earning Filmfare Awards and headlining the Nobel Peace Prize concert with timeless masterpieces like 'O Re Piya' and 'Afreen Afreen'.",
  instagram: "officialrfakworld",
  x: "RFAKWorld",
  facebook: "RahatFatehAliKhanOfficial",
  youtube: "RahatFatehAliKhanOfficial",
  tourName: "Just Qawwali Live World Tour 2026",
  tourDates: "London, Dubai, Chicago, Birmingham, Toronto",
  topTracks: [
    { title: "Afreen Afreen", album: "Coke Studio Season 9", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "kw4tT7SCmaY", duration: 405 },
    { title: "O Re Piya", album: "Aaja Nachle", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "MyM-p2x_v3Q", duration: 379 },
    { title: "Tere Mast Mast Do Nain", album: "Dabangg", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "K9sO-p_bK3g", duration: 359 },
    { title: "Jag Ghoomeya", album: "Sultan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "t1Z-P8x7vU4", duration: 281 },
    { title: "Main Jahaan Rahoon", album: "Namastey London", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "y1W8-x7q5Xg", duration: 331 },
    { title: "Bol Na Halke Halke", album: "Jhoom Barabar Jhoom", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "cWMxCE2HTag", duration: 307 },
    { title: "Zaroori Tha", album: "Back 2 Love", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "6-n_szx2XRE", duration: 316 },
    { title: "Jiya Dhadak Dhadak Jaye", album: "Kalyug", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 319 },
    { title: "Sajdaa", album: "My Name Is Khan", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 367 },
    { title: "Dagabaaz Re", album: "Dabangg 2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a5/d8/5c/a5d85ce2-90f7-5bbd-c8b8-07d0f39ec07c/8902894623048_cover.jpg/1000x1000bb.jpg", ytId: "fn382fN5F1g", duration: 289 }
  ]
});

// Combine with existing DB
const MERGED_DB = { ...EXISTING_DB, ...NEW_ARTISTS };

console.log('Total artists in expanded database:', Object.keys(MERGED_DB).length);
fs.writeFileSync('scripts/merged_artist_db.json', JSON.stringify(MERGED_DB, null, 2), 'utf8');
console.log('Successfully written scripts/merged_artist_db.json!');
