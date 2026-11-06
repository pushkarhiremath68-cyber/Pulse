import fs from 'fs';

const filePath = 'src/firestoreService.js';
let code = fs.readFileSync(filePath, 'utf8');

const UNSPLASH_FALLBACK = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
code = code.replaceAll(": './music-cover.svg')", `: '${UNSPLASH_FALLBACK}')`);
code = code.replaceAll(": './music-cover.svg';", `: '${UNSPLASH_FALLBACK}';`);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully eliminated fallback ./music-cover.svg from src/firestoreService.js');
