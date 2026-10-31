async function listTracks() {
  const mod = await import('../src/catalogService.js');
  const tracks = [];
  (mod.CATALOG_CATEGORIES || []).forEach(c => {
    (c.tracks || []).forEach(t => tracks.push({ category: c.title, title: t.title, artist: t.artist }));
  });
  console.log('Total catalog category tracks:', tracks.length);
  tracks.slice(0, 30).forEach(t => console.log(`[${t.category}] ${t.title} - ${t.artist}`));
}
listTracks();

