import fs from 'fs';

async function checkSPBChithra() {
  const images = {
    'spb_solo.jpg': 'https://cdn-images.dzcdn.net/images/artist/7a91e898679cfff367e54d71a1f88f1a/1000x1000-000000-80-0-0.jpg',
    'chithra_solo.jpg': 'https://cdn-images.dzcdn.net/images/artist/be49097501022690d1dce5b9d3c864e4/1000x1000-000000-80-0-0.jpg'
  };
  for (const [k, url] of Object.entries(images)) {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('scripts/' + k, buf);
  }
}
checkSPBChithra();

