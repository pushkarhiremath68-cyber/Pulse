import fs from 'fs';

const globalArtists = [
  'Queen',
  'Lady Gaga',
  'Katy Perry',
  'Maroon 5',
  'Alan Walker',
  'Selena Gomez',
  'Camila Cabello',
  'Miley Cyrus',
  'SZA',
  'Chappell Roan',
  'Taylor Swift',
  'The Weeknd',
  'Billie Eilish',
  'Sabrina Carpenter',
  'Coldplay',
  'Eminem',
  'Ed Sheeran',
  'Imagine Dragons',
  'Bruno Mars',
  'Adele',
  'Linkin Park',
  'Dua Lipa',
  'Bad Bunny',
  'Drake',
  'Kendrick Lamar',
  'Post Malone',
  'Justin Bieber',
  'Ariana Grande',
  'BTS',
  'Travis Scott',
  'BLACKPINK',
  'Harry Styles',
  'Olivia Rodrigo',
  'Charlie Puth',
  'Shawn Mendes',
  'Rihanna',
  'Beyoncé',
  'Shakira',
  'ZAYN'
];

async function checkGlobal() {
  const map = {};
  for (const name of globalArtists) {
    try {
      const res = await fetch('https://api.deezer.com/search/artist?q=' + encodeURIComponent(name));
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        // Sort by nb_fan DESC
        const sorted = data.data
          .filter(d => d.picture_xl && !d.picture_xl.endsWith('/1000x1000-000000-80-0-0.jpg'))
          .sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0));
        const best = sorted[0] || data.data[0];
        map[name] = {
          id: best.id,
          name: best.name,
          fans: best.nb_fan,
          photo: best.picture_xl || best.picture_big
        };
        console.log(name.padEnd(20), '->', best.name, `(${best.nb_fan} fans)`, best.picture_xl);
      }
    } catch (e) {
      console.error(name, e.message);
    }
    await new Promise(r => setTimeout(r, 80));
  }
  fs.writeFileSync('scripts/verified_global_singers.json', JSON.stringify(map, null, 2));
}
checkGlobal();

