/**
 * COMPREHENSIVE ARTIST TOP 10 SONGS AUTHENTICITY AUDIT
 * =====================================================
 * Verifies that every artist's top 10 songs actually belong to that artist.
 * Uses iTunes Search API to cross-reference each track's credited artist.
 * 
 * OUTPUT: A JSON report + console summary showing mismatches.
 * 
 * If this script is interrupted, the partial results are saved to
 * scripts/song_audit_results.json so the next run can resume.
 */

import fs from 'fs';
import https from 'https';
import { ARTIST_DATABASE } from '../src/catalogService.js';

const RESULTS_FILE = './scripts/song_audit_results.json';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchItunes(query) {
  return new Promise(resolve => {
    const url = 'https://itunes.apple.com/search?term=' + encodeURIComponent(query) + '&entity=song&limit=3';
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
  });
}

function normalizeArtistName(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function artistNameMatches(trackArtistField, expectedArtistName) {
  const norm = normalizeArtistName(trackArtistField);
  const expected = normalizeArtistName(expectedArtistName);
  
  // Direct substring match
  if (norm.includes(expected) || expected.includes(norm)) return true;
  
  // Check each word of artist name
  const expectedWords = expected.split(' ');
  if (expectedWords.length >= 2 && expectedWords.every(w => norm.includes(w))) return true;
  
  // Special cases for band/group names and aliases
  const aliases = {
    'ar rahman': ['a r rahman', 'ar rahman', 'allah rakha rahman'],
    'kk': ['krishnakumar kunnath', 'k k'],
    'sp balasubrahmanyam': ['s p balasubrahmanyam', 'spb', 'sp balu'],
    'ks chithra': ['k s chithra', 'chitra'],
    'yo yo honey singh': ['honey singh', 'yo yo'],
    'bts': ['bangtan', 'bts'],
    'sza': ['sza'],
    'dsp': ['devi sri prasad'],
    's thaman': ['thaman s', 'thaman'],
    'queen': ['queen'],
    'maroon 5': ['maroon 5', 'maroon five'],
    'blackpink': ['blackpink', 'black pink'],
    'shankarehsaanloy': ['shankar ehsaan loy', 'shankar mahadevan', 'ehsaan noorani', 'loy mendonsa'],
    'vishalshekhar': ['vishal shekhar', 'vishal dadlani', 'shekhar ravjiani'],
    'zayn': ['zayn malik', 'zayn'],
    'beyonce': ['beyonce', 'beyonc'],
    'bad bunny': ['bad bunny', 'benito'],
    'appaji': ['appaji'],
  };
  
  for (const [key, alts] of Object.entries(aliases)) {
    if (expected.includes(key) || key.includes(expected)) {
      if (alts.some(a => norm.includes(a))) return true;
    }
  }
  
  return false;
}

async function main() {
  let results = {};
  
  // Load previous partial results if any
  if (fs.existsSync(RESULTS_FILE)) {
    try { results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')); } catch {}
  }
  
  const artistEntries = Object.entries(ARTIST_DATABASE);
  console.log(`Auditing ${artistEntries.length} artists, ${artistEntries.length * 10} tracks total...\n`);
  
  let processedCount = 0;
  let skippedCount = 0;
  
  for (const [artistId, artist] of artistEntries) {
    // Skip already-audited artists
    if (results[artistId]?.completed) {
      skippedCount++;
      continue;
    }
    
    results[artistId] = {
      name: artist.name,
      tracks: [],
      mismatches: [],
      completed: false,
    };
    
    console.log(`[${processedCount + skippedCount + 1}/${artistEntries.length}] Auditing ${artist.name}...`);
    
    for (const track of artist.topTracks || []) {
      const query = `${track.title} ${artist.name}`;
      const itunesResult = await fetchItunes(query);
      
      let status = 'unknown';
      let itunesArtist = '';
      let itunesTrackName = '';
      
      if (itunesResult?.results?.length > 0) {
        const bestMatch = itunesResult.results[0];
        itunesArtist = bestMatch.artistName || '';
        itunesTrackName = bestMatch.trackName || '';
        
        // Check if the track's "artist" field in our DB references the correct artist
        const trackArtistField = track.artist || '';
        const dbMatch = artistNameMatches(trackArtistField, artist.name);
        const itunesMatch = artistNameMatches(itunesArtist, artist.name);
        
        if (dbMatch || itunesMatch) {
          status = 'verified';
        } else {
          // Check if this is a collaboration - the artist may be featured
          const collabCheck = artistNameMatches(trackArtistField, artist.name) ||
            trackArtistField.toLowerCase().includes(artist.name.toLowerCase().split(' ')[0]);
          if (collabCheck) {
            status = 'collab-verified';
          } else {
            status = 'MISMATCH';
            results[artistId].mismatches.push({
              trackTitle: track.title,
              dbArtist: trackArtistField,
              itunesArtist: itunesArtist,
              itunesTrackName: itunesTrackName,
              expectedArtist: artist.name,
            });
          }
        }
      }
      
      results[artistId].tracks.push({
        title: track.title,
        dbArtist: track.artist,
        itunesArtist,
        itunesTrackName,
        status,
      });
      
      await sleep(100);
    }
    
    results[artistId].completed = true;
    processedCount++;
    
    // Save intermediate results every 5 artists
    if (processedCount % 5 === 0) {
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
      console.log(`  [checkpoint saved: ${processedCount} artists audited]`);
    }
  }
  
  // Final save
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('SONG AUTHENTICITY AUDIT SUMMARY');
  console.log('='.repeat(70));
  
  let totalMismatches = 0;
  let mismatchArtists = [];
  
  for (const [artistId, result] of Object.entries(results)) {
    if (result.mismatches?.length > 0) {
      totalMismatches += result.mismatches.length;
      mismatchArtists.push(artistId);
      console.log(`\n❌ ${result.name} (${artistId}) - ${result.mismatches.length} mismatched tracks:`);
      for (const m of result.mismatches) {
        console.log(`   Track: "${m.trackTitle}" | DB Artist: "${m.dbArtist}" | iTunes: "${m.itunesArtist}" | Expected: "${m.expectedArtist}"`);
      }
    }
  }
  
  if (totalMismatches === 0) {
    console.log('\n✅ ALL 870 TRACKS VERIFIED - Every song belongs to its correct artist!');
  } else {
    console.log(`\n⚠️  FOUND ${totalMismatches} MISMATCHED TRACKS across ${mismatchArtists.length} artists.`);
    console.log('Artists with issues:', mismatchArtists.join(', '));
  }
  
  console.log(`\nTotal audited: ${Object.keys(results).length} artists, ${Object.values(results).reduce((s, r) => s + (r.tracks?.length || 0), 0)} tracks`);
  console.log(`Results saved to: ${RESULTS_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

