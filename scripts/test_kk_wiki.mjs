import fs from 'fs';

async function testKK() {
  const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/KK_(singer)');
  const data = await res.json();
  console.log('KK title:', data.title);
  console.log('KK thumb:', data.thumbnail?.source);
  console.log('KK original:', data.originalimage?.source);

  const imgRes = await fetch(data.thumbnail?.source || data.originalimage?.source);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync('scripts/kk_real_wiki.jpg', buf);
  console.log('Saved kk_real_wiki.jpg');
}
testKK();

