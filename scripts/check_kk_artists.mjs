import fs from 'fs';

async function checkKkArtists() {
  const ids = ['69736', '71799', '1228913', '116054372', '86341312'];
  for (const id of ids) {
    const res = await fetch('https://api.deezer.com/artist/' + id);
    const d = await res.json();
    console.log(id, d.name, d.nb_fan, d.picture_xl);
    const imgRes = await fetch(d.picture_xl);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    fs.writeFileSync(`scripts/kk_${id}.jpg`, buf);
  }
}
checkKkArtists();
