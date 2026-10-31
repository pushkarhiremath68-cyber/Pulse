const fs = require('fs');
const path = require('path');

function checkDir(d) {
  if (!fs.existsSync(d)) return;
  fs.readdirSync(d, { withFileTypes: true }).forEach(ent => {
    const f = path.join(d, ent.name);
    if (ent.isDirectory()) {
      checkDir(f);
    } else if (/\.(js|css|html|json)$/.test(ent.name)) {
      const txt = fs.readFileSync(f, 'utf8');
      const lines = txt.split('\n');
      lines.forEach((l, idx) => {
        if (/spotify/i.test(l)) {
          console.log(f + ':' + (idx + 1) + ': ' + l.trim());
        }
      });
    }
  });
}

console.log('--- Checking src ---');
checkDir('src');
console.log('--- Checking docs/src ---');
checkDir('docs/src');
console.log('--- Checking index.html and docs/index.html ---');
['index.html', 'docs/index.html'].forEach(f => {
  if (fs.existsSync(f)) {
    const lines = fs.readFileSync(f, 'utf8').split('\n');
    lines.forEach((l, idx) => {
      if (/spotify/i.test(l)) {
        console.log(f + ':' + (idx + 1) + ': ' + l.trim());
      }
    });
  }
});

