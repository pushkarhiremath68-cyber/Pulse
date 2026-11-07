import https from 'https';

const tracks = [
  { title: 'Hanuman Chalisa', ytId: '3WrImrl2dmI', album: 'Live on Earth' },
  { title: 'Baba Hanuman', ytId: 'ZdjEgaND0n8', album: 'Live on Earth' },
  { title: 'Radhe Shyam', ytId: 'JQeCetQmopQ', album: 'One Track Heart' },
  { title: 'Om Namah Shivaya', ytId: 'PTc8X37oJBE', album: 'Breath of the Heart' },
  { title: 'Sri Ram Jai Ram', ytId: 'RGighCH7i4Y', album: 'Live on Earth' },
  { title: 'Hara Hara Mahadeva', ytId: 'husGDaTbYkk', album: 'Live on Earth' },
  { title: 'Mere Gurudev', ytId: '0qc0jXs_brU', album: 'Door of Faith' },
  { title: 'Sita Ram', ytId: 'c3K1BWeIZyo', album: 'Live on Earth' },
  { title: 'Govinda Hare', ytId: 'fGDLNvEyUyI', album: 'Breath of the Heart' },
  { title: 'Jaya Bhagavan', ytId: 'QRuNUqS2hT8', album: 'Pilgrim Heart' }
];

async function checkTrack(t) {
  return new Promise(resolve => {
    https.get(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${t.ytId}`, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ ...t, ytTitle: json.title, author: json.author_name, thumb: json.thumbnail_url });
        } catch {
          resolve(t);
        }
      });
    }).on('error', () => resolve(t));
  });
}

async function main() {
  for (const t of tracks) {
    const res = await checkTrack(t);
    console.log(`[VERIFIED] ${res.title} -> "${res.ytTitle}" by ${res.author}`);
  }
}

main();
