import fs from 'fs';

async function downloadKK() {
  const urls = {
    'kk_artist1.jpg': 'https://cdn-images.dzcdn.net/images/artist/801b68eab3dca1dff7da34ed63829c1e/1000x1000-000000-80-0-0.jpg',
    'kk_artist2.jpg': 'https://cdn-images.dzcdn.net/images/artist/df55b9e127e1bac56883a4b037b249c3/1000x1000-000000-80-0-0.jpg'
  };
  for (const [f, u] of Object.entries(urls)) {
    const res = await fetch(u);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('scripts/' + f, buf);
  }
}
downloadKK();
