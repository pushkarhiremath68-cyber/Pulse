import fs from 'fs';

async function checkThree() {
  const urls = {
    'bpraak.jpg': 'https://cdn-images.dzcdn.net/images/artist/efe513aabaa0a94c4db307ac3431b833/1000x1000-000000-80-0-0.jpg',
    'thaman.jpg': 'https://cdn-images.dzcdn.net/images/artist/fe520c37ba48ea96638cf2f52f1bbc08/1000x1000-000000-80-0-0.jpg',
    'vijay_prakash.jpg': 'https://cdn-images.dzcdn.net/images/artist/3d112cbc8570a026002b7e05142dc191/1000x1000-000000-80-0-0.jpg'
  };
  for (const [f, u] of Object.entries(urls)) {
    const res = await fetch(u);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('scripts/' + f, buf);
  }
}
checkThree();
