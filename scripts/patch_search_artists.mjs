import fs from 'fs';

let main = fs.readFileSync('src/main.js', 'utf8');

const targetRegex = /const matchingArtists = window\.catalogService && typeof window\.catalogService\.searchArtists === 'function'[\r\n\s]+\? window\.catalogService\.searchArtists\(query\)[\r\n\s]+: \[\];[\r\n\s]+const results = await window\.musicService\.searchTracks\(query, 50\);/;

const replacement = `let matchingArtists = window.catalogService && typeof window.catalogService.searchArtists === 'function'
        ? window.catalogService.searchArtists(query)
        : [];

      // If fewer than 4 artists found or query has >= 2 letters, query dynamic global artists
      if (matchingArtists.length < 4 && window.musicService && typeof window.musicService.searchDynamicArtists === 'function') {
        try {
          const dynamicCandidates = await window.musicService.searchDynamicArtists(query);
          for (const cand of dynamicCandidates) {
            if (!matchingArtists.some(ma => ma.name.toLowerCase() === cand.name.toLowerCase())) {
              matchingArtists.push(cand);
            }
          }
        } catch (e) {}
      }

      const results = await window.musicService.searchTracks(query, 50);`;

if (targetRegex.test(main)) {
  main = main.replace(targetRegex, replacement);
  fs.writeFileSync('src/main.js', main, 'utf8');
  console.log('Successfully replaced matchingArtists block in main.js!');
} else {
  console.error('Target regex did not match.');
}

