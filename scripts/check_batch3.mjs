import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/artists_audit_report.json', 'utf8'));

data.slice(35).forEach(a => {
  console.log(`[${a.key}] ${a.name}`);
  console.log(`  IG: ${a.instagram}`);
  console.log(`  X: ${a.x}`);
  console.log(`  FB: ${a.facebook}`);
  console.log(`  YT: ${a.youtube}`);
});

