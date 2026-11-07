import fs from 'fs';

async function dlMJ() {
  const res = await fetch('https://cdn-images.dzcdn.net/images/artist/97fae13b2b30e4aec2e8c9e0c7839d92/1000x1000-000000-80-0-0.jpg');
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('scripts/real_mj.jpg', buf);
  console.log('Saved real_mj.jpg');
}
dlMJ();
