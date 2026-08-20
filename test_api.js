async function test() {
  try {
    const res = await fetch('https://jiosaavn-api-2.vercel.app/search/songs?query=starboy&limit=1');
    const json = await res.json();
    const results = json.data ? json.data.results : json.results;
    if (results && results.length > 0) {
      console.log('JioSaavn image format:', JSON.stringify(results[0].image, null, 2));
    }
  } catch (e) {}

  try {
    const res = await fetch('https://api.piped.privacydev.net/search?q=starboy&filter=music_songs');
    const json = await res.json();
    if (json.items && json.items.length > 0) {
      console.log('Piped image format:', json.items[0].thumbnail);
    }
  } catch (e) {}
}
test();
