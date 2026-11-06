import fs from 'fs';

let content = fs.readFileSync('src/extractorService.js', 'utf8');

const oldBlockRegex = /\/\/ 1\. Primary: Local \/ Vite backend direct YouTube search endpoint[\r\n\s]+try \{[\r\n\s]+const localBase = \(typeof window !== 'undefined' && window\.location\?\.origin\) \? window\.location\.origin : 'http:\/\/localhost:5173';[\r\n\s]+const res = await fetch\(`\$\{localBase\}\/api\/yt\/search\?q=\$\{encodeURIComponent\(cleanQ\)\}`, \{ signal: AbortSignal\.timeout\(3500\) \}\);[\r\n\s]+if \(res\.ok\) \{[\r\n\s]+const data = await res\.json\(\);[\r\n\s]+if \(Array\.isArray\(data\.results\) && data\.results\.length > 0\) \{[\r\n\s]+SEARCH_CACHE\.set\(cleanQ, data\.results\.slice\(0, limit\)\);[\r\n\s]+return data\.results\.slice\(0, limit\);[\r\n\s]+\}[\r\n\s]+\}[\r\n\s]+\} catch \(e\) \{\}/;

const newBlock = `  // 1. Primary: Local / Vite backend direct YouTube search endpoint (only on localhost)
  try {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    if (isLocal) {
      const localBase = window.location.origin || 'http://localhost:5173';
      const res = await fetch(\`\${localBase}/api/yt/search?q=\${encodeURIComponent(cleanQ)}\`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.results) && data.results.length > 0) {
          SEARCH_CACHE.set(cleanQ, data.results.slice(0, limit));
          return data.results.slice(0, limit);
        }
      }
    }
  } catch (e) {}`;

if (oldBlockRegex.test(content)) {
  content = content.replace(oldBlockRegex, newBlock);
  fs.writeFileSync('src/extractorService.js', content, 'utf8');
  console.log('Successfully optimized extractorService.js YouTube search speed!');
} else {
  console.warn('Could not match oldBlock in extractorService.js with regex');
}

