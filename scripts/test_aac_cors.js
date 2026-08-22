async function testSaavnAac() {
  // Take the URL from previous test
  const testUrl = 'https://aac.saavncdn.com/820/5ddb9a79a5218f85ca9bef170f3a461d_320.mp4';
  try {
    const res = await fetch(testUrl, {
      method: 'HEAD',
      headers: { 'Origin': 'http://localhost:5173' }
    });
    console.log('AAC CDN status:', res.status);
    console.log('AAC CORS header:', res.headers.get('access-control-allow-origin'));
    console.log('Content type:', res.headers.get('content-type'));
    console.log('Content length:', res.headers.get('content-length'));
  } catch (e) {
    console.error('Error fetching AAC CDN:', e.message);
  }
}

testSaavnAac();
