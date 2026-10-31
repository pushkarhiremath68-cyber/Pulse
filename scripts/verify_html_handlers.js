import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf-8');
const mainJs = fs.readFileSync('src/main.js', 'utf-8');
const playbarJs = fs.readFileSync('src/playbarController.js', 'utf-8');
const downloadJs = fs.readFileSync('src/downloadService.js', 'utf-8');
const allJs = mainJs + '\n' + playbarJs + '\n' + downloadJs;

// Extract all inline event handlers: onclick="...", oninput="...", etc.
const handlerRegex = /\s(on[a-z]+)="([^"]+)"/gi;
let match;
const handlerCalls = new Set();

while ((match = handlerRegex.exec(html)) !== null) {
  const handlerCode = match[2];
  // extract window.xyz(...)
  const windowCalls = handlerCode.match(/window\.([a-zA-Z0-9_]+)/g);
  if (windowCalls) {
    windowCalls.forEach(c => handlerCalls.add(c.replace('window.', '')));
  }
}

console.log(`Found ${handlerCalls.size} unique window.* function calls in index.html attributes:`);

const missing = [];
for (const fn of Array.from(handlerCalls).sort()) {
  const isDefined = allJs.includes(`window.${fn} =`) || 
                    allJs.includes(`window.${fn}=`) || 
                    allJs.includes(`window.${fn} `) ||
                    allJs.includes(`${fn}:`) ||
                    allJs.includes(`function ${fn}`);
  if (isDefined) {
    // console.log(`  [OK] ${fn}`);
  } else {
    console.log(`  [MISSING!] ${fn}`);
    missing.push(fn);
  }
}

console.log(`\nTotal Missing from handlers: ${missing.length}`);
if (missing.length) console.log(missing);

