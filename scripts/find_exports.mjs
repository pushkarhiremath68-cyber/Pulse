import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

// Find all export function or const declarations
const exportMatches = content.match(/export (?:const|function|let|var) [a-zA-Z0-9_]+/g);
console.log('Exports:', exportMatches);

