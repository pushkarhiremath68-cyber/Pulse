import https from 'https';

async function fetchJson(url) {
  return new Promise(resolve => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const songs = [
    'Hara Hara Mahadeva',
    'Mere Gurudev',
    'Sita Ram',
    'Govinda Hare',
    'Jaya Bhagavan'
  ];

  for (const s of songs) {
    const q = encodeURIComponent(`Krishna Das ${s}`);
    const res = await fetchJson(`https://invidious.private.coffee/api/v1/search?q=${q}&type=video`);
    if (res && res.length > 0) {
      console.log(s, '->', res[0].videoId, '|', res[0].title, '|', res[0].lengthSeconds);
    } else {
      console.log(s, '-> no results from invidious');
    }
  }
}

main();
