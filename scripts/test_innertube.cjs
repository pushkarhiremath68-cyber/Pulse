async function testInnerTube() {
  console.log('Testing InnerTube API directly...');
  try {
    const res = await fetch('https://www.youtube.com/youtubei/v1/search?prettyPrint=false', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US'
          }
        },
        query: 'Shape of You Ed Sheeran'
      })
    });
    console.log('InnerTube direct status:', res.status);
    console.log('CORS headers:', res.headers.get('access-control-allow-origin'));
    if (res.ok) {
      const text = await res.text();
      const matches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
      const unique = [...new Set(matches.map(m => m[1]))];
      console.log('Found videoIds:', unique.slice(0, 5));
    }
  } catch (e) {
    console.log('InnerTube error:', e.message);
  }

  // Test InnerTube through CORS proxy
  console.log('\nTesting InnerTube through CORS proxy...');
  try {
    const targetUrl = 'https://www.youtube.com/youtubei/v1/search?prettyPrint=false';
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20240101.00.00',
            hl: 'en',
            gl: 'US'
          }
        },
        query: 'Shape of You Ed Sheeran'
      })
    });
    console.log('corsproxy.io InnerTube status:', res.status);
    if (res.ok) {
      const text = await res.text();
      const matches = [...text.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)];
      const unique = [...new Set(matches.map(m => m[1]))];
      console.log('Found videoIds via corsproxy.io InnerTube:', unique.slice(0, 5));
    }
  } catch (e) {
    console.log('corsproxy.io InnerTube error:', e.message);
  }
}

testInnerTube();

