import fs from 'fs';

async function downloadWikiKK() {
  const url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/KK_%28125%29.jpg/800px-KK_%28125%29.jpg';
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PulseMusic/1.0 (contact: support@pulsemusic.app)' }
  });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('scripts/kk_real_wiki.jpg', buf);
  console.log('Saved kk_real_wiki.jpg, size:', buf.length);
}
downloadWikiKK();

