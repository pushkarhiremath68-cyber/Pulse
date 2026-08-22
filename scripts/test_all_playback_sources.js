
async function testSources() {
  console.log('--- Testing JioSaavn API ---');
  try {
    const q = 'Blinding Lights';
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(q)}`;
    const res = await fetch(saavnUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('JioSaavn status:', res.status);
    const data = await res.json();
    console.log('JioSaavn results count:', data.results?.length);
    if (data.results?.length > 0) {
      console.log('First result:', data.results[0].song, data.results[0].encrypted_media_url ? 'has encrypted_media_url' : 'no media url');
    }
  } catch (e) {
    console.error('JioSaavn error:', e.message);
  }

  console.log('\n--- Testing iTunes API ---');
  try {
    const itunesUrl = 'https://itunes.apple.com/search?term=Blinding+Lights&entity=song&limit=3';
    const res = await fetch(itunesUrl);
    console.log('iTunes status:', res.status);
    const data = await res.json();
    console.log('iTunes count:', data.resultCount);
    if (data.results?.length > 0) {
      console.log('First result:', data.results[0].trackName, data.results[0].previewUrl);
    }
  } catch (e) {
    console.error('iTunes error:', e.message);
  }

  console.log('\n--- Testing Piped instances ---');
  const pipedList = [
    'https://api.piped.projectsegfau.lt',
    'https://pipedapi.r4fo.com',
    'https://pipedapi.leptons.xyz',
    'https://piped.video',
    'https://cf.pipedapi.kavin.rocks',
    'https://piped-api.hosthatch.me',
    'https://yt.artemislena.eu'
  ];
  for (const p of pipedList) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${p}/streams/4NRXx6U8ABQ`, { signal: AbortSignal.timeout(3000) });
      console.log(`Piped ${p} -> status ${res.status} (${Date.now() - t0}ms)`);
      if (res.ok) {
        const data = await res.json();
        console.log(`  Audio streams: ${data.audioStreams?.length}`);
      }
    } catch (e) {
      console.log(`Piped ${p} -> FAILED: ${e.message}`);
    }
  }

  console.log('\n--- Testing Invidious instances ---');
  const invidiousList = [
    'https://invidious.flokinet.to',
    'https://invidious.asir.dev',
    'https://invidious.drgns.space',
    'https://iv.ggtyler.dev',
    'https://invidious.no-logs.com',
    'https://yewtu.be'
  ];
  for (const inv of invidiousList) {
    try {
      const t0 = Date.now();
      const res = await fetch(`${inv}/api/v1/videos/4NRXx6U8ABQ`, { signal: AbortSignal.timeout(3000) });
      console.log(`Invidious ${inv} -> status ${res.status} (${Date.now() - t0}ms)`);
    } catch (e) {
      console.log(`Invidious ${inv} -> FAILED: ${e.message}`);
    }
  }
}

testSources();
