/**
 * Pulse Music - Multi-Category Catalog & Artist Directory Engine
 * Powered by Jamendo API (Client ID: 23b33f2a) and Decentralized Audius Nodes
 */

(function(root) {
  'use strict';

  const JAMENDO_CLIENT_ID = '23b33f2a';
  const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
  const AUDIUS_APP_NAME = 'PULSE_MUSIC_APP';

  // =========================================================================
  // 1. DYNAMIC CATEGORY & GENRE CONFIGURATION
  // =========================================================================
  // 1. DYNAMIC CATEGORY & GENRE CONFIGURATION
  // =========================================================================
  const CATEGORIES = {
    'recommended': {
      id: 'recommended',
      title: 'Songs You Will Love',
      subtitle: 'Curated picks tailored to your musical taste & mood',
      icon: 'fa-wand-magic-sparkles',
      color: '#e879f9',
      jamendoTags: 'pop',
      audiusTrending: true
    },
    'nineties': {
      id: 'nineties',
      title: 'Top 90s Golden Hits & Nostalgia',
      subtitle: 'Timeless 90s Bollywood classics & iconic international anthems',
      icon: 'fa-record-vinyl',
      color: '#f59e0b',
      jamendoTags: 'retro',
      audiusQuery: '90s hits',
      saavnQuery: '90s Bollywood'
    },
    'hollywood': {
      id: 'hollywood',
      title: 'Top Hollywood Blockbuster Hits',
      subtitle: 'Legendary movie soundtracks, Billboard #1s & global pop anthems',
      icon: 'fa-clapperboard',
      color: '#38bdf8',
      jamendoTags: 'soundtrack',
      audiusQuery: 'movie soundtrack',
      itunesQuery: 'Hollywood Movie Hits'
    },
    'bollywood_evergreen': {
      id: 'bollywood_evergreen',
      title: 'Bollywood Evergreen & Modern Hits',
      subtitle: 'Soulful melodies, romantic chartbusters & cinematic blockbusters',
      icon: 'fa-compact-disc',
      color: '#ec4899',
      jamendoTags: 'indian',
      audiusQuery: 'Arijit Singh',
      saavnQuery: 'Bollywood Hits'
    },
    'punjabi_chartbusters': {
      id: 'punjabi_chartbusters',
      title: 'Punjabi Chartbusters & Desi Swag',
      subtitle: 'High-voltage Punjabi bangers, hip-hop & modern folk',
      icon: 'fa-guitar',
      color: '#eab308',
      jamendoTags: 'indian',
      audiusQuery: 'Diljit Dosanjh',
      saavnQuery: 'Punjabi Top Hits'
    },
    'trending': {
      id: 'trending',
      title: 'Trending Worldwide',
      subtitle: 'Top global chartbusters and viral discoveries',
      icon: 'fa-fire',
      color: '#f97316',
      jamendoOrder: 'popularity_total',
      jamendoTags: null,
      audiusGenre: null,
      audiusTrending: true
    },
    'pop': {
      id: 'pop',
      title: 'English & International Pop',
      subtitle: 'Billboard hits, catchy hooks & chart-topping pop anthems',
      icon: 'fa-earth-americas',
      color: '#3b82f6',
      jamendoTags: 'pop',
      audiusGenre: 'Pop',
      itunesQuery: 'Top Pop Hits'
    },
    'electronic': {
      id: 'electronic',
      title: 'EDM & Electronic Heat',
      subtitle: 'High-energy club bangers, house, synthwave & dance',
      icon: 'fa-bolt-lightning',
      color: '#a855f7',
      jamendoTags: 'edm',
      audiusGenre: 'Electronic'
    },
    'lofi': {
      id: 'lofi',
      title: 'Lo-Fi & Study Chill',
      subtitle: 'Soothing instrumental beats, ambient vibes & relaxation',
      icon: 'fa-headphones-simple',
      color: '#10b981',
      jamendoTags: 'lofi',
      audiusGenre: 'Lo-Fi'
    },
    'rock': {
      id: 'rock',
      title: 'Rock & Alternative',
      subtitle: 'Electric riffs, indie rock, classic anthems & punk',
      icon: 'fa-guitar',
      color: '#ef4444',
      jamendoTags: 'indie',
      audiusGenre: 'Rock'
    },
    'ambient': {
      id: 'ambient',
      title: 'Ambient & Cinematic Scores',
      subtitle: 'Film soundtracks, orchestral textures & deep meditation',
      icon: 'fa-film',
      color: '#06b6d4',
      jamendoTags: 'filmscore',
      audiusGenre: 'Ambient'
    }
  };

  // =========================================================================
  // 2. STARTER TRACKS (Synchronous Instant Display on Boot)
  // =========================================================================
  const STARTER_TRACKS = [
    { id: 'rec-1', title: 'Starboy', artist: 'The Weeknd', album: 'The Highlights', cover: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.webp', streamUrl: 'https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4', duration: '3:50', category: 'recommended', genre: 'Pop', language: 'English', playCount: 1420000 },
    { id: 'rec-2', title: 'Kesariya', artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya', album: 'Brahmastra', cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.webp', streamUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4', duration: '4:28', category: 'recommended', genre: 'Bollywood', language: 'Hindi', playCount: 854000 },
    { id: 'rec-3', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', cover: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.webp', streamUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4', duration: '3:10', category: 'recommended', genre: 'Punjabi', language: 'Punjabi', playCount: 650000 },
    { id: 'rec-4', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover (Remix)', cover: 'https://c.saavncdn.com/219/Lover-Remix--English-2019-20191113031000-500x500.webp', streamUrl: 'https://aac.saavncdn.com/219/bed6f6f73cc56ee7ca95db3f3a3081a3_320.mp4', duration: '3:43', category: 'recommended', genre: 'Pop', language: 'English', playCount: 1350000 },
    { id: 'rec-5', title: 'Midnight City Lights', artist: 'Rob Knox', album: 'Midnight Comfy Beats', cover: 'https://c.saavncdn.com/793/Midnight-Comfy-Beats-Unknown-2026-20260210102717-500x500.webp', streamUrl: 'https://aac.saavncdn.com/793/095a9b4eb8a753833724fbd42e60617b_320.mp4', duration: '2:49', category: 'recommended', genre: 'Lo-Fi', language: 'Instrumental', playCount: 320000 },
    { id: 'rec-6', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', cover: 'https://c.saavncdn.com/248/Evolve-English-2018-20260605220036-500x500.webp', streamUrl: 'https://aac.saavncdn.com/248/46944eb7b4b31f5b0abf5eb2e1be2d2a_320.mp4', duration: '3:24', category: 'recommended', genre: 'Rock', language: 'English', playCount: 1700000 },
    { id: '90s-1', title: 'Tujhe Dekha Toh', artist: 'Lata Mangeshkar, Kumar Sanu', album: 'Dilwale Dulhania Le Jayenge', cover: 'https://c.saavncdn.com/588/Dilwale-Dulhania-Le-Jayenge-Hindi-1995-20171114-500x500.webp', streamUrl: 'https://aac.saavncdn.com/588/1915cd0934f79eeb646ffebde384e59d_sar_320.mp4', duration: '5:03', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 1540000 },
    { id: '90s-2', title: 'Smells Like Teen Spirit', artist: 'Nirvana', album: 'Nevermind (Deluxe Edition)', cover: 'https://c.saavncdn.com/045/Nevermind-Deluxe-Edition--English-2011-20210224133919-500x500.webp', streamUrl: 'https://aac.saavncdn.com/045/67cab9eebd0661257e601118a539dd23_320.mp4', duration: '5:01', category: 'nineties', genre: '90s Grunge', language: 'English', playCount: 1890000 },
    { id: '90s-3', title: 'Chaiyya Chaiyya', artist: 'Sukhwinder Singh, Sapna Awasthi', album: 'Bollywood\'s Musical Extravaganza - Sonu Nigam & Sukhwinder Singh', cover: 'https://c.saavncdn.com/415/Bollywood-s-Musical-Extravaganza-Sonu-Nigam-Sukhwinder-Singh-Hindi-2016-20251203123006-500x500.webp', streamUrl: 'https://aac.saavncdn.com/415/a8c88ee4ba91c08569d28917eb72d8e5_320.mp4', duration: '6:46', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 1250000 },
    { id: '90s-4', title: 'I Want It That Way', artist: 'Backstreet Boys', album: 'Millennium 2.0', cover: 'https://c.saavncdn.com/513/Millennium-2-0-English-2025-20250708100744-500x500.webp', streamUrl: 'https://aac.saavncdn.com/513/e17700654583b96ee3454a9161f9042b_320.mp4', duration: '3:34', category: 'nineties', genre: '90s Pop', language: 'English', playCount: 1650000 },
    { id: '90s-5', title: 'Pehla Nasha', artist: 'Udit Narayan, Sadhana Sargam', album: 'Jo Jeeta Wohi Sikandar', cover: 'https://c.saavncdn.com/852/Jo-Jeeta-Wohi-Sikandar-Hindi-1992-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/852/9d335ee08b26f171a3d65e11f8819d52_sar_320.mp4', duration: '4:53', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 980000 },
    { id: '90s-6', title: 'Wonderwall', artist: 'Oasis', album: '(What\'s The Story) Morning Glory?', cover: 'https://c.saavncdn.com/076/What-s-The-Story-Morning-Glory-English-2025-20260418220122-500x500.webp', streamUrl: 'https://aac.saavncdn.com/076/205cf376d271353b67df6c261e83343c_320.mp4', duration: '4:18', category: 'nineties', genre: '90s Britpop', language: 'English', playCount: 1420000 },
    { id: '90s-7', title: 'Chura Ke Dil Mera', artist: 'Kumar Sanu, Alka Yagnik', album: 'Bollywood Queens', cover: 'https://c.saavncdn.com/367/Bollywood-Queens-Hindi-2016-20260331205729-500x500.webp', streamUrl: 'https://aac.saavncdn.com/367/887807906880a91aaa1b09432a6e0161_320.mp4', duration: '7:55', category: 'nineties', genre: '90s Bollywood', language: 'Hindi', playCount: 890000 },
    { id: '90s-8', title: 'My Heart Will Go On', artist: 'James Horner, Céline Dion', album: 'Titanic', cover: 'https://c.saavncdn.com/354/Titanic-Music-from-the-Motion-Picture-Soundtrack-English-2004-20171212173657-500x500.webp', streamUrl: 'https://aac.saavncdn.com/354/c31e4b2daa3919e8ee394e9948d4bf63_320.mp4', duration: '5:15', category: 'nineties', genre: '90s Pop', language: 'English', playCount: 1750000 },
    { id: 'hwd-1', title: 'See You Again', artist: 'Wiz Khalifa', album: 'Furious 7: Original Motion Picture Soundtrack', cover: 'https://c.saavncdn.com/184/Furious-7-Original-Motion-Picture-Soundtrack-English-2015-20240228160023-500x500.webp', streamUrl: 'https://aac.saavncdn.com/184/2cc2d21debad1425cb55e0a5bede7bf7_320.mp4', duration: '3:49', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 2100000 },
    { id: 'hwd-2', title: 'Sunflower', artist: 'Post Malone, Swae Lee', album: 'The Diamond Collection', cover: 'https://c.saavncdn.com/504/The-Diamond-Collection-English-2023-20240201105640-500x500.webp', streamUrl: 'https://aac.saavncdn.com/504/b3bc79be82cb12784fd3f8835bd22bf5_320.mp4', duration: '2:38', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1950000 },
    { id: 'hwd-3', title: 'Skyfall', artist: 'Danish National Symphony Orchestra, Caroline Henderson', album: 'Agents Are Forever', cover: 'https://c.saavncdn.com/730/Agents-are-Forever-English-2020-20201103114321-500x500.webp', streamUrl: 'https://aac.saavncdn.com/730/67f367cda655a803abf2d6f7fc847534_320.mp4', duration: '4:45', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1680000 },
    { id: 'hwd-4', title: 'Shallow', artist: 'Lady Gaga, Bradley Cooper', album: 'A Star Is Born Soundtrack', cover: 'https://c.saavncdn.com/766/A-Star-Is-Born-Soundtrack-English-2018-20260605163048-500x500.webp', streamUrl: 'https://aac.saavncdn.com/766/d360f3225c4c8710b359bab94fbe642f_320.mp4', duration: '3:36', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1520000 },
    { id: 'hwd-5', title: 'Lose Yourself', artist: 'Eminem', album: 'Curtain Call: The Hits', cover: 'https://c.saavncdn.com/941/Curtain-Call-The-Hits-English-2005-20250827231103-500x500.webp', streamUrl: 'https://aac.saavncdn.com/941/eb67968df8c5ffb5f59bb1dd22997f71_320.mp4', duration: '5:21', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1890000 },
    { id: 'hwd-6', title: 'Let It Go', artist: 'Idina Menzel', album: 'Frozen', cover: 'https://c.saavncdn.com/112/Frozen-English-2013-20231116060154-500x500.webp', streamUrl: 'https://aac.saavncdn.com/112/77c26f23c89e1a6ba4423a83903aba14_320.mp4', duration: '3:44', category: 'hollywood', genre: 'Soundtrack', language: 'English', playCount: 1450000 },
    { id: 'hwd-7', title: 'Eye of the Tiger', artist: 'Survivor', album: 'Rocky III (Original Motion Picture Score)', cover: 'https://c.saavncdn.com/957/Rocky-III-Music-From-The-Motion-Picture-English-2009-20180305095013-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/957/ad73e849ebdbf5af9549c508683aaf03_320.mp4', duration: '3:50', category: 'hollywood', genre: 'Classic Rock', language: 'English', playCount: 1320000 },
    { id: 'bolly-1', title: 'Kesariya', artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya', album: 'Brahmastra', cover: 'https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-500x500.webp', streamUrl: 'https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4', duration: '4:28', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 854000 },
    { id: 'bolly-2', title: 'Apna Bana Le', artist: 'Sachin-Jigar, Arijit Singh', album: 'Bhediya', cover: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.webp', streamUrl: 'https://aac.saavncdn.com/815/483a6e118e8108cbb3e5cd8701674f32_320.mp4', duration: '4:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 742000 },
    { id: 'bolly-3', title: 'Tum Se Hi', artist: 'Pritam, Mohit Chauhan', album: 'Jab We Met', cover: 'https://c.saavncdn.com/223/Jab-We-Met-Hindi-2007-20231016162009-500x500.webp', streamUrl: 'https://aac.saavncdn.com/223/7eddc0f9b56f110ae39a145752fabb34_320.mp4', duration: '5:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 680000 },
    { id: 'bolly-4', title: 'Chaleya', artist: 'Kumaar, Anirudh Ravichander, Arijit Singh, Shilpa Rao', album: 'World Music Day - Best Of Bollywood Hits', cover: 'https://c.saavncdn.com/179/World-Music-Day-Best-Of-Bollywood-Hits-Hindi-2026-20260622111029-500x500.webp', streamUrl: 'https://aac.saavncdn.com/179/1be373323edc90024d93873d85f644ec_320.mp4', duration: '3:20', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 920000 },
    { id: 'bolly-5', title: 'Kal Ho Naa Ho', artist: 'Shankar-Ehsaan-Loy, Naveen Kumar', album: 'Never Say Good Bye', cover: 'https://c.saavncdn.com/979/Never-Say-Good-Bye-Hindi-2006-20200415085918-500x500.webp', streamUrl: 'https://aac.saavncdn.com/979/b8d8494a0021988f729b0da4a7bd6d9f_320.mp4', duration: '4:23', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 1100000 },
    { id: 'bolly-6', title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Best Of Arijit Singh - Collection Of Romantic Songs', cover: 'https://c.saavncdn.com/840/Best-Of-Arijit-Singh-Collection-Of-Romantic-Songs-Hindi-2025-20251203161112-500x500.webp', streamUrl: 'https://aac.saavncdn.com/840/c9e70fb62d66fa6e14f6b7cdbc56cc05_320.mp4', duration: '4:21', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 1200000 },
    { id: 'bolly-7', title: 'Kabira', artist: 'Pritam, Arijit Singh, Harshdeep Kaur', album: 'Best Of Arijit Singh', cover: 'https://c.saavncdn.com/014/Best-Of-Arijit-Singh-2013-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/014/d893044515e3cbefd67666cf688f33bd_320.mp4', duration: '4:31', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 890000 },
    { id: 'bolly-8', title: 'Kun Faya Kun', artist: 'A.R. Rahman, Javed Ali, Mohit Chauhan', album: 'Teri Jhalak Asharfi Javed Ali Hits', cover: 'https://c.saavncdn.com/673/Teri-Jhalak-Asharfi-Javed-Ali-Hits-Hindi-2022-20250916131122-500x500.webp', streamUrl: 'https://aac.saavncdn.com/673/d250be23a2d545a37c20b8d1d7482b00_320.mp4', duration: '7:50', category: 'bollywood_evergreen', genre: 'Sufi / Bollywood', language: 'Hindi', playCount: 990000 },
    { id: 'bolly-9', title: 'Raataan Lambiyan', artist: 'Tanishk Bagchi, Jubin Nautiyal, Asees Kaur', album: 'Shershaah', cover: 'https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.webp', streamUrl: 'https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4', duration: '3:50', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 610000 },
    { id: 'bolly-10', title: 'Heeriye', artist: 'Dulquer Salmaan, Jasleen Royal, Arijit Singh', album: 'Heeriye (feat. Arijit Singh)', cover: 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230928050405-500x500.webp', streamUrl: 'https://aac.saavncdn.com/022/a192e8d320ea5630db314d04fedf0aa5_320.mp4', duration: '3:14', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 540000 },
    { id: 'bolly-11', title: 'Shayad', artist: 'Pritam, Arijit Singh', album: 'Love Aaj Kal', cover: 'https://c.saavncdn.com/862/Love-Aaj-Kal-Hindi-2020-20200214140423-500x500.webp', streamUrl: 'https://aac.saavncdn.com/862/e277c1b441b562640c6b264aa3335a83_320.mp4', duration: '4:07', category: 'bollywood_evergreen', genre: 'Bollywood', language: 'Hindi', playCount: 490000 },
    { id: 'pb-1', title: 'Lover', artist: 'Diljit Dosanjh', album: 'MoonChild Era', cover: 'https://c.saavncdn.com/209/MoonChild-Era-Punjabi-2021-20240715073449-500x500.webp', streamUrl: 'https://aac.saavncdn.com/209/88cd9a1cc0af8768d67272876bb09851_320.mp4', duration: '3:10', category: 'punjabi_chartbusters', genre: 'Punjabi Pop', language: 'Punjabi', playCount: 750000 },
    { id: 'pb-2', title: 'Softly', artist: 'Karan Aujla, IKKY', album: 'Making Memories', cover: 'https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.webp', streamUrl: 'https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4', duration: '2:35', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 840000 },
    { id: 'pb-3', title: 'Excuses', artist: 'AP Dhillon, Gurinder Gill, Intense', album: 'Excuses', cover: 'https://c.saavncdn.com/890/Excuses-English-2021-20210930112054-500x500.webp', streamUrl: 'https://aac.saavncdn.com/890/a18aabc4681dc6c334d5d29b67e84a0f_320.mp4', duration: '2:57', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 920000 },
    { id: 'pb-4', title: 'Brown Munde', artist: 'AP Dhillon, Gminxr, Gurinder Gill, Shinda Kahlon', album: 'Brown Munde', cover: 'https://c.saavncdn.com/973/Brown-Munde-English-2020-20260520131422-500x500.webp', streamUrl: 'https://aac.saavncdn.com/973/76216adb3df5ef476f948891b40efb7a_320.mp4', duration: '4:14', category: 'punjabi_chartbusters', genre: 'Punjabi Hip-Hop', language: 'Punjabi', playCount: 1450000 },
    { id: 'pb-5', title: '295', artist: 'Sidhu Moose Wala', album: 'Moosetape', cover: 'https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-500x500.webp', streamUrl: 'https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4', duration: '4:30', category: 'punjabi_chartbusters', genre: 'Punjabi Rap', language: 'Punjabi', playCount: 1600000 },
    { id: 'pb-6', title: 'Born to Shine', artist: 'Diljit Dosanjh', album: 'G.O.A.T.', cover: 'https://c.saavncdn.com/597/G-O-A-T-Punjabi-2020-20240708055140-500x500.webp', streamUrl: 'https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4', duration: '3:34', category: 'punjabi_chartbusters', genre: 'Punjabi Pop', language: 'Punjabi', playCount: 880000 },
    { id: 'pb-7', title: 'White Brown Black', artist: 'Avvy Sra, Karan Aujla, Jaani', album: 'White Brown Black', cover: 'https://c.saavncdn.com/177/White-Brown-Black-Punjabi-2022-20251118151218-500x500.webp', streamUrl: 'https://aac.saavncdn.com/177/8a4e89ae82b74333f57ab3130b05d056_320.mp4', duration: '2:56', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 720000 },
    { id: 'pb-8', title: 'Mi Amor', artist: 'Sharn, 40K, The Paul', album: 'Mi Amor', cover: 'https://c.saavncdn.com/051/Mi-Amor-Punjabi-2022-20220930164801-500x500.webp', streamUrl: 'https://aac.saavncdn.com/051/249871fff26d5400e55170a94d1acf99_320.mp4', duration: '3:23', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 680000 },
    { id: 'pb-9', title: 'Wavy', artist: 'Karan Aujla', album: 'Four Me', cover: 'https://c.saavncdn.com/374/Four-Me-Punjabi-2024-20240627054614-500x500.webp', streamUrl: 'https://aac.saavncdn.com/374/0fb1a52161fbcab7c5703ab6db64a937_320.mp4', duration: '3:07', category: 'punjabi_chartbusters', genre: 'Punjabi', language: 'Punjabi', playCount: 910000 },
    { id: 'pop-1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', cover: 'https://c.saavncdn.com/077/After-Hours-English-2020-20260804045014-500x500.webp', streamUrl: 'https://aac.saavncdn.com/077/0b02a92687d1ae3369b6859f44872e52_320.mp4', duration: '3:20', category: 'pop', genre: 'Pop', language: 'English', playCount: 1950000 },
    { id: 'pop-2', title: 'Starboy', artist: 'The Weeknd', album: 'The Highlights', cover: 'https://c.saavncdn.com/396/The-Highlights-English-2021-20240207045714-500x500.webp', streamUrl: 'https://aac.saavncdn.com/396/b4e570050007b056c662f2a98c9f28ec_320.mp4', duration: '3:50', category: 'pop', genre: 'Pop', language: 'English', playCount: 1420000 },
    { id: 'pop-3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Deluxe)', cover: 'https://c.saavncdn.com/330/Deluxe--English-2017-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/330/635d44dec44e2d50e71f76597e4bb35a_320.mp4', duration: '3:53', category: 'pop', genre: 'Pop', language: 'English', playCount: 1800000 },
    { id: 'pop-4', title: 'Levitating', artist: 'The Blessed Madonna, Dua Lipa', album: 'Club Future Nostalgia (DJ Mix)', cover: 'https://c.saavncdn.com/962/Club-Future-Nostalgia-DJ-Mix-English-2020-20231110075206-500x500.webp', streamUrl: 'https://aac.saavncdn.com/962/15f6e0583438fa7a0e1e74535ebb08e9_320.mp4', duration: '2:54', category: 'pop', genre: 'Pop', language: 'English', playCount: 990000 },
    { id: 'pop-5', title: 'As It Was', artist: 'Harry Styles', album: 'Harry\'s House', cover: 'https://c.saavncdn.com/061/Harry-s-House-English-2022-20220518224913-500x500.webp', streamUrl: 'https://aac.saavncdn.com/061/3cd80564e24ad83245334f8a0e7fb126_320.mp4', duration: '2:47', category: 'pop', genre: 'Pop', language: 'English', playCount: 1100000 },
    { id: 'pop-6', title: 'Cruel Summer', artist: 'Taylor Swift', album: 'Lover (Remix)', cover: 'https://c.saavncdn.com/219/Lover-Remix--English-2019-20191113031000-500x500.webp', streamUrl: 'https://aac.saavncdn.com/219/bed6f6f73cc56ee7ca95db3f3a3081a3_320.mp4', duration: '3:43', category: 'pop', genre: 'Pop', language: 'English', playCount: 1350000 },
    { id: 'edm-1', title: 'Faded', artist: 'Alan Walker', album: 'Different World', cover: 'https://c.saavncdn.com/562/Different-World-English-2018-20181130144209-500x500.webp', streamUrl: 'https://aac.saavncdn.com/562/b331b68fc5e35ff7d7cd7ce0e25158d7_320.mp4', duration: '3:32', category: 'electronic', genre: 'EDM', language: 'English', playCount: 1600000 },
    { id: 'edm-2', title: 'Titanium', artist: 'David Guetta', album: 'Nothing but the Beat', cover: 'https://c.saavncdn.com/551/Nothing-But-The-Beat-English-2011-500x500.webp', streamUrl: 'https://aac.saavncdn.com/551/5a1dff7e97d046f9a6f3e60e428f39d2_320.mp4', duration: '4:05', category: 'electronic', genre: 'EDM', language: 'English', playCount: 890000 },
    { id: 'edm-3', title: 'Closer', artist: 'The Chainsmokers', album: 'Collage EP', cover: 'https://c.saavncdn.com/054/Collage-EP-English-2016-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/054/00363f6aceae57b88fa39f686c5af82e_320.mp4', duration: '4:09', category: 'electronic', genre: 'EDM', language: 'English', playCount: 1250000 },
    { id: 'edm-4', title: 'Animals', artist: 'Sander Van Doorn, Martin Garrix, Dvbbs', album: 'Gold Skies (feat. Aleesia)', cover: 'https://c.saavncdn.com/271/Gold-Skies-feat-Aleesia--English-2014-20190607044621-500x500.webp', streamUrl: 'https://aac.saavncdn.com/271/f2c2bb42ee3eeebf2d30bbb455ae0133_320.mp4', duration: '5:29', category: 'electronic', genre: 'EDM', language: 'Instrumental', playCount: 780000 },
    { id: 'rock-1', title: 'Believer', artist: 'Imagine Dragons', album: 'Evolve', cover: 'https://c.saavncdn.com/248/Evolve-English-2018-20260605220036-500x500.webp', streamUrl: 'https://aac.saavncdn.com/248/46944eb7b4b31f5b0abf5eb2e1be2d2a_320.mp4', duration: '3:24', category: 'rock', genre: 'Rock', language: 'English', playCount: 1700000 },
    { id: 'rock-2', title: 'Radioactive', artist: 'Imagine Dragons', album: 'Night Visions', cover: 'https://c.saavncdn.com/210/Night-Visions-2013-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/210/a6592cefb1b57cf146cf811a747223b4_320.mp4', duration: '3:07', category: 'rock', genre: 'Rock', language: 'English', playCount: 1300000 },
    { id: 'rock-3', title: 'Demons', artist: 'Imagine Dragons', album: 'Night Visions', cover: 'https://c.saavncdn.com/210/Night-Visions-2013-500x500.jpg', streamUrl: 'https://aac.saavncdn.com/210/6878daf1737dcbd57b99677f085952d1_320.mp4', duration: '2:55', category: 'rock', genre: 'Rock', language: 'English', playCount: 980000 },
    { id: 'rock-4', title: 'Bones', artist: 'Imagine Dragons', album: 'Mercury - Acts 1 & 2', cover: 'https://c.saavncdn.com/964/Mercury-Acts-1-2-English-2022-20250618164354-500x500.webp', streamUrl: 'https://aac.saavncdn.com/964/a5e37e9830f26b64a7e809507dcabfbc_320.mp4', duration: '2:45', category: 'rock', genre: 'Rock', language: 'English', playCount: 840000 }
  ];

  // =========================================================================
  // 3. INTERNAL STORAGE & CACHES
  // =========================================================================
  const categoryTracksCache = {};
  const artistDirectory = {};
  let previewAudioElement = null;
  let activePreviewTrackId = null;
  let previewTimeoutTimer = null;

  // Audius Discovery Nodes
  let cachedAudiusNode = null;
  let audiusNodeExpiry = 0;

  async function getAudiusNode() {
    if (cachedAudiusNode && Date.now() < audiusNodeExpiry) {
      return cachedAudiusNode;
    }
    const fallbackNodes = [
      'https://discoveryprovider.audius.co',
      'https://discoveryprovider2.audius.co',
      'https://discoveryprovider3.audius.co',
      'https://audius-discovery-1.cultur3stake.com',
      'https://audius-dp.singapore.creatorseed.com'
    ];
    try {
      const res = await fetch('https://api.audius.co', { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const node = json.data[Math.floor(Math.random() * json.data.length)].replace(/\/+$/, '');
          cachedAudiusNode = node;
          audiusNodeExpiry = Date.now() + 30 * 60 * 1000;
          return node;
        }
      }
    } catch (e) {}
    cachedAudiusNode = fallbackNodes[Math.floor(Math.random() * fallbackNodes.length)];
    audiusNodeExpiry = Date.now() + 5 * 60 * 1000;
    return cachedAudiusNode;
  }

  // =========================================================================
  // 4. DATA NORMALIZER
  // =========================================================================
  function formatSeconds(secs) {
    if (typeof secs !== 'number' || isNaN(secs) || secs < 0) return '3:30';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  function normalizeCatalogTrack(raw) {
    if (!raw) return null;

    const id = String(raw.id || `track-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
    const title = String(raw.title || raw.name || 'Untitled Track').trim();
    const artist = String(raw.artist || raw.artist_name || (raw.user && raw.user.name) || 'Pulse Artist').trim();
    const album = String(raw.album || raw.album_name || 'Single').trim();

    let coverUrl = raw.cover || raw.coverUrl || raw.image || raw.album_image || null;
    if (raw.artwork) {
      coverUrl = raw.artwork['1000x1000'] || raw.artwork['480x480'] || raw.artwork['150x150'] || coverUrl;
    }
    if (coverUrl && (coverUrl.includes('150x150') || coverUrl.includes('50x50'))) {
      coverUrl = coverUrl.replace('150x150', '500x500').replace('50x50', '500x500');
    }
    if (!coverUrl || coverUrl === './pulse-logo.png' || coverUrl.trim() === '') {
      if (typeof window !== 'undefined' && typeof window.generateTrackCover === 'function') {
        coverUrl = window.generateTrackCover(title, artist, raw.category || 'music');
      } else {
        coverUrl = './pulse-logo.png';
      }
    }

    let dur = raw.duration || '3:30';
    if (typeof dur === 'number') {
      dur = formatSeconds(dur);
    }

    const streamUrl = raw.streamUrl || raw.audio || raw.audiodownload || raw.audioUrl || null;
    const previewUrl = raw.previewUrl || raw.preview || streamUrl || null;

    const category = (raw.category || 'pop').toLowerCase();
    const genre = raw.genre || raw.category || 'Pop';
    const source = raw.source || 'Pulse HD Audio Engine (320kbps)';
    const playCount = parseInt(raw.playCount || raw.play_count || raw.listens || 0, 10);

    const norm = {
      id,
      title,
      artist,
      album,
      cover: coverUrl,
      coverUrl,
      duration: dur,
      streamUrl,
      previewUrl,
      category,
      genre,
      source,
      playCount,
      language: raw.language || 'English'
    };

    // Index into global tracks registry
    if (typeof window !== 'undefined') {
      if (!window.TRACKS_REGISTRY) window.TRACKS_REGISTRY = {};
      window.TRACKS_REGISTRY[norm.id] = norm;
    }

    // Index into Artist Directory
    indexTrackToArtist(norm);

    return norm;
  }

  function indexTrackToArtist(track) {
    if (!track || !track.artist) return;
    const primaryArtist = track.artist.split(',')[0].split('&')[0].trim();
    const artistKey = primaryArtist.toLowerCase();

    if (!artistDirectory[artistKey]) {
      artistDirectory[artistKey] = {
        id: `artist-${artistKey.replace(/[^a-z0-9]/g, '-')}`,
        name: primaryArtist,
        avatar: track.cover,
        genres: new Set(),
        tracks: [],
        totalPlays: 0
      };
    }

    const entry = artistDirectory[artistKey];
    if (track.genre) entry.genres.add(track.genre);
    if (!entry.tracks.some(t => t.id === track.id)) {
      entry.tracks.push(track);
      entry.totalPlays += (track.playCount || 1000);
    }
  }

  // Pre-seed all starter tracks immediately into categoryTracksCache and window.TRACKS_REGISTRY
  STARTER_TRACKS.forEach(t => {
    const norm = normalizeCatalogTrack(t);
    if (!categoryTracksCache[norm.category]) {
      categoryTracksCache[norm.category] = [];
    }
    if (!categoryTracksCache[norm.category].some(x => x.id === norm.id)) {
      categoryTracksCache[norm.category].push(norm);
    }
  });

  // =========================================================================
  // 5. MULTI-CATEGORY API FETCHER (Audius & Jamendo)
  // =========================================================================
  async function fetchJamendoCategory(categoryConfig, limit = 20) {
    if (!categoryConfig.jamendoTags && !categoryConfig.jamendoOrder) return [];
    try {
      let url = `${JAMENDO_API_BASE}/tracks/?client_id=${JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo+licenses`;
      if (categoryConfig.jamendoTags) {
        url += `&fuzzytags=${encodeURIComponent(categoryConfig.jamendoTags)}`;
      }
      if (categoryConfig.jamendoOrder) {
        url += `&order=${categoryConfig.jamendoOrder}`;
      } else {
        url += `&order=popularity_total`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        if (json.results && Array.isArray(json.results)) {
          return json.results.map(t => normalizeCatalogTrack({
            id: `jamendo-${t.id}`,
            title: t.name,
            artist: t.artist_name,
            album: t.album_name || 'Jamendo Single',
            cover: t.album_image || t.image,
            duration: parseInt(t.duration, 10) || 210,
            streamUrl: t.audio || t.audiodownload,
            previewUrl: t.audio,
            category: categoryConfig.id,
            genre: (t.musicinfo && t.musicinfo.tags && t.musicinfo.tags.genres && t.musicinfo.tags.genres[0]) || categoryConfig.title,
            source: 'Jamendo Music (Creative Commons)',
            playCount: 15000 + Math.floor(Math.random() * 80000)
          }));
        }
      }
    } catch (e) {
      console.warn(`[Jamendo Category Fetch Notice (${categoryConfig.id})]:`, e.message);
    }
    return [];
  }

  async function fetchAudiusCategory(categoryConfig, limit = 20) {
    if (!categoryConfig.audiusGenre && !categoryConfig.audiusQuery && !categoryConfig.audiusTrending) return [];
    try {
      const node = await getAudiusNode();
      let url = '';
      if (categoryConfig.audiusTrending) {
        url = `${node}/v1/tracks/trending?app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      } else if (categoryConfig.audiusGenre) {
        url = `${node}/v1/tracks/trending?genre=${encodeURIComponent(categoryConfig.audiusGenre)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      } else if (categoryConfig.audiusQuery) {
        url = `${node}/v1/tracks/search?query=${encodeURIComponent(categoryConfig.audiusQuery)}&app_name=${AUDIUS_APP_NAME}&limit=${limit}`;
      }

      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const json = await res.json();
        const rawList = json.data || [];
        if (Array.isArray(rawList)) {
          return rawList.map(t => {
            const artwork = t.artwork ? (t.artwork['1000x1000'] || t.artwork['480x480'] || t.artwork['150x150']) : null;
            return normalizeCatalogTrack({
              id: `audius-${t.id}`,
              title: t.title || 'Untitled',
              artist: (t.user && t.user.name) ? t.user.name : 'Audius Artist',
              album: t.release_date ? `Release ${t.release_date}` : 'Audius',
              cover: artwork,
              duration: Math.round(t.duration || 210),
              streamUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              previewUrl: `${node}/v1/tracks/${t.id}/stream?app_name=${AUDIUS_APP_NAME}`,
              category: categoryConfig.id,
              genre: t.genre || categoryConfig.title,
              source: 'Audius Streaming (320kbps)',
              playCount: t.play_count || (10000 + Math.floor(Math.random() * 50000))
            });
          });
        }
      }
    } catch (e) {
      console.warn(`[Audius Category Fetch Notice (${categoryConfig.id})]:`, e.message);
    }
    return [];
  }

  // =========================================================================
  // 6. PUBLIC CATALOG API & INITIALIZATION
  // =========================================================================
  const catalogService = {
    CATEGORIES,

    /**
     * Synchronously load starter tracks and fetch dynamic categories asynchronously
     */
    async initCatalog() {
      // 1. Synchronously pre-populate starter tracks
      STARTER_TRACKS.forEach(t => {
        const norm = normalizeCatalogTrack(t);
        if (!categoryTracksCache[norm.category]) {
          categoryTracksCache[norm.category] = [];
        }
        if (!categoryTracksCache[norm.category].some(x => x.id === norm.id)) {
          categoryTracksCache[norm.category].push(norm);
        }
      });

      // Render home screen immediately with starter tracks
      if (typeof window !== 'undefined' && typeof window.renderCatalogUI === 'function') {
        window.renderCatalogUI();
      }

      // 2. Fetch all categories from Jamendo & Audius in parallel
      const fetchTasks = Object.values(CATEGORIES).map(async (cat) => {
        const [jamendoTracks, audiusTracks] = await Promise.all([
          fetchJamendoCategory(cat, 18),
          fetchAudiusCategory(cat, 18)
        ]);

        const combined = [...(categoryTracksCache[cat.id] || []), ...jamendoTracks, ...audiusTracks];
        // Deduplicate
        const seen = new Set();
        categoryTracksCache[cat.id] = combined.filter(t => {
          const k = `${t.title}-${t.artist}`.toLowerCase();
          if (seen.has(k) || seen.has(t.id)) return false;
          seen.add(k);
          seen.add(t.id);
          return true;
        });
      });

      await Promise.allSettled(fetchTasks);

      // Re-render with full remote catalog
      if (typeof window !== 'undefined' && typeof window.renderCatalogUI === 'function') {
        window.renderCatalogUI();
      }
    },

    getCategoryTracks(categoryId) {
      if (categoryId === 'all') {
        const allTracks = [];
        Object.values(categoryTracksCache).forEach(list => {
          list.forEach(t => {
            if (!allTracks.some(x => x.id === t.id)) allTracks.push(t);
          });
        });
        if (allTracks.length === 0) {
          STARTER_TRACKS.forEach(t => {
            const norm = normalizeCatalogTrack(t);
            if (!allTracks.some(x => x.id === norm.id)) allTracks.push(norm);
          });
        }
        return allTracks;
      }
      const list = categoryTracksCache[categoryId] || [];
      if (list.length === 0) {
        return STARTER_TRACKS.filter(t => t.category === categoryId).map(normalizeCatalogTrack);
      }
      return list;
    },

    getAllCategories() {
      return Object.values(CATEGORIES);
    },

    getCategory(categoryId) {
      return CATEGORIES[categoryId] || null;
    },

    // --- ARTIST PROFILES & DIRECTORY ---
    getArtistProfile(artistName) {
      if (!artistName) return null;
      const cleanName = artistName.split(',')[0].split('&')[0].trim();
      const key = cleanName.toLowerCase();
      let profile = artistDirectory[key];

      if (!profile) {
        // Find any tracks matching artist
        const tracks = Object.values(window.TRACKS_REGISTRY || {}).filter(t => 
          t.artist && t.artist.toLowerCase().includes(key)
        );
        profile = {
          id: `artist-${key.replace(/[^a-z0-9]/g, '-')}`,
          name: cleanName,
          avatar: tracks.length > 0 ? tracks[0].cover : './pulse-logo.png',
          genres: new Set(tracks.map(t => t.genre || 'Music')),
          tracks: tracks,
          totalPlays: tracks.reduce((acc, t) => acc + (t.playCount || 1000), 0)
        };
      }

      // Sort popular tracks by play count descending
      const sortedTracks = [...profile.tracks].sort((a, b) => (b.playCount || 0) - (a.playCount || 0));

      return {
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar || './pulse-logo.png',
        genres: Array.from(profile.genres),
        trackCount: profile.tracks.length,
        totalPlays: profile.totalPlays,
        popularTracks: sortedTracks
      };
    },

    getFeaturedArtists() {
      return [
        { name: 'Arijit Singh', genre: 'Bollywood & Romantic', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '4.8M' },
        { name: 'The Weeknd', genre: 'Pop & R&B', avatar: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80', listens: '5.2M' },
        { name: 'Diljit Dosanjh', genre: 'Punjabi & Pop', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '3.9M' },
        { name: 'Taylor Swift', genre: 'Pop & Country', avatar: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=80', listens: '6.1M' },
        { name: 'Ed Sheeran', genre: 'Acoustic & Pop', avatar: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=80', listens: '4.4M' },
        { name: 'Karan Aujla', genre: 'Punjabi & Hip-Hop', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '2.8M' },
        { name: 'Dua Lipa', genre: 'Dance Pop & Disco', avatar: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=80', listens: '3.7M' },
        { name: 'Alan Walker', genre: 'EDM & Electro', avatar: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&auto=format&fit=crop&q=80', listens: '3.5M' },
        { name: 'Imagine Dragons', genre: 'Alternative Rock', avatar: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300&auto=format&fit=crop&q=80', listens: '4.1M' },
        { name: 'Sidhu Moose Wala', genre: 'Punjabi Rap', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '4.6M' },
        { name: 'A.R. Rahman', genre: 'Film Score & World', avatar: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80', listens: '5.0M' }
      ];
    },

    getAllArtists() {
      return Object.values(artistDirectory).map(a => ({
        id: a.id,
        name: a.name,
        avatar: a.avatar,
        trackCount: a.tracks.length,
        genres: Array.from(a.genres)
      }));
    },

    // --- 30-SECOND SNIPPET PREVIEW ENGINE ---
    previewTrackSnippet(trackId, onStateChange = null) {
      const track = (window.TRACKS_REGISTRY && window.TRACKS_REGISTRY[trackId]) ||
                    STARTER_TRACKS.find(t => t.id === trackId);
      if (!track) return false;

      // Toggle off if clicking the currently previewing track
      if (activePreviewTrackId === trackId && previewAudioElement && !previewAudioElement.paused) {
        this.stopSnippetPreview();
        if (typeof onStateChange === 'function') onStateChange({ isPreviewing: false, trackId });
        return false;
      }

      this.stopSnippetPreview();

      if (!previewAudioElement) {
        previewAudioElement = new Audio();
        previewAudioElement.id = 'pulse-snippet-preview-audio';
        previewAudioElement.volume = 0.8;
      }

      const streamUrl = track.previewUrl || track.streamUrl || track.audioUrl;
      if (!streamUrl) {
        if (typeof window.showToast === 'function') window.showToast('Preview stream not available for this track', 'warning', 3000);
        return false;
      }

      activePreviewTrackId = trackId;
      previewAudioElement.src = streamUrl;
      previewAudioElement.currentTime = 15; // Start 15s in for chorus/hook

      previewAudioElement.play().then(() => {
        if (typeof onStateChange === 'function') onStateChange({ isPreviewing: true, trackId });
        if (typeof window.showToast === 'function') {
          window.showToast(`🎶 30s Snippet Preview: "${track.title}"`, 'info', 3000);
        }

        // Auto stop after 30 seconds
        clearTimeout(previewTimeoutTimer);
        previewTimeoutTimer = setTimeout(() => {
          this.stopSnippetPreview();
          if (typeof onStateChange === 'function') onStateChange({ isPreviewing: false, trackId });
        }, 30000);
      }).catch(e => {
        console.warn('[Snippet Preview Notice]:', e);
        this.stopSnippetPreview();
      });

      return true;
    },

    stopSnippetPreview() {
      if (previewAudioElement) {
        try {
          previewAudioElement.pause();
          previewAudioElement.removeAttribute('src');
        } catch (e) {}
      }
      activePreviewTrackId = null;
      clearTimeout(previewTimeoutTimer);
      previewTimeoutTimer = null;
      document.querySelectorAll('.snippet-preview-ring').forEach(el => el.classList.remove('active'));
    },

    getActivePreviewTrackId() {
      return activePreviewTrackId;
    }
  };

  root.catalogService = catalogService;
  root.PulseCatalog = catalogService;
  root.normalizeCatalogTrack = normalizeCatalogTrack;

})(typeof window !== 'undefined' ? window : globalThis);
