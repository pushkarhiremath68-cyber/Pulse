import fs from 'fs';

let s = fs.readFileSync('src/catalogService.js', 'utf8');

// Fix the regex in searchArtists
s = s.replace(/\[\^a-z0-9s\]/g, '[^a-z0-9\\s]');

// Also in searchArtists, check localStorage for pulse_artist_
const targetAnchor = '  // 1. Search all verified artists in ARTIST_DATABASE first';
const cacheSearchSnippet = `  // 1b. Search cached dynamic artists from localStorage
  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('pulse_artist_')) {
          try {
            const cached = JSON.parse(localStorage.getItem(k));
            if (cached && cached.name) {
              addCandidate(cached.name, cached.worldRank || 'Verified Artist', cached.avatar || cached.banner, cached.banner, cached.followersCount, cached.worldRank, 25);
            }
          } catch (e) {}
        }
      }
    }
  } catch (e) {}

  // 1. Search all verified artists in ARTIST_DATABASE first`;

if (!s.includes('// 1b. Search cached dynamic artists')) {
  s = s.replace(targetAnchor, cacheSearchSnippet);
}

// In getArtistDetails, check localStorage
const targetAnchor2 = '  if (foundKey && db[foundKey]) {';
const cacheDetailsSnippet = `  // 1B. Check LocalStorage cache for dynamically resolved artist profile
  try {
    if (typeof localStorage !== 'undefined') {
      const cleanKey = normalized.replace(/[^a-z0-9]/g, '-');
      const cachedStr = localStorage.getItem(\`pulse_artist_\${cleanKey}\`);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && cached.topTracks && cached.topTracks.length > 0) {
          return cached;
        }
      }
    }
  } catch (e) {}

  if (foundKey && db[foundKey]) {`;

if (!s.includes('// 1B. Check LocalStorage cache')) {
  s = s.replace(targetAnchor2, cacheDetailsSnippet);
}

// Add common aliases for newly added artists
const aliasTarget = '    else if (normalized.includes(\'bunny\') || normalized.includes(\'benito\')) foundKey = \'bad-bunny\';';
const additionalAliases = `    else if (normalized.includes('bunny') || normalized.includes('benito')) foundKey = 'bad-bunny';
    else if (normalized.includes('shreya') || normalized.includes('ghoshal')) foundKey = 'shreya-ghoshal';
    else if (normalized.includes('sonu') || normalized.includes('nigam')) foundKey = 'sonu-nigam';
    else if (normalized.includes('kk') || normalized.includes('kay kay') || normalized.includes('krishnakumar')) foundKey = 'kk';
    else if (normalized.includes('sriram')) foundKey = 'sid-sriram';
    else if (normalized.includes('moosewala') || normalized.includes('sidhu')) foundKey = 'sidhu-moosewala';
    else if (normalized.includes('aujla') || normalized.includes('karan')) foundKey = 'karan-aujla';
    else if (normalized.includes('drake') || normalized.includes('champagnepapi')) foundKey = 'drake';
    else if (normalized.includes('kendrick') || normalized.includes('lamar') || normalized.includes('kdot')) foundKey = 'kendrick-lamar';
    else if (normalized.includes('posty') || normalized.includes('post malone')) foundKey = 'post-malone';
    else if (normalized.includes('bieber') || normalized.includes('justin')) foundKey = 'justin-bieber';
    else if (normalized.includes('ariana') || normalized.includes('grande')) foundKey = 'ariana-grande';
    else if (normalized.includes('bts') || normalized.includes('bangtan')) foundKey = 'bts';
    else if (normalized.includes('travis') || normalized.includes('scott') || normalized.includes('la flame')) foundKey = 'travis-scott';
    else if (normalized.includes('kishore') || normalized.includes('kumar')) foundKey = 'kishore-kumar';
    else if (normalized.includes('lata') || normalized.includes('mangeshkar')) foundKey = 'lata-mangeshkar';
    else if (normalized.includes('rahman') || normalized.includes('ar rahman') || normalized.includes('a.r. rahman')) foundKey = 'a-r-rahman';
    else if (normalized.includes('badshah')) foundKey = 'badshah';
    else if (normalized.includes('honey') || normalized.includes('yo yo')) foundKey = 'yo-yo-honey-singh';
    else if (normalized.includes('neha') || normalized.includes('kakkar')) foundKey = 'neha-kakkar';
    else if (normalized.includes('sunidhi') || normalized.includes('chauhan')) foundKey = 'sunidhi-chauhan';
    else if (normalized.includes('jubin') || normalized.includes('nautiyal')) foundKey = 'jubin-nautiyal';
    else if (normalized.includes('nusrat') || (normalized.includes('khan') && normalized.includes('fateh'))) foundKey = 'nusrat-fateh-ali-khan';
    else if (normalized.includes('rahat')) foundKey = 'rahat-fateh-ali-khan';
    else if (normalized.includes('blackpink')) foundKey = 'blackpink';
    else if (normalized.includes('styles') || normalized.includes('harry')) foundKey = 'harry-styles';
    else if (normalized.includes('olivia') || normalized.includes('rodrigo')) foundKey = 'olivia-rodrigo';
    else if (normalized.includes('gaga') || normalized.includes('lady')) foundKey = 'lady-gaga';
    else if (normalized.includes('puth') || normalized.includes('charlie')) foundKey = 'charlie-puth';
    else if (normalized.includes('darshan') || normalized.includes('raval')) foundKey = 'darshan-raval';
    else if (normalized.includes('anuv') || normalized.includes('jain')) foundKey = 'anuv-jain';
    else if (normalized.includes('kuhad') || normalized.includes('prateek')) foundKey = 'prateek-kuhad';
    else if (normalized.includes('mendes') || normalized.includes('shawn')) foundKey = 'shawn-mendes';
    else if (normalized.includes('rihanna') || normalized.includes('riri')) foundKey = 'rihanna';
    else if (normalized.includes('beyonce') || normalized.includes('beyoncé') || normalized.includes('queen bey')) foundKey = 'beyoncé';
    else if (normalized.includes('shakira')) foundKey = 'shakira';
    else if (normalized.includes('zayn') || normalized.includes('malik')) foundKey = 'zayn';
    else if (normalized.includes('mohit') && normalized.includes('chauhan')) foundKey = 'mohit-chauhan';
    else if (normalized.includes('pritam')) foundKey = 'pritam';`;

if (!s.includes('foundKey = \'shreya-ghoshal\'')) {
  s = s.replace(aliasTarget, additionalAliases);
}

fs.writeFileSync('src/catalogService.js', s, 'utf8');
console.log('Successfully updated src/catalogService.js!');
