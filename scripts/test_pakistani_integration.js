import { searchCatalogTracks, PERMANENT_STREAM_MAP, getArtistDetails } from '../src/catalogService.js';
import { getLyrics } from '../src/lyricsService.js';

async function runTests() {
  console.log('--- TEST 1: Catalog Search for "Wishes" ---');
  const wishesTracks = searchCatalogTracks('wishes');
  console.log(`Found ${wishesTracks.length} tracks matching "wishes":`);
  wishesTracks.forEach(t => console.log(` - [${t.id}] ${t.title} by ${t.artist} (ytId: ${t.ytId})`));
  if (wishesTracks.length === 0) throw new Error('Failed to find Wishes');

  console.log('\n--- TEST 2: Catalog Search for "Pakistani" ---');
  const pakistaniTracks = searchCatalogTracks('pakistani');
  console.log(`Found ${pakistaniTracks.length} tracks matching "pakistani":`);
  pakistaniTracks.forEach(t => console.log(` - [${t.id}] ${t.title} by ${t.artist}`));
  if (pakistaniTracks.length < 5) throw new Error('Expected at least 5 Pakistani tracks');

  console.log('\n--- TEST 3: Master Audio Stream Verification ---');
  const testTracks = ['oE7lU2qj4rY', '5Eqb_-j3FDA', 'zydG_QW8m68', '7D4vNcK6D38', 'kw4tT7SCmaY', 'cM7_7_u0b3A', 'Q7wPzK5m91c'];
  for (const ytId of testTracks) {
    const stream = PERMANENT_STREAM_MAP[ytId];
    if (!stream || typeof stream !== 'string' || !stream.startsWith('http')) {
      throw new Error(`Missing audio stream in PERMANENT_STREAM_MAP for ${ytId}`);
    }
    console.log(` ✓ Audio Stream available for ${ytId}: ${stream.substring(0, 65)}...`);
  }

  console.log('\n--- TEST 4: Live Synced Lyrics for "Wishes" ---');
  const wishesLyrics = await getLyrics('Wishes', 'Hasan Raheem');
  console.log('Wishes Lyrics:', {
    isSynced: wishesLyrics?.isSynced,
    linesCount: wishesLyrics?.lines?.length,
    source: wishesLyrics?.source,
    firstLine: wishesLyrics?.lines?.[0],
    secondLine: wishesLyrics?.lines?.[1],
  });
  if (!wishesLyrics || !wishesLyrics.isSynced || wishesLyrics.lines.length < 10) {
    throw new Error('Wishes synced lyrics failed');
  }

  console.log('\n--- TEST 5: Live Synced Lyrics for "Pasoori" & "Kahani Suno" ---');
  const pasooriLyrics = await getLyrics('Pasoori', 'Ali Sethi');
  console.log('Pasoori Lyrics lines:', pasooriLyrics?.lines?.length, 'isSynced:', pasooriLyrics?.isSynced);
  if (!pasooriLyrics || !pasooriLyrics.isSynced) throw new Error('Pasoori lyrics failed');

  const kahaniLyrics = await getLyrics('Kahani Suno 2.0', 'Kaifi Khalil');
  console.log('Kahani Suno Lyrics lines:', kahaniLyrics?.lines?.length, 'isSynced:', kahaniLyrics?.isSynced);
  if (!kahaniLyrics || !kahaniLyrics.isSynced) throw new Error('Kahani Suno lyrics failed');

  const aadatLyrics = await getLyrics('Aadat', 'Atif Aslam');
  console.log('Aadat Lyrics lines:', aadatLyrics?.lines?.length, 'isSynced:', aadatLyrics?.isSynced);
  if (!aadatLyrics || !aadatLyrics.isSynced) throw new Error('Aadat lyrics failed');

  console.log('\n--- TEST 6: Artist Discography Verification ---');
  const atif = getArtistDetails('Atif Aslam');
  console.log(`Atif Aslam monthly listeners: ${atif.monthlyListeners}, top tracks: ${atif.topTracks.length}`);
  const hasan = getArtistDetails('Hasan Raheem');
  console.log(`Hasan Raheem monthly listeners: ${hasan.monthlyListeners}, top tracks: ${hasan.topTracks.length}`);

  console.log('\n🎉 ALL PAKISTANI & WISHES INTEGRATION TESTS PASSED PERFECTLY!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
