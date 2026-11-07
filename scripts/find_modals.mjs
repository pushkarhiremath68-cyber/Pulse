import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');

const modals = [];
lines.forEach((l, idx) => {
  if (l.includes('class="modal') || l.includes('id="modal') || l.includes('-modal')) {
    modals.push({ line: idx + 1, text: l.trim().slice(0, 100) });
  }
});

console.log("Modals and Dialogs in index.html:");
modals.forEach(m => console.log(`Line ${m.line}: ${m.text}`));
