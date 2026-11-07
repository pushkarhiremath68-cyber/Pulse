import fs from 'fs';
import { ARTIST_DATABASE } from '../src/catalogService.js';

// Custom ID overrides for artists where exact search might need precise disambiguation
const KNOWN_ARTIST_IDS = {
  'kk': 69736, // Krishnakumar Kunnath
  'queen': 412, // Queen (12.8M fans)
  'adele': 75798, // Adele (15.5M fans)
  'eminem': 13, // Eminem (19.1M fans)
  'bad-bunny': 10583405, // Bad Bunny (8.0M fans)
  'bts': 6982223, // BTS (3.8M fans)
  'charlie-puth': 1362735, // Charlie Puth (2.3M fans)
  'zayn': 9761322, // ZAYN (2.7M fans)
  'arijit-singh': 4474779, // Arijit Singh
  'sonu-nigam': 142475, // Sonu Nigam
  'shreya-ghoshal': 142474, // Shreya Ghoshal
  'appaji': 13600613 // Sri Ganapathy Sachchidananda Swamiji
};

// Aliases for search queries
const SEARCH_ALIASES = {
  'devi-sri-prasad': 'Devi Sri Prasad',
  's-thaman': 'Thaman S.',
  'shankar-ehsaan-loy': 'Shankar Mahadevan',
  'sidhu-moosewala': 'Sidhu Moose Wala',
  'honey-singh': 'Yo Yo Honey Singh',
  'b-praak': 'B Praak',
  'appaji': 'Sri Ganapathy Sachchidananda Swamiji',
  'kk': 'KK'
};

async function resolveAll() {
  const keys = Object.keys(ARTIST_DATABASE);
  console.log(`Starting resolution for ${keys.length} artists...`);

  const results = {};
  const issues = [];

  for (const k of keys) {
    const art = ARTIST_DATABASE[k];
    let photo = null;
    let matchedName = null;
    let fans = 0;

    // 1. Direct ID lookup if known
    if (KNOWN_ARTIST_IDS[k]) {
      try {
        const res = await fetch(`https://api.deezer.com/artist/${KNOWN_ARTIST_IDS[k]}`);
        const d = await res.json();
        if (d && d.picture_xl) {
          photo = d.picture_xl;
          matchedName = d.name;
          fans = d.nb_fan;
        }
      } catch (e) {
        console.error(`Direct ID error for ${k}:`, e.message);
      }
    }

    // 2. Search query if not resolved
    if (!photo) {
      const q = SEARCH_ALIASES[k] || art.name;
      try {
        const res = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=30`);
        const d = await res.json();
        if (d && Array.isArray(d.data) && d.data.length > 0) {
          // Sort candidates by fans descending
          const candidates = d.data
            .filter(c => c.picture_xl && !c.picture_xl.endsWith('/1000x1000-000000-80-0-0.jpg'))
            .sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0));

          // Try exact match first
          const exact = candidates.find(c => c.name.toLowerCase() === q.toLowerCase() || c.name.toLowerCase() === art.name.toLowerCase());
          const best = exact || candidates[0] || d.data[0];

          if (best && best.picture_xl) {
            photo = best.picture_xl;
            matchedName = best.name;
            fans = best.nb_fan;
          }
        }
      } catch (e) {
        console.error(`Search error for ${k}:`, e.message);
      }
    }

    if (photo) {
      results[k] = {
        name: art.name,
        matchedName,
        fans,
        photo
      };
      console.log(`[OK] ${k.padEnd(25)} -> ${matchedName} (${fans.toLocaleString()} fans)`);
    } else {
      issues.push({ id: k, name: art.name });
      console.warn(`[FAIL] ${k.padEnd(25)} -> NO PHOTO FOUND`);
    }

    // Small delay
    await new Promise(r => setTimeout(r, 60));
  }

  console.log('\n--- Summary ---');
  console.log(`Resolved: ${Object.keys(results).length} / ${keys.length}`);
  console.log(`Issues: ${issues.length}`);
  if (issues.length > 0) {
    console.log('Failed:', issues);
  }

  fs.writeFileSync('scripts/all_87_artists_resolved.json', JSON.stringify(results, null, 2));
  console.log('Saved scripts/all_87_artists_resolved.json');
}

resolveAll();

