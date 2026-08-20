async function testSaavn() {
  console.log('Testing Saavn...');
  const url = 'https://jiosaavn-api-2.vercel.app/search/songs?query=Shape+of+You&limit=1';
  const res = await fetch(url);
  const data = await res.json();
  const list = data.results || data.data?.results || [];
  console.log(JSON.stringify(list, null, 2));
}

testSaavn().catch(console.error);
