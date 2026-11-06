import fs from 'fs';

const filePath = 'src/main.js';
let code = fs.readFileSync(filePath, 'utf8');

const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';

// Replace fallback assignment and onerror in main.js
code = code.replaceAll("e.target.src = './music-cover.svg';", `e.target.src = '${UNSPLASH_FALLBACK}';`);
code = code.replaceAll("this.src='./music-cover.svg';", `this.src='${UNSPLASH_FALLBACK}';`);
code = code.replaceAll(": './music-cover.svg')", `: '${UNSPLASH_FALLBACK}')`);
code = code.replaceAll("|| './music-cover.svg'", `|| '${UNSPLASH_FALLBACK}'`);
code = code.replaceAll("=== './music-cover.svg'", `=== '${UNSPLASH_FALLBACK}' || t.coverUrl.includes('music-cover.svg')`);
code = code.replaceAll("!== './music-cover.svg'", `!== '${UNSPLASH_FALLBACK}' && !t.cover.includes('music-cover.svg')`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully eliminated fallback ./music-cover.svg from src/main.js');
