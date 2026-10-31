import fs from 'fs';

const lines = fs.readFileSync('src/catalogService.js', 'utf8').split('\n');

for (let i = 1165; i < lines.length; i++) {
  if (lines[i].trim() === '};' || lines[i].trim().startsWith('const foundKey')) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    if (lines[i].trim().startsWith('const foundKey')) break;
  }
}

