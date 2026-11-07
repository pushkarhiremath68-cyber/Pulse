import fs from 'fs';

async function findArtists() {
  const songs = ['Bohemian Rhapsody', 'Rolling in the Deep', 'Stan', 'Numb'];
  for (const s of songs) {
    const res = await fetch('https://api.deezer.com/search?q=' + encodeURIComponent(s));
    const d = await res.json();
    const t = d.data?.[0];
    if (t) {
      console.log(s, '-> Artist:', t.artist?.id, t.artist?.name, t.artist?.picture_xl);
    }
  }
}
findArtists();

