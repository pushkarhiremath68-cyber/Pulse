import fs from 'fs';

const PAKISTANI_BLACKLIST = [
  'atif aslam', 'rahat fateh ali khan', 'ali zafar', 'shafqat amanat ali',
  'farhan saeed', 'ghulam ali', 'mehdi hassan', 'nusrat fateh ali khan',
  'momina mustehsan', 'mustafa zahid', 'asif aslam', 'abida parveen',
  'sajjad ali', 'quratulain balouch', 'bilal saeed', 'aimal khan'
];

function isPakistani(artistString = '') {
  const norm = artistString.toLowerCase();
  return PAKISTANI_BLACKLIST.some(bad => norm.includes(bad));
}

const REMAINING_ARTISTS = [
  { id: 'divine', name: 'DIVINE', searchQ: 'DIVINE Vivian', origin: 'Mumbai, Maharashtra, India', rank: '#1 Indian Hip-Hop Vanguard', listeners: '29,800,000', followers: '18,900,000', bio: 'DIVINE (Vivian Fernandes) is the pioneering Mumbai street rapper who ignited the Indian hip-hop revolution with Mirchi, Kohinoor, and 3:59 AM.' },
  { id: 'king', name: 'King', searchQ: 'King Maan Meri Jaan', origin: 'New Delhi, India', rank: '#1 Indie-Pop & Hip-Hop Sensation', listeners: '36,500,000', followers: '23,800,000', bio: 'King (Arpan Kumar Chandel) is a chart-topping Indian singer-songwriter whose smash hits like Maan Meri Jaan and Tu Aake Dekhle became global streaming phenomena.' },
  { id: 'mc-stan', name: 'MC Stan', searchQ: 'MC Stan', origin: 'Pune, Maharashtra, India', rank: '#1 New-School Desi Trap Artist', listeners: '21,200,000', followers: '15,400,000', bio: 'MC Stan (Altaf Shaikh) is an Indian rapper and music producer celebrated for raw lyricism, unique flow, and distinctive trap soundscapes.' },
  { id: 'k-j-yesudas', name: 'K.J. Yesudas', searchQ: 'K. J. Yesudas', origin: 'Kochi, Kerala, India', rank: '#1 Classical & Carnatic Playback Maestro', listeners: '28,100,000', followers: '17,800,000', bio: 'Dr. K.J. Yesudas is a legendary Indian Carnatic classical musician and playback singer with 8 National Film Awards across 50,000+ recorded songs.' },
  { id: 'hesham-abdul-wahab', name: 'Hesham Abdul Wahab', searchQ: 'Hesham Abdul Wahab', origin: 'Riyadh / Kerala, India', rank: '#2 South Indian Melodic Composer', listeners: '20,800,000', followers: '12,600,000', bio: 'Hesham Abdul Wahab is an Indian music composer and playback singer whose breakout soundtracks for Hridayam and Kushi captured millions of hearts.' },
  { id: 'yuvan-shankar-raja', name: 'Yuvan Shankar Raja', searchQ: 'Yuvan Shankar Raja', origin: 'Chennai, Tamil Nadu, India', rank: '#1 Youth Icon & Tamil Pop King', listeners: '30,100,000', followers: '20,400,000', bio: 'Yuvan Shankar Raja is an influential Indian composer and singer known for introducing modern hip-hop and electronic sounds to Tamil cinema.' },
  { id: 'kanye-west', name: 'Kanye West', searchQ: 'Kanye West', origin: 'Atlanta / Chicago, USA', rank: '#3 Global Hip-Hop Visionary', listeners: '68,400,000', followers: '45,200,000', bio: 'Kanye West (Ye) is an American rapper, producer, and cultural icon with 24 Grammy Awards and billions of streams worldwide.' },
  { id: 'j-cole', name: 'J. Cole', searchQ: 'J. Cole', origin: 'Frankfurt / North Carolina, USA', rank: '#4 Conscious Hip-Hop Titan', listeners: '42,100,000', followers: '28,900,000', bio: 'J. Cole is an acclaimed American rapper and producer known for introspective lyricism and multi-platinum albums like 2014 Forest Hills Drive.' },
  { id: 'doja-cat', name: 'Doja Cat', searchQ: 'Doja Cat', origin: 'Los Angeles, California, USA', rank: '#5 Global Pop & Rap Superstar', listeners: '56,200,000', followers: '36,800,000', bio: 'Doja Cat is a Grammy Award-winning American rapper and singer known for genre-bending viral anthems like Paint The Town Red and Woman.' },
  { id: 'cardi-b', name: 'Cardi B', searchQ: 'Cardi B', origin: 'New York City, USA', rank: '#6 Diamond-Certified Rap Queen', listeners: '44,800,000', followers: '29,400,000', bio: 'Cardi B is a Grammy-winning rapper whose record-breaking singles like Bodak Yellow and I Like It made history on the Billboard Hot 100.' },
  { id: 'nicki-minaj', name: 'Nicki Minaj', searchQ: 'Nicki Minaj', origin: 'Port of Spain / New York, USA', rank: '#1 The Queen of Rap', listeners: '61,500,000', followers: '41,200,000', bio: 'Nicki Minaj is the best-selling female rapper of all time, acclaimed for peerless flow, theatrical alter egos, and dozens of global hits like Super Bass and Starships.' },
  { id: 'stray-kids', name: 'Stray Kids', searchQ: 'Stray Kids', origin: 'Seoul, South Korea', rank: '#1 K-Pop Self-Producing Powerhouse', listeners: '28,900,000', followers: '19,500,000', bio: 'Stray Kids is a globally acclaimed South Korean group formed by JYP Entertainment, famous for self-produced explosive anthems like God\'s Menu and Maniac.' },
  { id: 'twice', name: 'TWICE', searchQ: 'TWICE', origin: 'Seoul, South Korea', rank: '#2 K-Pop Sensation', listeners: '24,600,000', followers: '17,200,000', bio: 'TWICE is an iconic South Korean girl group renowned for infectious pop hooks and record-breaking stadium tours worldwide.' },
  { id: 'avicii', name: 'Avicii', searchQ: 'Avicii', origin: 'Stockholm, Sweden', rank: '#1 Melodic EDM Legend', listeners: '45,300,000', followers: '32,100,000', bio: 'Tim Bergling (Avicii) was a Swedish DJ, remixer, and music producer whose pioneering folk-EDM sound created timeless global anthems like Wake Me Up and Levels.' },
  { id: 'sia', name: 'Sia', searchQ: 'Sia', origin: 'Adelaide, Australia', rank: '#1 Powerhouse Songwriter & Vocalist', listeners: '52,900,000', followers: '38,400,000', bio: 'Sia Furler is an Australian singer-songwriter whose unmistakable vocal power propelled diamond-certified anthems like Chandelier, Cheap Thrills, and Unstoppable.' },
  { id: 'one-direction', name: 'One Direction', searchQ: 'One Direction', origin: 'London, United Kingdom', rank: '#1 2010s Global Boy Band Phenomenon', listeners: '43,800,000', followers: '31,200,000', bio: 'One Direction is one of the highest-selling boy bands in pop history, propelled by worldwide anthems like What Makes You Beautiful, Night Changes, and Story of My Life.' },
  { id: 'david-guetta', name: 'David Guetta', searchQ: 'David Guetta', origin: 'Paris, France', rank: '#1 The Grandfather of Modern EDM', listeners: '63,700,000', followers: '44,500,000', bio: 'David Guetta is a French DJ, record producer, and 2-time Grammy winner with over 50 million album sales and global hits like Titanium and I\'m Good (Blue).' },
  { id: 'mithoon', name: 'Mithoon', searchQ: 'Mithoon', origin: 'Mumbai, Maharashtra, India', rank: '#2 Soulful Bollywood Melodic Composer', listeners: '27,400,000', followers: '17,200,000', bio: 'Mithoon Sharma is an Indian Hindi film music director and lyricist renowned for monumental emotional anthems like Tum Hi Ho, Sanam Re, and Phir Bhi Tumko Chaahunga.' },
  { id: 'sachin-jigar', name: 'Sachin-Jigar', searchQ: 'Sachin-Jigar', origin: 'Gujarat / Mumbai, India', rank: '#3 Versatile Bollywood Composer Duo', listeners: '29,800,000', followers: '18,500,000', bio: 'Sachin Sanghvi and Jigar Saraiya are an Indian music composer duo famous for timeless hits like Apna Bana Le, Saibo, and Tere Vaaste.' },
  { id: 'ajay-atul', name: 'Ajay-Atul', searchQ: 'Ajay-Atul', origin: 'Pune, Maharashtra, India', rank: '#1 Symphonic & Orchestral Titans', listeners: '26,900,000', followers: '16,800,000', bio: 'Ajay and Atul Gogavale are a National Award-winning Indian music composer duo celebrated for massive symphonic masterworks like Zingaat, Deva Shree Ganesha, and Yad Lagla.' },
  { id: 'palak-muchhal', name: 'Palak Muchhal', searchQ: 'Palak Muchhal', origin: 'Indore, Madhya Pradesh, India', rank: '#8 Melodic Playback Sweetheart', listeners: '23,500,000', followers: '14,700,000', bio: 'Palak Muchhal is an Indian playback singer and philanthropist recognized for soulful hits like Kaun Tujhe, Prem Ratan Dhan Payo, and Chahun Main Ya Naa.' }
];

const HEADERS = {
  'User-Agent': 'PulseMusic/2.4 (Macintosh; Intel Mac OS X 10_15_7)',
  'Accept': 'application/json, text/plain, */*'
};

async function fetchArtistData(artist) {
  console.log(`[Processing ${artist.name}]`);

  // 1. Fetch Portrait from Deezer
  let photo = '';
  try {
    const dRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist.name)}`);
    const dData = await dRes.json();
    const sorted = (dData.data || []).sort((a,b) => (b.nb_fan || 0) - (a.nb_fan || 0));
    const exact = sorted.find(a => a.name.toLowerCase() === artist.name.toLowerCase());
    const candidate = exact || sorted[0];
    if (candidate && (candidate.picture_xl || candidate.picture_big)) {
      photo = candidate.picture_xl || candidate.picture_big;
    }
  } catch (e) {
    console.warn(`Deezer error for ${artist.name}:`, e.message);
  }

  // 2. Fallback to Wikipedia for photo if missing
  if (!photo) {
    try {
      const wUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artist.name.replace(/ /g, '_'))}`;
      const wRes = await fetch(wUrl, { headers: { 'User-Agent': 'PulseMusicApp/2.4 (contact: pushkarhiremath68@gmail.com)' } });
      const wData = await wRes.json();
      if (wData.thumbnail?.source || wData.originalimage?.source) {
        photo = wData.originalimage?.source || wData.thumbnail?.source;
      }
    } catch (e) {}
  }

  // 3. Fetch Top 10 Songs from iTunes Search API with custom User-Agent
  let tracks = [];
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artist.searchQ || artist.name)}&entity=song&limit=40`;
    const itunesRes = await fetch(itunesUrl, { headers: HEADERS });
    if (itunesRes.ok) {
      const itunesData = await itunesRes.json();
      const norm = artist.name.toLowerCase();
      const seenTitles = new Set();

      const matched = (itunesData.results || []).filter(t => {
        const art = (t.artistName || '').toLowerCase();
        const title = (t.trackName || '').toLowerCase();
        // Check blacklist
        if (isPakistani(art) || isPakistani(title)) return false;
        if (seenTitles.has(title)) return false;
        seenTitles.add(title);
        return true;
      });

      tracks = matched.slice(0, 10).map((t, idx) => ({
        id: `itunes-${t.trackId || idx}`,
        ytId: '',
        title: t.trackName,
        artist: t.artistName,
        album: t.collectionName || 'Studio Master Single',
        coverUrl: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '1000x1000bb') : (photo || ''),
        duration: Math.round((t.trackTimeMillis || 215000) / 1000),
        plays: (950000000 - (idx * 55000000)).toLocaleString()
      }));
    }
  } catch (e) {
    console.warn(`iTunes error for ${artist.name}:`, e.message);
  }

  // Fallback cover if photo still missing
  if (!photo && tracks[0]?.coverUrl) {
    photo = tracks[0].coverUrl;
  }

  return {
    id: artist.id,
    name: artist.name,
    monthlyListeners: artist.listeners,
    followersCount: artist.followers,
    worldRank: artist.rank,
    origin: artist.origin,
    bio: artist.bio,
    banner: photo,
    avatar: photo,
    socials: {
      instagram: `https://www.instagram.com/${artist.id.replace(/-/g, '')}/`,
      x: `https://x.com/${artist.id.replace(/-/g, '')}`,
      facebook: `https://www.facebook.com/${artist.id.replace(/-/g, '')}/`,
      youtube: `https://www.youtube.com/@${artist.id.replace(/-/g, '')}`
    },
    tourInfo: {
      tourName: `${artist.name} Live World Tour 2026`,
      status: "Tickets Live",
      dates: "Mumbai, London, Dubai, New York, Toronto, Sydney",
      ticketUrl: "https://in.bookmyshow.com/explore/events"
    },
    topTracks: tracks
  };
}

async function run() {
  const existingPath = 'scripts/expanded_artists_data.json';
  let database = {};
  if (fs.existsSync(existingPath)) {
    database = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
  }

  console.log(`Currently loaded ${Object.keys(database).length} artists. Processing remaining ${REMAINING_ARTISTS.length}...`);

  for (let i = 0; i < REMAINING_ARTISTS.length; i++) {
    const a = REMAINING_ARTISTS[i];
    try {
      const data = await fetchArtistData(a);
      if (data.topTracks.length >= 5 && data.banner) {
        database[data.id] = data;
        console.log(`  ✅ [${i + 1}/${REMAINING_ARTISTS.length}] ${data.name}: ${data.topTracks.length} tracks, Photo: OK`);
      } else {
        console.warn(`  ⚠️ [${i + 1}/${REMAINING_ARTISTS.length}] ${data.name} tracks: ${data.topTracks.length}, photo: ${Boolean(data.banner)}`);
      }
    } catch (e) {
      console.error(`  ❌ Failed ${a.name}:`, e.message);
    }
    // Polite 800ms delay between iTunes calls to stay well within limits
    await new Promise(r => setTimeout(r, 800));
  }

  fs.writeFileSync(existingPath, JSON.stringify(database, null, 2), 'utf8');
  console.log(`\n🎉 Total artists in ${existingPath}: ${Object.keys(database).length}`);
}

run();

