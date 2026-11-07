import https from 'https';

async function searchYouTube(q) {
  return new Promise(resolve => {
    https.get('https://www.youtube.com/results?search_query=' + encodeURIComponent(q), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        const ids = [];
        let match;
        while ((match = regex.exec(data)) !== null) {
          ids.push(match[1]);
        }
        resolve([...new Set(ids)]);
      });
    }).on('error', () => resolve([]));
  });
}

async function main() {
  const songs = [
    'Krishna Das Hanuman Chalisa',
    'Krishna Das Baba Hanuman',
    'Krishna Das Radhe Shyam',
    'Krishna Das Om Namah Shivaya',
    'Krishna Das Sri Ram Jai Ram',
    'Krishna Das Hara Hara Mahadeva',
    'Krishna Das Mere Gurudev',
    'Krishna Das Sita Ram',
    'Krishna Das Govinda Hare',
    'Krishna Das Jaya Bhagavan'
  ];

  for (const s of songs) {
    const ids = await searchYouTube(s);
    console.log(`${s} -> ${ids.slice(0, 3).join(', ')}`);
  }
}

main();
