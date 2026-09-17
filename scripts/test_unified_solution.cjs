async function testFullSolution() {
  console.log('=== Testing New Unified YouTube ID & Search Solution ===\n');

  // Test 1: Invidious search on invidious.f5.si
  console.log('1. Testing Invidious search on invidious.f5.si:');
  try {
    const res = await fetch('https://invidious.f5.si/api/v1/search?q=' + encodeURIComponent('Kesariya Pritam') + '&type=video', {
      headers: { 'Origin': 'https://pulse-music-app-68.web.app' }
    });
    console.log('   Status:', res.status, 'CORS:', res.headers.get('access-control-allow-origin'));
    const data = await res.json();
    console.log('   Count:', data.length, 'First Video ID:', data[0]?.videoId, 'Title:', data[0]?.title);
  } catch (e) {
    console.log('   Failed:', e.message);
  }

  // Test 2: Piped search on pipedapi.ducks.party
  console.log('\n2. Testing Piped search on pipedapi.ducks.party:');
  try {
    const res = await fetch('https://pipedapi.ducks.party/search?q=' + encodeURIComponent('Shape of You Ed Sheeran') + '&filter=music_songs', {
      headers: { 'Origin': 'https://pulse-music-app-68.web.app' }
    });
    console.log('   Status:', res.status, 'CORS:', res.headers.get('access-control-allow-origin'));
    const data = await res.json();
    const items = data.items || data;
    const firstId = (items[0]?.videoId || items[0]?.url || '').replace('/watch?v=', '').replace('/streams/', '').trim();
    console.log('   Count:', items.length, 'First Video ID:', firstId, 'Title:', items[0]?.title);
  } catch (e) {
    console.log('   Failed:', e.message);
  }

  // Test 3: Dynamic Invidious API
  console.log('\n3. Testing Invidious Instance Registry:');
  try {
    const res = await fetch('https://api.invidious.io/instances.json?sort_by=health');
    console.log('   Status:', res.status, 'CORS:', res.headers.get('access-control-allow-origin'));
    const instances = await res.json();
    const healthy = instances.filter(i => i[1]?.type === 'https' && i[1]?.cors === true && i[1]?.api === true);
    console.log('   Found healthy CORS instances:', healthy.length);
  } catch (e) {
    console.log('   Failed:', e.message);
  }

  // Test 4: Random unknown songs resolution test
  const testSongs = [
    { title: 'Tum Hi Ho', artist: 'Arijit Singh' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Chaleya', artist: 'Arijit Singh' },
    { title: 'Hass Hass', artist: 'Diljit Dosanjh' }
  ];

  console.log('\n4. Testing Song ID Resolution for 4 test songs:');
  for (const song of testSongs) {
    try {
      const q = `${song.title} ${song.artist}`;
      const res = await fetch('https://invidious.f5.si/api/v1/search?q=' + encodeURIComponent(q) + '&type=video', {
        headers: { 'Origin': 'https://pulse-music-app-68.web.app' },
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const d = await res.json();
        console.log(`   ✓ "${song.title}" -> ytId: ${d[0]?.videoId} (${d[0]?.title})`);
      } else {
        console.log(`   ✗ "${song.title}" failed with status ${res.status}`);
      }
    } catch (e) {
      console.log(`   ✗ "${song.title}" error: ${e.message}`);
    }
  }
}

testFullSolution();
