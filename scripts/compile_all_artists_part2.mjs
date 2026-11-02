import fs from 'fs';
import { createArtist } from './mega_artists_data.mjs';

const EXISTING_MERGED = JSON.parse(fs.readFileSync('scripts/merged_artist_db.json', 'utf8'));
const MORE = {};

// 24. BLACKPINK
MORE['blackpink'] = createArtist({
  name: "BLACKPINK",
  listeners: "31,800,000",
  followersCount: "52,400,000",
  rank: "#1 Global K-Pop Female Group",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg",
  bio: "BLACKPINK (Jisoo, Jennie, Rosé, and Lisa) is the most successful Korean girl group internationally, crowned as the 'biggest girl group in the world'. The highest-charting female Korean act on the US Billboard Hot 100 and Billboard 200, BLACKPINK made history as the first Korean group to headline Coachella, collecting billions of streams with revolutionary girl-crush anthems.",
  instagram: "blackpinkofficial",
  x: "BLACKPINK",
  facebook: "BLACKPINKOFFICIAL",
  youtube: "BLACKPINKOFFICIAL",
  tourName: "BORN PINK World Stadium Tour",
  tourDates: "Seoul, Los Angeles, London, Tokyo, Bangkok",
  topTracks: [
    { title: "How You Like That", album: "THE ALBUM", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "ioNng23DkIM", duration: 181 },
    { title: "Kill This Love", album: "KILL THIS LOVE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "2S24-y0Ij3Y", duration: 189 },
    { title: "DDU-DU DDU-DU", album: "SQUARE UP", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "IHNzOHi8sJQ", duration: 209 },
    { title: "Pink Venom", album: "BORN PINK", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "gQlMMD8auMs", duration: 186 },
    { title: "Shut Down", album: "BORN PINK", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "POe9SOEKotk", duration: 175 },
    { title: "As If It's Your Last", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "Amq-qlqbjYA", duration: 213 },
    { title: "BOOMBAYAH", album: "SQUARE ONE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "bwmSjVeLBFU", duration: 240 },
    { title: "Lovesick Girls", album: "THE ALBUM", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "dyRsYk0LyA8", duration: 192 },
    { title: "Ice Cream (with Selena Gomez)", album: "THE ALBUM", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "vRXZj0DzXIA", duration: 175 },
    { title: "WHISTLE", album: "SQUARE ONE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/c2/f7/a8/c2f7a810-73f1-d07b-cb15-fae5635f639d/22UMGIM89354.rgb.jpg/1000x1000bb.jpg", ytId: "dISNgvVpWlo", duration: 211 }
  ]
});

// 25. Harry Styles
MORE['harry-styles'] = createArtist({
  name: "Harry Styles",
  listeners: "56,400,000",
  followersCount: "34,200,000",
  rank: "#8 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg",
  bio: "Harry Edward Styles is an English singer, songwriter, and actor whose charismatic glam-rock and vintage pop aesthetic earned him Album of the Year at the Grammy Awards for Harry's House. His record-shattering anthem 'As It Was' became the longest-running solo number-one on the Billboard Hot 100, solidifying his role as a generation-defining rock and pop icon.",
  instagram: "harrystyles",
  x: "Harry_Styles",
  facebook: "harrystyles",
  youtube: "HarryStyles",
  tourName: "Love On Tour Stadium Retrospective",
  tourDates: "London, New York, Tokyo, Sydney",
  topTracks: [
    { title: "As It Was", album: "Harry's House", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "H5v3kOT4y68", duration: 167 },
    { title: "Watermelon Sugar", album: "Fine Line", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "E07s5ZYyg4m", duration: 174 },
    { title: "Sign of the Times", album: "Harry Styles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "qN4ooNx77u0", duration: 340 },
    { title: "Adore You", album: "Fine Line", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "VF-r5TtlT9w", duration: 207 },
    { title: "Golden", album: "Fine Line", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "P3cffdsEXXw", duration: 208 },
    { title: "Late Night Talking", album: "Harry's House", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "4VqC1k3g6Q0", duration: 177 },
    { title: "Falling", album: "Fine Line", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "olGSAVOkkTI", duration: 240 },
    { title: "Music For a Sushi Restaurant", album: "Harry's House", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 193 },
    { title: "Matilda", album: "Harry's House", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 245 },
    { title: "Lights Up", album: "Fine Line", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/20/73/0e/20730eb0-6216-c7fe-a704-569fb2d354c4/886449990263.jpg/1000x1000bb.jpg", ytId: "9NZvM1918_E", duration: 172 }
  ]
});

// 26. Olivia Rodrigo
MORE['olivia-rodrigo'] = createArtist({
  name: "Olivia Rodrigo",
  listeners: "58,200,000",
  followersCount: "37,500,000",
  rank: "#2 in Alt-Pop / Rock",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg",
  bio: "Olivia Isabel Rodrigo is an American singer-songwriter who ignited a global pop-punk renaissance with her 3x Grammy-winning debut SOUR and critically lauded sophomore album GUTS. Bursting onto the scene with 'drivers license'—which shattered Spotify single-day streaming records—her sharp lyricism and visceral teenage angst have resonated across generations.",
  instagram: "oliviarodrigo",
  x: "oliviarodrigo",
  facebook: "OliviaRodrigoOfficial",
  youtube: "OliviaRodrigo",
  tourName: "GUTS World Arena Tour",
  tourDates: "Los Angeles, New York, London, Paris, Sydney",
  topTracks: [
    { title: "vampire", album: "GUTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "RlPNh_PBZb4", duration: 219 },
    { title: "drivers license", album: "SOUR", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "ZmDBbnmKpqQ", duration: 242 },
    { title: "good 4 u", album: "SOUR", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "gNi_6U5Pm_o", duration: 178 },
    { title: "deja vu", album: "SOUR", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "cii6ruuyc5k", duration: 215 },
    { title: "bad idea right?", album: "GUTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "Dj9q8gYmK8w", duration: 184 },
    { title: "get him back!", album: "GUTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "ZSJPrTrTz-g", duration: 211 },
    { title: "traitor", album: "SOUR", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "CRrf3h9vhp8", duration: 229 },
    { title: "all-american bitch", album: "GUTS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 165 },
    { title: "brutal", album: "SOUR", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "OGUX0XPEi_A", duration: 143 },
    { title: "obsessed", album: "GUTS (spilled)", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/58/a6/5e/58a65e7d-cb09-c5c2-f19b-648f572a1df7/23UMGIM71089.rgb.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 170 }
  ]
});

// 27. Lady Gaga
MORE['lady-gaga'] = createArtist({
  name: "Lady Gaga",
  listeners: "95,400,000",
  followersCount: "32,800,000",
  rank: "#2 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg",
  bio: "Stefani Joanne Angelina Germanotta, known as Lady Gaga, is an American pop icon, songwriter, and Oscar-winning actress renowned for boundary-pushing musical reinvention and operatic vocal power. With 13 Grammy Awards, an Academy Award, and mega-hits like 'Bad Romance', 'Shallow', and 'Die With A Smile' (with Bruno Mars), Gaga stands among the most celebrated artists in entertainment history.",
  instagram: "ladygaga",
  x: "ladygaga",
  facebook: "ladygaga",
  youtube: "LadyGaga",
  tourName: "The Chromatica Ball / Jazz & Piano",
  tourDates: "Las Vegas, Paris, London, Tokyo, New York",
  topTracks: [
    { title: "Die With A Smile", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "kPa7bsKwL-c", duration: 251 },
    { title: "Bad Romance", album: "The Fame Monster", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "qrO4YZeyl0I", duration: 294 },
    { title: "Poker Face", album: "The Fame", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "bESGLojNYSo", duration: 238 },
    { title: "Shallow", album: "A Star Is Born", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "bo_efYhYU2A", duration: 216 },
    { title: "Just Dance", album: "The Fame", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "2Abk1jAONjw", duration: 242 },
    { title: "Born This Way", album: "Born This Way", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "wV1FrqwZyKw", duration: 260 },
    { title: "Rain On Me (with Ariana Grande)", album: "Chromatica", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "AoAm4om0wTs", duration: 182 },
    { title: "Alejandro", album: "The Fame Monster", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "niqrrmev4mA", duration: 274 },
    { title: "Judas", album: "Born This Way", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "wagn8Wrmzuc", duration: 250 },
    { title: "Always Remember Us This Way", album: "A Star Is Born", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/64/df/31/64df3158-967b-1178-0cb7-e433436bb535/8902894359672_cover.jpg/1000x1000bb.jpg", ytId: "5vheNbQlsyU", duration: 210 }
  ]
});

// 28. Charlie Puth
MORE['charlie-puth'] = createArtist({
  name: "Charlie Puth",
  listeners: "44,600,000",
  followersCount: "26,100,000",
  rank: "#10 in Contemporary Pop",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
  bio: "Charles Otto Puth Jr. is an American singer, songwriter, and record producer renowned for his rare perfect pitch and viral ear for hook construction. His breakout collaboration 'See You Again' with Wiz Khalifa topped the Billboard Hot 100 for 12 weeks, and subsequent albums Voicenotes and CHARLIE cemented his standing as a master pop melody architect.",
  instagram: "charlieputh",
  x: "charlieputh",
  facebook: "charlieputh",
  youtube: "CharliePuth",
  tourName: "The Charlie Live Experience",
  tourDates: "New York, Los Angeles, Seoul, London",
  topTracks: [
    { title: "Attention", album: "Voicenotes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "nfs8NYg7yQM", duration: 208 },
    { title: "We Don't Talk Anymore (feat. Selena Gomez)", album: "Nine Track Mind", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "3AtDnEC4zak", duration: 217 },
    { title: "See You Again (feat. Charlie Puth)", album: "Furious 7", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "RgKAFK5djSk", duration: 229 },
    { title: "Left and Right (feat. Jung Kook of BTS)", album: "CHARLIE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "a7GITgqwDVg", duration: 154 },
    { title: "Light Switch", album: "CHARLIE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "WFsA8n4vK3E", duration: 185 },
    { title: "One Call Away", album: "Nine Track Mind", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "BzxveZ6M0P0", duration: 240 },
    { title: "How Long", album: "Voicenotes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "CwfoyVa980U", duration: 198 },
    { title: "Dangerously", album: "Nine Track Mind", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "TBXQu8ORnBQ", duration: 199 },
    { title: "That's Hilarious", album: "CHARLIE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 144 },
    { title: "Done For Me (feat. Kehlani)", album: "Voicenotes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "JaHfZ_P-P3U", duration: 180 }
  ]
});

// 29. Darshan Raval
MORE['darshan-raval'] = createArtist({
  name: "Darshan Raval",
  listeners: "23,600,000",
  followersCount: "21,500,000",
  rank: "#1 Monsoon & Romantic Pop Idol",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg",
  bio: "Darshan Raval is an Indian singer, composer, and heartthrob lyricist crowned as the 'Monsoon Romance King'. Emerging from India's Raw Star, his annual monsoon releases, sweet falsetto, and blockbuster Bollywood tracks like 'Chogada' and 'Kamariya' have made him an icon of modern Indian youth romance.",
  instagram: "darshanravaldz",
  x: "DarshanRavalDZ",
  facebook: "DarshanRavalDZ",
  youtube: "DarshanRavalDZ",
  tourName: "Love In The Stars Arena Tour",
  tourDates: "Ahmedabad, Mumbai, Pune, Kolkata, Delhi",
  topTracks: [
    { title: "Tera Zikr", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "b8-M9g8K-0o", duration: 215 },
    { title: "Chogada", album: "Loveyatri", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "asYxxtiWUyw", duration: 250 },
    { title: "Kamariya", album: "Mitron", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "1p0mR9n3K2I", duration: 188 },
    { title: "Ek Ladki Ko Dekha Toh Aisa Laga", album: "Title Track", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 155 },
    { title: "Asal Mein", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 224 },
    { title: "Hawa Banke", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 198 },
    { title: "Mehrama", album: "Love Aaj Kal", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 249 },
    { title: "Rabba Mehar Kari", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 218 },
    { title: "Bhula Dunga", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "cWMxCE2HTag", duration: 242 },
    { title: "Mahiye Jinna Sohna", album: "Dard", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/31/5d/79/315d799d-1ca4-3dc3-e62e-3f6567dd8ff0/197188701987.jpg/1000x1000bb.jpg", ytId: "fn382fN5F1g", duration: 180 }
  ]
});

// 30. Anuv Jain
MORE['anuv-jain'] = createArtist({
  name: "Anuv Jain",
  listeners: "18,400,000",
  followersCount: "14,200,000",
  rank: "#1 Indie Acoustic Poet",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg",
  bio: "Anuv Jain is an Indian singer, songwriter, and acoustic guitarist hailed as the voice of heartfelt indie storytelling. Armored only with a baritone ukulele and poignant lyrics, his viral acoustic gems like 'Baarishein', 'Husn', and 'Alag Aasmaan' have captured millions of hearts, turning indie bedroom recordings into stadium sing-alongs.",
  instagram: "anuvjain",
  x: "anuvjain",
  facebook: "anuvjainmusic",
  youtube: "AnuvJain",
  tourName: "Guldasta Arena India Tour",
  tourDates: "Ludhiana, Delhi, Mumbai, Bengaluru, Kolkata",
  topTracks: [
    { title: "Husn", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "gQLMMD8auMs", duration: 218 },
    { title: "Baarishein", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "BTGY4n_1v3E", duration: 207 },
    { title: "Alag Aasmaan", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "OpeP03P1XvY", duration: 212 },
    { title: "Mishri", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "b8-M9g8K-0o", duration: 218 },
    { title: "Gul", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "1p0mR9n3K2I", duration: 217 },
    { title: "Riha", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "asYxxtiWUyw", duration: 188 },
    { title: "Ocean", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 202 },
    { title: "Maula", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 228 },
    { title: "Kyun", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 210 },
    { title: "Mazaak", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/2c/df/14/2cdf140e-6d11-a98d-bfbf-bc5e30c3c4a1/197189528187.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 198 }
  ]
});

// 31. Prateek Kuhad
MORE['prateek-kuhad'] = createArtist({
  name: "Prateek Kuhad",
  listeners: "16,800,000",
  followersCount: "12,900,000",
  rank: "#1 Global Indie Folk Artist",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg",
  bio: "Prateek Kuhad is an internationally celebrated singer-songwriter hailed by Barack Obama on his favorite music of the year list for 'cold/mess'. With whisper-soft acoustic intimacy, poetic bilingual songwriting in Hindi and English, and sold-out headline tours from London to Los Angeles, Kuhad defined the rise of global Indian indie folk.",
  instagram: "prateekkuhad",
  x: "prateekkuhad",
  facebook: "prateekkuhadmusic",
  youtube: "PrateekKuhad",
  tourName: "The Way That Too Goes World Tour",
  tourDates: "London, New York, Delhi, Mumbai, Singapore",
  topTracks: [
    { title: "cold/mess", album: "cold/mess", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "Il7nvbQR6yc", duration: 247 },
    { title: "Kasoor", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "pBuZEGYXA6E", duration: 196 },
    { title: "Kho Gaye Hum Kahan", album: "Baar Baar Dekho", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "k0_1n4E2s1I", duration: 213 },
    { title: "Tum Jab Paas", album: "In Tokens & Charms", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 236 },
    { title: "Co2", album: "The Way That Lovers Do", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "LK7-_dgAVQE", duration: 161 },
    { title: "Tune Kaha", album: "Raat Raazi", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "0bM7u_kQ7wE", duration: 184 },
    { title: "100 Words", album: "cold/mess", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 202 },
    { title: "Yeh Pal", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "cWMxCE2HTag", duration: 215 },
    { title: "Dil Beparvah", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "fn382fN5F1g", duration: 235 },
    { title: "Just A Word", album: "The Way That Lovers Do", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 178 }
  ]
});

// Merge with previous
const FULL_DB = { ...EXISTING_MERGED, ...MORE };
console.log('Grand total curated artists:', Object.keys(FULL_DB).length);
fs.writeFileSync('scripts/merged_artist_db.json', JSON.stringify(FULL_DB, null, 2), 'utf8');
console.log('Updated merged_artist_db.json successfully!');
