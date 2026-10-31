async function audit() {
  const mod = await import('../src/catalogService.js');
  let missing = 0;
  let total = 0;
  const cats = mod.CATALOG_CATEGORIES || [];
  cats.forEach(c => {
    (c.tracks || []).forEach(t => {
      total++;
      if (!t.coverUrl && !t.cover && !t.ytId) {
        console.log('Category missing cover:', t.title);
        missing++;
      }
    });
  });

  const pls = mod.getCuratedPlaylists() || [];
  pls.forEach(p => {
    (p.tracks || []).forEach(t => {
      total++;
      if (!t.coverUrl && !t.cover && !t.ytId) {
        console.log('Curated missing cover:', t.title);
        missing++;
      }
    });
  });

  const movs = mod.getMoviePlaylists() || [];
  movs.forEach(m => {
    (m.tracks || []).forEach(t => {
      total++;
      if (!t.coverUrl && !t.cover && !t.ytId) {
        console.log('Movie missing cover:', t.title);
        missing++;
      }
    });
  });

  const vibes = mod.getVibePlaylists() || [];
  vibes.forEach(v => {
    (v.tracks || []).forEach(t => {
      total++;
      if (!t.coverUrl && !t.cover && !t.ytId) {
        console.log('Vibe missing cover:', t.title);
        missing++;
      }
    });
  });

  console.log('Audited ' + total + ' track occurrences. Missing original cover: ' + missing);
}
audit();

