import fs from 'fs';
const data = JSON.parse(fs.readFileSync('scripts/artists_audit_report.json', 'utf8'));
data.forEach((a, i) => {
  console.log(`${i+1}. [${a.key}] "${a.name}"`);
});
