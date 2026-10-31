import fs from 'fs';

const content = fs.readFileSync('src/catalogService.js', 'utf8');

const dbIdx = content.indexOf('const db = {');
const dbEndIdx = content.indexOf('return {', dbIdx);
const dbText = content.substring(dbIdx + 11, dbEndIdx);

// Find all top-level keys in db
const keyMatches = dbText.match(/^\s*"([a-z0-9\-]+)":\s*\{/gm);
console.log('Keys in db:', keyMatches);

