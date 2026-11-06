import fs from 'fs';
import { ARTIST_ENHANCEMENTS } from './artist_enhancements.mjs';

const filePath = 'src/catalogService.js';
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const startLineIdx = 550; // 'export const ARTIST_DATABASE = {' is at line 551 (0-indexed 550)
const endLineIdx = lines.findIndex((l, idx) => idx > 550 && l.startsWith('export const SIMILAR_ARTIST_MAP = {'));

if (endLineIdx === -1) {
  console.error("Could not find end of ARTIST_DATABASE");
  process.exit(1);
}

const dbLines = lines.slice(startLineIdx, endLineIdx);
let dbCode = dbLines.join('\n').replace(/^export const ARTIST_DATABASE = /, '').replace(/;?\s*$/, '');

const db = (new Function(`return (${dbCode});`))();

let updatedCount = 0;
for (const [key, enhancements] of Object.entries(ARTIST_ENHANCEMENTS)) {
  if (db[key]) {
    db[key].origin = enhancements.origin;
    db[key].bio = enhancements.bio;
    db[key].socials = {
      ...db[key].socials,
      ...enhancements.socials
    };
    updatedCount++;
  } else {
    console.warn(`Artist key ${key} not found in ARTIST_DATABASE`);
  }
}

console.log(`Updated ${updatedCount} artists in ARTIST_DATABASE.`);

// Reformat ARTIST_DATABASE
const newDbCode = `export const ARTIST_DATABASE = ${JSON.stringify(db, null, 2)};\n\n`;

const newContent = [
  ...lines.slice(0, startLineIdx),
  newDbCode,
  ...lines.slice(endLineIdx)
].join('\n');

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Successfully patched ${filePath}`);
