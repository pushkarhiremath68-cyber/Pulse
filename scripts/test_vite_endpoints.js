async function testViteEndpoints() {
  console.log('Testing Vite /api/saavn-search endpoint...');
  try {
    const res = await fetch('http://localhost:5173/api/saavn-search?q=Kesariya');
    console.log('/api/saavn-search status:', res.status);
    const json = await res.json();
    console.log('Results count:', json.results?.length);
    if (json.results?.length > 0) {
      console.log('First song:', json.results[0].title, 'by', json.results[0].artist);
      console.log('Stream URL:', json.results[0].streamUrl?.substring(0, 60) + '...');
    }
  } catch (e) {
    console.error('Error testing /api/saavn-search:', e.message);
  }

  console.log('\nTesting Vite /api/ytm/stream endpoint...');
  try {
    const res = await fetch('http://localhost:5173/api/ytm/stream?q=Blinding+Lights');
    console.log('/api/ytm/stream status:', res.status);
    const json = await res.json();
    console.log('Stream data:', json);
  } catch (e) {
    console.error('Error testing /api/ytm/stream:', e.message);
  }
}

testViteEndpoints();
