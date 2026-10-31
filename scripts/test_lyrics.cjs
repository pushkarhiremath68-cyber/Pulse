async function testLyrics() {
  const mod = await import('../src/lyricsService.js');
  const service = mod.default || mod;

  const testTracks = [
    { title: 'Apna Bana Le', artist: 'Arijit Singh' },
    { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao' },
    { title: 'Wishes', artist: 'Hasan Raheem, Talwiinder' },
    { title: 'Pasoori', artist: 'Ali Sethi x Shae Gill' },
    { title: 'Naatu Naatu', artist: 'Rahul Sipligunj' },
    { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander' },
    { title: 'Devi Kavacham', artist: 'Appaji' },
    { title: 'Hanuman Chalisa', artist: 'Hariharan' },
    { title: 'Excuses', artist: 'AP Dhillon' },
    { title: 'Brown Munde', artist: 'AP Dhillon' },
    { title: 'Die With A Smile', artist: 'Lady Gaga & Bruno Mars' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Starboy', artist: 'The Weeknd' },
    { title: 'Despacito', artist: 'Luis Fonsi' }
  ];

  console.log('Testing lyrics retrieval for ' + testTracks.length + ' tracks...');
  let passed = 0;
  for (const t of testTracks) {
    const res = await service.getLyrics(t.title, t.artist, 200);
    if (res && res.lines && res.lines.length > 0 && !res.notFound) {
      console.log(`[PASS] ${t.title} -> ${res.lines.length} lines (Source: ${res.source}, Synced: ${res.isSynced})`);
      console.log(`       Sample: "${res.lines[0].text}"`);
      passed++;
    } else {
      console.log(`[FAIL] ${t.title} -> No lyrics found!`);
    }
  }

  console.log(`\nResult: ${passed}/${testTracks.length} tracks verified successfully!`);
}
testLyrics();

