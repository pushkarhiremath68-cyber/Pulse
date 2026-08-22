async function testAPIs() {
  console.log('=== Testing External & Internal Search & Stream APIs ===\n');

  // 1. iTunes search
  console.log('1. Testing iTunes search:');
  try {
    const res = await fetch('https://itunes.apple.com/search?term=Kesariya&entity=song&limit=3');
    const data = await res.json();
    console.log(`   iTunes returned ${data.resultCount} results:`);
    data.results.forEach(r => console.log(`   - ${r.trackName} by ${r.artistName} (preview: ${r.previewUrl ? 'yes' : 'no'})`));
  } catch (e) {
    console.log('   iTunes failed:', e.message);
  }

  // 2. JioSaavn public API (saavn.dev)
  console.log('\n2. Testing saavn.dev:');
  try {
    const res = await fetch('https://saavn.dev/api/search/songs?query=Kesariya&limit=2');
    const data = await res.json();
    console.log(`   saavn.dev status: ${res.status}, success: ${data.success}`);
    if (data.data?.results) {
      console.log(`   Results count: ${data.data.results.length}`);
      data.data.results.forEach(r => console.log(`   - ${r.name} by ${r.primaryArtists} (downloadUrl: ${r.downloadUrl?.length || 0})`));
    }
  } catch (e) {
    console.log('   saavn.dev failed:', e.message);
  }

  // 3. JioSaavn Direct Search (api.jiosaavn.com)
  console.log('\n3. Testing JioSaavn Direct API:');
  try {
    const res = await fetch('https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=Kesariya', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const data = await res.json();
    console.log(`   JioSaavn direct status: ${res.status}, count: ${data.results?.length}`);
    data.results?.forEach(r => console.log(`   - ${r.song} by ${r.singers} (enc_url: ${r.encrypted_media_url ? 'yes' : 'no'})`));
  } catch (e) {
    console.log('   JioSaavn direct failed:', e.message);
  }

  // 4. Piped nodes
  console.log('\n4. Testing Piped Nodes:');
  const pipedNodes = [
    'https://api.piped.privacydev.net',
    'https://pipedapi.kavin.rocks',
    'https://piped-api.garudalinux.org',
    'https://pa.il.ax',
    'https://pipedapi.tokhmi.xyz',
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.r4fo.com'
  ];
  for (const n of pipedNodes) {
    try {
      const res = await fetch(`${n}/streams/BddP6PYo2gs`, { signal: AbortSignal.timeout(3000) });
      console.log(`   ${n} -> status ${res.status}`);
    } catch (e) {
      console.log(`   ${n} -> failed (${e.message})`);
    }
  }

  // 5. Invidious nodes
  console.log('\n5. Testing Invidious Nodes:');
  const invNodes = [
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://invidious.private.coffee',
    'https://invidious.jing.rocks',
    'https://yewtu.be',
    'https://vid.puffyan.us'
  ];
  for (const n of invNodes) {
    try {
      const res = await fetch(`${n}/api/v1/videos/BddP6PYo2gs?fields=title,formatStreams`, { signal: AbortSignal.timeout(3000) });
      console.log(`   ${n} -> status ${res.status}`);
    } catch (e) {
      console.log(`   ${n} -> failed (${e.message})`);
    }
  }
}

testAPIs();
