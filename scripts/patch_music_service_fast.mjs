import fs from 'fs';

let content = fs.readFileSync('src/musicService.js', 'utf8');

const oldFnRegex = /export async function searchDynamicArtists\(query\) \{[\s\S]*?return candidates;\s*\} catch \(e\) \{\s*return \[\];\s*\}\s*\}/;

const newFn = `export async function searchDynamicArtists(query) {
  if (!query || typeof query !== 'string' || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  
  try {
    const res = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(q)}&entity=musicArtist&limit=3\`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];

    const validArtists = data.results.filter(a => a && a.artistName);
    const candidates = await Promise.all(
      validArtists.map(async (art) => {
        let avatar = '';
        try {
          const trackRes = await fetch(\`https://itunes.apple.com/search?term=\${encodeURIComponent(art.artistName)}&entity=song&limit=1\`, { signal: AbortSignal.timeout(1200) });
          if (trackRes.ok) {
            const tData = await trackRes.json();
            if (tData?.results?.[0]?.artworkUrl100) {
              avatar = tData.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
            }
          }
        } catch (e) {}

        return {
          id: art.artistName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: art.artistName,
          genre: art.primaryGenreName || 'Verified Artist',
          avatar: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
          banner: avatar || \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(art.artistName)}&backgroundColor=8b5cf6\`,
          followersCount: '20,000,000',
          worldRank: \`#1 in \${art.primaryGenreName || 'Music'}\`,
          score: 95
        };
      })
    );

    return candidates.filter(Boolean);
  } catch (e) {
    return [];
  }
}`;

if (oldFnRegex.test(content)) {
  content = content.replace(oldFnRegex, newFn);
  console.log('Successfully optimized searchDynamicArtists in musicService.js!');
  fs.writeFileSync('src/musicService.js', content, 'utf8');
} else {
  console.warn('Could not match searchDynamicArtists in musicService.js with regex');
}

