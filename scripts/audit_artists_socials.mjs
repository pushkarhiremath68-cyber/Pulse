import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');
const lines = content.split('\n');
const dbLines = lines.slice(550, 7911); // line 551 to 7911
const dbCode = dbLines.join('\n').replace(/^export const ARTIST_DATABASE = /, '').replace(/;?\s*$/, '');

const db = (new Function(`return (${dbCode});`))();
const keys = Object.keys(db);
console.log(`Total Curated Artists in ARTIST_DATABASE: ${keys.length}`);

const report = [];

keys.forEach(k => {
  const art = db[k];
  const s = art.socials || {};
  report.push({
    key: k,
    name: art.name,
    origin: art.origin || null,
    instagram: s.instagram || null,
    x: s.x || null,
    facebook: s.facebook || null,
    youtube: s.youtube || null,
    spotify: s.spotify || null,
    bioLen: art.bio ? art.bio.length : 0
  });
});

fs.writeFileSync('scripts/artists_audit_report.json', JSON.stringify(report, null, 2));
console.log(`Audit saved to scripts/artists_audit_report.json`);
