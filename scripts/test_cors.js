async function testJioSaavnCors() {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=kesariya`;
  const res = await fetch(url, {
    headers: {
      'Origin': 'http://localhost:5173'
    }
  });
  console.log('JioSaavn status:', res.status);
  console.log('CORS allow origin:', res.headers.get('access-control-allow-origin'));
  console.log('CORS allow methods:', res.headers.get('access-control-allow-methods'));
  console.log('All headers:', Object.fromEntries(res.headers.entries()));
}

testJioSaavnCors();
