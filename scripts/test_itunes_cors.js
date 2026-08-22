async function testItunesCors() {
  const url = 'https://itunes.apple.com/search?term=Blinding+Lights&entity=song&limit=3';
  const res = await fetch(url, {
    headers: {
      'Origin': 'http://localhost:5173'
    }
  });
  console.log('iTunes status:', res.status);
  console.log('CORS allow origin:', res.headers.get('access-control-allow-origin'));
}

testItunesCors();
