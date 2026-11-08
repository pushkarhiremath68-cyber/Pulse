import fs from 'fs';

const NEW_ARTISTS = [
  { id: 'vishal-mishra', name: 'Vishal Mishra', origin: 'Lucknow, Uttar Pradesh, India', rank: '#4 Bollywood Playback Maestro', listeners: '32,400,000', followers: '18,200,000', bio: 'Vishal Mishra is an acclaimed Indian music composer and singer renowned for soulful chartbusters across Hindi cinema.' },
  { id: 'lucky-ali', name: 'Lucky Ali', origin: 'Mumbai, Maharashtra, India', rank: '#1 Indian Pop & Indie Icon', listeners: '24,100,000', followers: '15,600,000', bio: 'Lucky Ali is a legendary Indian singer, songwriter, and actor whose distinct melancholic voice defined modern Indipop with timeless anthems like O Sanam.' },
  { id: 'anuradha-paudwal', name: 'Anuradha Paudwal', origin: 'Mumbai, Maharashtra, India', rank: '#1 Sacred Bhajan & Melodic Legend', listeners: '38,500,000', followers: '22,400,000', bio: 'Anuradha Paudwal is an illustrious Indian playback and devotional singer with a Padma Shri award, renowned for monumental Bollywood hits and timeless sacred chants.' },
  { id: 'stebin-ben', name: 'Stebin Ben', origin: 'Bhopal, Madhya Pradesh, India', rank: '#8 Romantic Ballad Star', listeners: '21,800,000', followers: '12,900,000', bio: 'Stebin Ben is one of India\'s most celebrated modern romantic playback vocalists with consecutive multi-million stream releases.' },
  { id: 'neeraj-shridhar', name: 'Neeraj Shridhar', origin: 'Jalandhar, Punjab, India', rank: '#3 Pop-Rock Fusion Pioneer', listeners: '19,500,000', followers: '10,400,000', bio: 'Neeraj Shridhar is the frontman of Bombay Vikings and iconic playback singer behind massive hits like Bhool Bhulaiyaa and Character Dheela.' },
  { id: 'jonita-gandhi', name: 'Jonita Gandhi', origin: 'New Delhi / Toronto, Canada', rank: '#5 Global Fusion Vocalist', listeners: '26,300,000', followers: '14,800,000', bio: 'Jonita Gandhi is a versatile multilingual Indian-Canadian singer celebrated for chart-topping dance anthems in Hindi and Tamil cinema.' },
  { id: 'neeti-mohan', name: 'Neeti Mohan', origin: 'Delhi, India', rank: '#7 Bollywood Playback Star', listeners: '22,900,000', followers: '13,200,000', bio: 'Neeti Mohan is a powerhouse Indian vocalist renowned for energetic Bollywood anthems and soulful acoustic melodies.' },
  { id: 'monali-thakur', name: 'Monali Thakur', origin: 'Kolkata, West Bengal, India', rank: '#6 National Award-Winning Vocalist', listeners: '20,400,000', followers: '11,800,000', bio: 'Monali Thakur is a National Film Award winner celebrated for timeless romantic classics like Moh Moh Ke Dhaage and Sawaar Loon.' },
  { id: 'benny-dayal', name: 'Benny Dayal', origin: 'Abu Dhabi / Kerala, India', rank: '#2 High-Energy Dance Playback Vocalist', listeners: '23,100,000', followers: '13,500,000', bio: 'Benny Dayal is a dynamic playback singer known for high-octane blockbusters like Badtameez Dil and Oscar-winning Jai Ho.' },
  { id: 'javed-ali', name: 'Javed Ali', origin: 'Delhi, India', rank: '#3 Classical & Sufi Playback Maestro', listeners: '28,900,000', followers: '17,100,000', bio: 'Javed Ali is a celebrated Indian playback singer revered for soul-stirring Sufi and romantic masterpieces like Kun Faya Kun and Srivalli.' },
  { id: 'ankit-tiwari', name: 'Ankit Tiwari', origin: 'Kanpur, Uttar Pradesh, India', rank: '#9 Intense Romantic Composer', listeners: '24,700,000', followers: '14,300,000', bio: 'Ankit Tiwari is a Filmfare Award-winning composer and singer celebrated for poignant melodies like Sunn Raha Hai and Galliyan.' },
  { id: 'himesh-reshammiya', name: 'Himesh Reshammiya', origin: 'Mumbai, Maharashtra, India', rank: '#1 Blockbuster Composer & Hitmaker', listeners: '31,200,000', followers: '19,500,000', bio: 'Himesh Reshammiya is a legendary Indian music director, singer, and producer whose high-energy signature style created history in Bollywood.' },
  { id: 'sukhwinder-singh', name: 'Sukhwinder Singh', origin: 'Amritsar, Punjab, India', rank: '#1 Folk & High-Energy Playback Titan', listeners: '29,400,000', followers: '18,600,000', bio: 'Sukhwinder Singh is an internationally acclaimed Indian singer whose thunderous vocals propelled Chaiyya Chaiyya and Academy Award-winning Jai Ho.' },
  { id: 'daler-mehndi', name: 'Daler Mehndi', origin: 'Patna, Bihar, India', rank: '#1 Global Bhangra Ambassador', listeners: '25,600,000', followers: '16,200,000', bio: 'Daler Mehndi is the pioneer of modern energetic Bhangra pop whose iconic anthem Tunak Tunak Tun broke worldwide cultural records.' },
  { id: 'papon', name: 'Papon', origin: 'Guwahati, Assam, India', rank: '#4 Folk & Soulful Playback Icon', listeners: '18,700,000', followers: '11,400,000', bio: 'Angaraag Mahanta (Papon) is an Indian singer, composer, and record producer known for rich baritone folk-fusion and Bollywood hits.' },
  { id: 'shankar-mahadevan', name: 'Shankar Mahadevan', origin: 'Mumbai, Maharashtra, India', rank: '#1 Virtuoso Composer & Playback Legend', listeners: '33,800,000', followers: '20,900,000', bio: 'Shankar Mahadevan is a 5-time National Award-winning singer, composer, and part of the Shankar-Ehsaan-Loy trio, famed for the Breathless album.' },
  { id: 'pankaj-udhas', name: 'Pankaj Udhas', origin: 'Jetpur, Gujarat, India', rank: '#1 Ghazal Maestro', listeners: '21,500,000', followers: '13,800,000', bio: 'Pankaj Udhas was an iconic Indian ghazal singer whose velvety voice gave the world timeless emotional treasures like Chitthi Aayi Hai.' },
  { id: 'manna-dey', name: 'Manna Dey', origin: 'Kolkata, West Bengal, India', rank: '#1 Golden Era Classical Titan', listeners: '27,100,000', followers: '16,500,000', bio: 'Prabodh Chandra Dey (Manna Dey) was a towering Indian playback legend whose classical mastery enriched Indian cinema for five decades.' },
  { id: 'harrdy-sandhu', name: 'Harrdy Sandhu', origin: 'Patiala, Punjab, India', rank: '#2 Modern Punjabi Pop Star', listeners: '28,300,000', followers: '17,400,000', bio: 'Harrdy Sandhu is an Indian singer and actor behind record-smashing viral anthems like Bijlee Bijlee and Kya Baat Ay.' },
  { id: 'ammy-virk', name: 'Ammy Virk', origin: 'Nabha, Punjab, India', rank: '#3 Punjabi Cinema & Melodic Star', listeners: '26,500,000', followers: '16,100,000', bio: 'Ammy Virk is a celebrated Punjabi singer and actor known for deeply emotive ballads like Qismat and Hath Chumme.' },
  { id: 'jassie-gill', name: 'Jassie Gill', origin: 'Jandali, Punjab, India', rank: '#6 Punjabi Romantic Sensation', listeners: '19,800,000', followers: '12,300,000', bio: 'Jassie Gill is a popular Indian singer and actor with top-charting Punjabi romantic hits like Guitar Sikhda and Nikle Currant.' },
  { id: 'shubh', name: 'Shubh', origin: 'Punjab, India', rank: '#1 Global Punjabi Hip-Hop Chart-Topper', listeners: '34,200,000', followers: '21,700,000', bio: 'Shubhneet Singh (Shubh) is an international Punjabi hip-hop artist whose viral tracks like No Love and Cheques topped global streaming charts.' },
  { id: 'divine', name: 'DIVINE', origin: 'Mumbai, Maharashtra, India', rank: '#1 Indian Hip-Hop Vanguard', listeners: '29,800,000', followers: '18,900,000', bio: 'DIVINE (Vivian Fernandes) is the pioneering Mumbai street rapper who ignited the Indian hip-hop revolution with Mirchi and Kohinoor.' },
  { id: 'raftaar', name: 'Raftaar', origin: 'Thiruvananthapuram / Delhi, India', rank: '#2 Desi Hip-Hop Pioneer & Producer', listeners: '23,400,000', followers: '14,600,000', bio: 'Raftaar (Dilin Nair) is an Indian rapper, music composer, and producer known for explosive lyrical flow and Bollywood hits.' },
  { id: 'king', name: 'King', origin: 'New Delhi, India', rank: '#1 Indie-Pop & Hip-Hop Sensation', listeners: '36,500,000', followers: '23,800,000', bio: 'King (Arpan Kumar Chandel) is a chart-topping Indian singer-songwriter whose smash hit Maan Meri Jaan became a global streaming phenomenon.' },
  { id: 'mc-stan', name: 'MC Stan', origin: 'Pune, Maharashtra, India', rank: '#1 New-School Desi Trap Artist', listeners: '21,200,000', followers: '15,400,000', bio: 'MC Stan (Altaf Shaikh) is an Indian rapper and music producer celebrated for raw lyricism and distinctive trap soundscapes.' },
  { id: 'seedhe-maut', name: 'Seedhe Maut', origin: 'New Delhi, India', rank: '#1 Cult Underground Hip-Hop Duo', listeners: '18,900,000', followers: '12,100,000', bio: 'Seedhe Maut (Calm & Encore ABJ) is the premier Indian hip-hop duo revered for complex rhymes and groundbreaking albums like Nayaab.' },
  { id: 'krsna', name: 'KR$NA', origin: 'New Delhi, India', rank: '#1 Lyrical Hip-Hop Titan', listeners: '20,500,000', followers: '13,700,000', bio: 'KR$NA (Krishna Kaul) is widely regarded as one of South Asia\'s finest lyrical rappers, famous for intricate multisyllabic rhymes.' },
  { id: 'emiway-bantai', name: 'Emiway Bantai', origin: 'Bengaluru / Mumbai, India', rank: '#1 Independent YouTube Rap Pioneer', listeners: '27,800,000', followers: '19,300,000', bio: 'Emiway Bantai is an independent Indian rap powerhouse whose viral hits like Machayenge amassed billions of collective streams.' },
  { id: 'k-j-yesudas', name: 'K.J. Yesudas', origin: 'Kochi, Kerala, India', rank: '#1 Classical & Carnatic Playback Maestro', listeners: '28,100,000', followers: '17,800,000', bio: 'Dr. K.J. Yesudas is a legendary Indian Carnatic classical musician and playback singer with 8 National Film Awards across 50,000+ songs.' },
  { id: 's-janaki', name: 'S. Janaki', origin: 'Guntur, Andhra Pradesh, India', rank: '#1 The Nightingale of South India', listeners: '25,400,000', followers: '16,200,000', bio: 'S. Janaki is a celebrated Indian playback singer who recorded thousands of beloved songs in Tamil, Telugu, Kannada, Malayalam, and Hindi.' },
  { id: 'ilaiyaraaja', name: 'Ilaiyaraaja', origin: 'Pannaipuram, Tamil Nadu, India', rank: '#1 The Maestro of Indian Cinema', listeners: '35,600,000', followers: '24,100,000', bio: 'Isaignani Ilaiyaraaja is a legendary Indian composer and arranger who pioneered the fusion of Western symphonic music with Indian folk traditions.' },
  { id: 'm-m-keeravani', name: 'M.M. Keeravani', origin: 'Kovvur, Andhra Pradesh, India', rank: '#1 Oscar & Golden Globe-Winning Composer', listeners: '31,500,000', followers: '19,800,000', bio: 'M.M. Keeravani is an Academy Award-winning Indian composer celebrated globally for the explosive score of RRR and the Baahubali franchise.' },
  { id: 'sanjith-hegde', name: 'Sanjith Hegde', origin: 'Bengaluru, Karnataka, India', rank: '#1 Modern Kannada & South Indian Vocalist', listeners: '17,600,000', followers: '10,900,000', bio: 'Sanjith Hegde is a young Indian singer known for soulful contemporary hits across Kannada, Tamil, Telugu, and indie music.' },
  { id: 'santhosh-narayanan', name: 'Santhosh Narayanan', origin: 'Tiruchirappalli, Tamil Nadu, India', rank: '#3 Contemporary Tamil Fusion Composer', listeners: '24,800,000', followers: '15,200,000', bio: 'Santhosh Narayanan is an innovative Indian music composer and producer known for eclectic instrumentation in modern Tamil cinema.' },
  { id: 'sushin-shyam', name: 'Sushin Shyam', origin: 'Thalassery, Kerala, India', rank: '#1 New-Wave Malayalam Hitmaker', listeners: '22,400,000', followers: '13,900,000', bio: 'Sushin Shyam is a trendsetting music composer and singer behind modern Malayalam blockbusters like Aavesham and Kumbalangi Nights.' },
  { id: 'hesham-abdul-wahab', name: 'Hesham Abdul Wahab', origin: 'Riyadh / Kerala, India', rank: '#2 South Indian Melodic Composer', listeners: '20,800,000', followers: '12,600,000', bio: 'Hesham Abdul Wahab is an Indian music composer and singer whose breakout soundtracks for Hridayam and Kushi captured millions of hearts.' },
  { id: 'harris-jayaraj', name: 'Harris Jayaraj', origin: 'Chennai, Tamil Nadu, India', rank: '#2 Modern Tamil Melodic Virtuoso', listeners: '27,300,000', followers: '18,100,000', bio: 'Harris Jayaraj is an acclaimed Indian composer famous for lush electronic-acoustic melodies in Tamil and Telugu cinema.' },
  { id: 'yuvan-shankar-raja', name: 'Yuvan Shankar Raja', origin: 'Chennai, Tamil Nadu, India', rank: '#1 Youth Icon & Tamil Pop King', listeners: '30,100,000', followers: '20,400,000', bio: 'Yuvan Shankar Raja is an influential Indian composer and singer known for introducing modern hip-hop and electronic sounds to Tamil cinema.' },
  { id: 'kanye-west', name: 'Kanye West', origin: 'Atlanta / Chicago, USA', rank: '#3 Global Hip-Hop Visionary', listeners: '68,400,000', followers: '45,200,000', bio: 'Kanye West (Ye) is an American rapper, producer, and cultural icon with 24 Grammy Awards and billions of streams worldwide.' },
  { id: 'j-cole', name: 'J. Cole', origin: 'Frankfurt / North Carolina, USA', rank: '#4 Conscious Hip-Hop Titan', listeners: '42,100,000', followers: '28,900,000', bio: 'J. Cole is an acclaimed American rapper and producer known for introspective lyricism and multi-platinum albums.' },
  { id: 'doja-cat', name: 'Doja Cat', origin: 'Los Angeles, California, USA', rank: '#5 Global Pop & Rap Superstar', listeners: '56,200,000', followers: '36,800,000', bio: 'Doja Cat is a Grammy Award-winning American rapper and singer known for genre-bending viral anthems like Paint The Town Red.' },
  { id: 'cardi-b', name: 'Cardi B', origin: 'New York City, USA', rank: '#6 Diamond-Certified Rap Queen', listeners: '44,800,000', followers: '29,400,000', bio: 'Cardi B is a Grammy-winning rapper whose record-breaking singles like Bodak Yellow and I Like It made history on the Billboard Hot 100.' },
  { id: 'nicki-minaj', name: 'Nicki Minaj', origin: 'Port of Spain / New York, USA', rank: '#1 The Queen of Rap', listeners: '61,500,000', followers: '41,200,000', bio: 'Nicki Minaj is the best-selling female rapper of all time, acclaimed for peerless flow, theatrical alter egos, and dozens of global hits.' },
  { id: 'stray-kids', name: 'Stray Kids', origin: 'Seoul, South Korea', rank: '#1 K-Pop Self-Producing Powerhouse', listeners: '28,900,000', followers: '19,500,000', bio: 'Stray Kids is a globally acclaimed South Korean group formed by JYP Entertainment, famous for self-produced explosive anthems.' },
  { id: 'twice', name: 'TWICE', origin: 'Seoul, South Korea', rank: '#2 K-Pop Sensation', listeners: '24,600,000', followers: '17,200,000', bio: 'TWICE is an iconic South Korean girl group renowned for infectious pop hooks and record-breaking stadium tours worldwide.' },
  { id: 'newjeans', name: 'NewJeans', origin: 'Seoul, South Korea', rank: '#1 Gen-Z K-Pop Revolution', listeners: '26,800,000', followers: '18,400,000', bio: 'NewJeans is an acclaimed South Korean girl group that revolutionized modern K-pop with minimalist Y2K R&B aesthetics.' },
  { id: 'avicii', name: 'Avicii', origin: 'Stockholm, Sweden', rank: '#1 Melodic EDM Legend', listeners: '45,300,000', followers: '32,100,000', bio: 'Tim Bergling (Avicii) was a Swedish DJ, remixer, and music producer whose pioneering folk-EDM sound created timeless global anthems.' },
  { id: 'marshmello', name: 'Marshmello', origin: 'Philadelphia, Pennsylvania, USA', rank: '#2 Electronic Pop Hitmaker', listeners: '48,700,000', followers: '35,600,000', bio: 'Marshmello is a multi-platinum electronic music producer and DJ renowned for upbeat pop collaborations and global hits.' },
  { id: 'dj-snake', name: 'DJ Snake', origin: 'Paris, France', rank: '#3 Global Bass & Trap Maestro', listeners: '41,200,000', followers: '27,800,000', bio: 'DJ Snake is a Grammy-nominated French DJ and producer behind international mega-hits like Lean On, Let Me Love You, and Taki Taki.' },
  { id: 'sia', name: 'Sia', origin: 'Adelaide, Australia', rank: '#1 Powerhouse Songwriter & Vocalist', listeners: '52,900,000', followers: '38,400,000', bio: 'Sia Furler is an Australian singer-songwriter whose unmistakable vocal power propelled diamond-certified anthems like Chandelier and Cheap Thrills.' },
  { id: 'the-chainsmokers', name: 'The Chainsmokers', origin: 'New York City, USA', rank: '#1 Electronic Pop Duo', listeners: '46,100,000', followers: '33,500,000', bio: 'The Chainsmokers (Alex Pall & Drew Taggart) are an American DJ and production duo behind record-breaking classics like Closer.' },
  { id: 'one-direction', name: 'One Direction', origin: 'London, United Kingdom', rank: '#1 2010s Global Boy Band Phenomenon', listeners: '43,800,000', followers: '31,200,000', bio: 'One Direction is one of the highest-selling boy bands in pop history, propelled by worldwide anthems like What Makes You Beautiful.' },
  { id: 'sam-smith', name: 'Sam Smith', origin: 'London, United Kingdom', rank: '#2 Soulful Pop Vocalist', listeners: '49,200,000', followers: '34,900,000', bio: 'Sam Smith is an Oscar and 5-time Grammy Award-winning English singer known for soaring vocal delivery on hits like Stay With Me and Unholy.' },
  { id: 'david-guetta', name: 'David Guetta', origin: 'Paris, France', rank: '#1 The Grandfather of Modern EDM', listeners: '63,700,000', followers: '44,500,000', bio: 'David Guetta is a French DJ, record producer, and 2-time Grammy winner with over 50 million album sales and dozens of #1 club anthems.' },
  { id: 'mithoon', name: 'Mithoon', origin: 'Mumbai, Maharashtra, India', rank: '#2 Soulful Bollywood Melodic Composer', listeners: '27,400,000', followers: '17,200,000', bio: 'Mithoon Sharma is an Indian Hindi film music director and lyricist renowned for the monumental anthem Tum Hi Ho and Sanam Re.' },
  { id: 'sachin-jigar', name: 'Sachin-Jigar', origin: 'Gujarat / Mumbai, India', rank: '#3 Versatile Bollywood Composer Duo', listeners: '29,800,000', followers: '18,500,000', bio: 'Sachin Sanghvi and Jigar Saraiya are an Indian music composer duo famous for timeless hits like Apna Bana Le and Saibo.' },
  { id: 'ajay-atul', name: 'Ajay-Atul', origin: 'Pune, Maharashtra, India', rank: '#1 Symphonic & Orchestral Titans', listeners: '26,900,000', followers: '16,800,000', bio: 'Ajay and Atul Gogavale are a National Award-winning Indian music composer duo celebrated for massive symphonic masterworks like Zingaat.' },
  { id: 'palak-muchhal', name: 'Palak Muchhal', origin: 'Indore, Madhya Pradesh, India', rank: '#8 Melodic Playback Sweetheart', listeners: '23,500,000', followers: '14,700,000', bio: 'Palak Muchhal is an Indian playback singer and philanthropist recognized for soulful hits like Kaun Tujhe and Prem Ratan Dhan Payo.' },
  { id: 'tulsi-kumar', name: 'Tulsi Kumar', origin: 'New Delhi, India', rank: '#9 Popular Bollywood Playback Star', listeners: '21,400,000', followers: '13,500,000', bio: 'Tulsi Kumar is an Indian playback singer celebrated for viral Bollywood chartbusters like O Saki Saki and Tera Ban Jaunga.' }
];

async function fetchArtistData(artist) {
  console.log(`[Processing ${artist.name}]`);
  
  // 1. Fetch Portrait from Deezer
  let photo = '';
  try {
    const dRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(artist.name)}`);
    const dData = await dRes.json();
    const exact = dData.data?.find(a => a.name.toLowerCase() === artist.name.toLowerCase());
    const candidate = exact || dData.data?.[0];
    if (candidate && (candidate.picture_xl || candidate.picture_big)) {
      photo = candidate.picture_xl || candidate.picture_big;
    }
  } catch (e) {
    console.warn(`Deezer failed for ${artist.name}:`, e.message);
  }

  // Fallback to Wikipedia if photo is missing
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

  // 2. Fetch Top 10 Songs from iTunes Search API
  let tracks = [];
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(artist.name)}&entity=song&limit=30`;
    const itunesRes = await fetch(itunesUrl);
    const itunesData = await itunesRes.json();
    const norm = artist.name.toLowerCase();

    const seenTitles = new Set();
    const matched = (itunesData.results || []).filter(t => {
      const art = (t.artistName || '').toLowerCase();
      const title = (t.trackName || '').toLowerCase();
      if (seenTitles.has(title)) return false;
      seenTitles.add(title);
      return art.includes(norm) || norm.includes(art);
    });

    tracks = matched.slice(0, 10).map((t, idx) => ({
      id: `itunes-${t.trackId || idx}`,
      ytId: '',
      title: t.trackName,
      artist: t.artistName,
      album: t.collectionName || 'Studio Master Single',
      coverUrl: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '1000x1000bb') : (photo || ''),
      duration: Math.round((t.trackTimeMillis || 215000) / 1000),
      plays: (950000000 - (idx * 60000000)).toLocaleString()
    }));
  } catch (e) {
    console.warn(`iTunes failed for ${artist.name}:`, e.message);
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
  console.log(`Starting extraction for ${NEW_ARTISTS.length} artists...`);
  const resolved = {};

  for (let i = 0; i < NEW_ARTISTS.length; i++) {
    const a = NEW_ARTISTS[i];
    try {
      const data = await fetchArtistData(a);
      if (data.topTracks.length >= 5 && data.banner) {
        resolved[data.id] = data;
        console.log(`  ✅ [${i + 1}/${NEW_ARTISTS.length}] ${data.name}: ${data.topTracks.length} tracks, Photo: ${data.banner ? 'OK' : 'FAIL'}`);
      } else {
        console.warn(`  ⚠️ [${i + 1}/${NEW_ARTISTS.length}] ${data.name} had insufficient tracks (${data.topTracks.length})`);
      }
    } catch (e) {
      console.error(`  ❌ Error processing ${a.name}:`, e.message);
    }
    // Small polite delay between API calls
    await new Promise(r => setTimeout(r, 120));
  }

  fs.writeFileSync('scripts/expanded_artists_data.json', JSON.stringify(resolved, null, 2), 'utf8');
  console.log(`\n🎉 Extracted and saved ${Object.keys(resolved).length} artists to scripts/expanded_artists_data.json!`);
}

run();
