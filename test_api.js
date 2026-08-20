async function test() {
  console.log('Testing JioSaavn API...');
  try {
    const res = await fetch('https://jiosaavn-api-2.vercel.app/search/songs?query=starboy&limit=3');
    const json = await res.json();
    console.log('JioSaavn results:', json.data ? (json.data.results ? json.data.results.length : 0) : (json.results ? json.results.length : 0));
  } catch (e) { console.log('JioSaavn Error:', e.message); }

  console.log('Testing Piped API...');
  try {
    const res = await fetch('https://api.piped.privacydev.net/search?q=starboy&filter=music_songs');
    const json = await res.json();
    console.log('Piped results:', json.items ? json.items.length : 0);
  } catch (e) { console.log('Piped Error:', e.message); }
}

test();
