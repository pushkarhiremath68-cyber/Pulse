import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/artists_audit_report.json', 'utf8'));

console.log("=== ARTISTS AUDIT SUMMARY ===");
const missingOrigin = data.filter(a => !a.origin);
const missingSpotify = data.filter(a => !a.spotify);
console.log(`Missing origin: ${missingOrigin.length}/${data.length}`);
console.log(`Missing spotify: ${missingSpotify.length}/${data.length}`);

data.slice(0, 10).forEach(a => {
  console.log(`\nArtist: ${a.name} (${a.key})`);
  console.log(`  IG: ${a.instagram}`);
  console.log(`  X: ${a.x}`);
  console.log(`  FB: ${a.facebook}`);
  console.log(`  YT: ${a.youtube}`);
  console.log(`  Spotify: ${a.spotify}`);
});
