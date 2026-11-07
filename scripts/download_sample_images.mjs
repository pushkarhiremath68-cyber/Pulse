import fs from 'fs';

async function downloadSample() {
  const images = {
    'arijit_deezer.jpg': 'https://cdn-images.dzcdn.net/images/artist/ac5350cff290edd5b69fa584b8b1bd4f/1000x1000-000000-80-0-0.jpg',
    'sonu_deezer.jpg': 'https://cdn-images.dzcdn.net/images/artist/812220125c4f0db57050438b65afcf78/1000x1000-000000-80-0-0.jpg',
    'kk_deezer.jpg': 'https://cdn-images.dzcdn.net/images/artist/15b11225390ff41cbc862cbbd9190ee1/1000x1000-000000-80-0-0.jpg',
    'shreya_deezer.jpg': 'https://cdn-images.dzcdn.net/images/artist/3bb832d37d10ff2affcfa9afdc7c68a0/1000x1000-000000-80-0-0.jpg'
  };

  for (const [filename, url] of Object.entries(images)) {
    try {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync('scripts/' + filename, buf);
      console.log('Saved', filename, 'size:', buf.length);
    } catch (e) {
      console.error(filename, e.message);
    }
  }
}
downloadSample();

