import fs from 'fs';

async function test() {
  const res = await fetch('https://api.deezer.com/search?q=Bohemian');
  const d = await res.json();
  console.log('Total:', d.total, 'Items:', d.data?.length);
  if (d.data?.length > 0) {
    console.log(d.data[0]);
  }
}
test();

