import fs from 'fs';

let main = fs.readFileSync('src/main.js', 'utf8');

// 1. Update renderSongCard cover resolution and fallback
const oldSongCardRegex = /const coverUrl = track\.coverUrl \|\| track\.cover \|\| \(ytId \? `https:\/\/i\.ytimg\.com\/vi\/\$\{ytId\}\/hqdefault\.jpg` : '\.\/music-cover\.svg'\);[\r\n\s]+const title = track\.title \|\| 'Untitled Track';[\r\n\s]+const artist = track\.artist \|\| 'Pulse Artist';[\r\n\s]+const badge = options\.badge \|\| \(options\.showBadge \? \(track\.genre \|\| 'Master'\) : null\);[\s\S]*?<img src="\$\{coverUrl\}" alt="\$\{escapeHtml\(title\)\}" loading="lazy" onerror="this\.onerror=null; this\.src='\.\/music-cover\.svg';">/;

const newSongCardSnippet = `let coverUrl = track.coverUrl || track.cover;
    if (!coverUrl || coverUrl === './music-cover.svg' || coverUrl.includes('music-cover.svg')) {
      if (ytId && ytId.length >= 8) {
        coverUrl = \`https://i.ytimg.com/vi/\${ytId}/hqdefault.jpg\`;
      } else if (window.catalogService && typeof window.catalogService.findCatalogCover === 'function') {
        const found = window.catalogService.findCatalogCover(track.title, track.artist);
        if (found) coverUrl = found;
      }
    }
    if (!coverUrl) {
      coverUrl = \`https://api.dicebear.com/7.x/initials/svg?seed=\${encodeURIComponent(track.title || 'Track')}&backgroundColor=8b5cf6\`;
    }
    const title = track.title || 'Untitled Track';
    const artist = track.artist || 'Pulse Artist';
    const badge = options.badge || (options.showBadge ? (track.genre || 'Master') : null);

    const current = window.pulseState && window.pulseState.currentTrack;
    const isPlaying = window.pulseState && window.pulseState.isPlaying;
    const isCurrentActive = current && (
      current.id === trackId ||
      (ytId && current.ytId === ytId) ||
      (current.title === title && current.artist === artist)
    );
    const isFav = isFavorite(trackId);

    return \`
      <div class="music-card hover-glow \${isCurrentActive && isPlaying ? 'card-active-playing' : ''}"
           data-track-id="\${escapeHtml(trackId)}"
           data-yt-id="\${escapeHtml(ytId)}"
           onclick="window.playTrackDirect(\${listGlobalKey}[\${index}], \${listGlobalKey})">
        <div class="card-image-wrapper">
          <img src="\${coverUrl}" alt="\${escapeHtml(title)}" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';">`;

if (oldSongCardRegex.test(main)) {
  main = main.replace(oldSongCardRegex, newSongCardSnippet);
  console.log('Successfully updated renderSongCard cover resolver in main.js!');
} else {
  console.warn('Could not match oldSongCardRegex in main.js');
}

// 2. Update renderRecentlyPlayedShelf to heal history tracks
const oldRecentRegex = /window\.renderRecentlyPlayedShelf = async function\(\) \{[\r\n\s]+const shelf = document\.getElementById\('home-recently-played-shelf'\);[\r\n\s]+const container = document\.getElementById\('home-recently-played-container'\);[\r\n\s]+if \(!shelf \|\| !container\) return;[\r\n\s]+try \{[\r\n\s]+const history = await getHistory\(15\);[\r\n\s]+if \(Array\.isArray\(history\) && history\.length > 0\) \{[\r\n\s]+window\.__recentlyPlayedHistory = history;[\r\n\s]+shelf\.style\.display = 'block';[\r\n\s]+container\.innerHTML = history\.map\(\(track, idx\) =>[\r\n\s]+window\.renderSongCard\(track, idx, 'window\.__recentlyPlayedHistory', \{ badge: 'Recent' \}\)[\r\n\s]+\)\.join\(''\);[\r\n\s]+\} else \{[\r\n\s]+shelf\.style\.display = 'none';[\r\n\s]+\}[\r\n\s]+\} catch\(e\) \{[\r\n\s]+shelf\.style\.display = 'none';[\r\n\s]+\}[\r\n\s]+\};/;

const newRecentCode = `window.renderRecentlyPlayedShelf = async function() {
    const shelf = document.getElementById('home-recently-played-shelf');
    const container = document.getElementById('home-recently-played-container');
    if (!shelf || !container) return;

    try {
      const history = await getHistory(15);
      if (Array.isArray(history) && history.length > 0) {
        history.forEach(t => {
          if (!t.coverUrl || t.coverUrl === './music-cover.svg' || t.coverUrl.trim() === '') {
            if (t.cover && t.cover !== './music-cover.svg') t.coverUrl = t.cover;
            else if (t.ytId) t.coverUrl = \`https://i.ytimg.com/vi/\${t.ytId}/hqdefault.jpg\`;
            else if (t.id && String(t.id).startsWith('ytm-')) t.coverUrl = \`https://i.ytimg.com/vi/\${String(t.id).replace('ytm-', '')}/hqdefault.jpg\`;
            else if (window.catalogService?.findCatalogCover) {
              const found = window.catalogService.findCatalogCover(t.title, t.artist);
              if (found) t.coverUrl = found;
            }
          }
        });
        window.__recentlyPlayedHistory = history;
        shelf.style.display = 'block';
        container.innerHTML = history.map((track, idx) => 
          window.renderSongCard(track, idx, 'window.__recentlyPlayedHistory', { badge: 'Recent' })
        ).join('');
      } else {
        shelf.style.display = 'none';
      }
    } catch(e) {
      shelf.style.display = 'none';
    }
  };`;

if (oldRecentRegex.test(main)) {
  main = main.replace(oldRecentRegex, newRecentCode);
  console.log('Successfully updated renderRecentlyPlayedShelf in main.js!');
} else {
  console.warn('Could not match oldRecentRegex in main.js');
}

// 3. Update executeSearch to Instant 0ms First-Paint + 180ms Parallel Remote Streaming
const oldExecuteSearchRegex = /window\.executeSearch = function\(query, isTyping = false\) \{[\s\S]*?renderSearchResults\(results, matchingArtists\);[\r\n\s]+\}, isTyping \? 500 : 0\);[\r\n\s]+\};/;

const newExecuteSearchCode = `window.executeSearch = function(query, isTyping = false) {
    if (!query || query.trim().length === 0) return;
    window.switchView('search-view');

    const cleanQ = query.trim();
    const label = document.getElementById('search-query-label');
    const count = document.getElementById('search-count');
    if (label) label.textContent = cleanQ;

    // STEP 1: ULTRA-FAST 0MS INSTANT LOCAL SEARCH (<10ms first-paint)
    const instantArtists = window.catalogService && typeof window.catalogService.searchArtists === 'function'
      ? window.catalogService.searchArtists(cleanQ)
      : [];
    const instantTracks = window.catalogService && typeof window.catalogService.searchCatalogTracks === 'function'
      ? window.catalogService.searchCatalogTracks(cleanQ)
      : [];

    if (instantTracks.length > 0 || instantArtists.length > 0) {
      if (count) {
        count.textContent = \`\${instantArtists.length > 0 ? instantArtists.length + ' artist' + (instantArtists.length > 1 ? 's' : '') + ' & ' : ''}\${instantTracks.length} instant songs found (loading more...)\`;
      }
      renderSearchResults(instantTracks, instantArtists);
    } else if (count) {
      count.textContent = 'Searching worldwide & multilingual catalogs...';
    }

    // STEP 2: PARALLEL REMOTE STREAM (180ms debounce)
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
      const gen = ++searchGeneration;

      const tracksPromise = window.musicService ? window.musicService.searchTracks(cleanQ, 50) : Promise.resolve([]);
      const artistsPromise = (instantArtists.length < 4 && window.musicService && typeof window.musicService.searchDynamicArtists === 'function')
        ? window.musicService.searchDynamicArtists(cleanQ)
        : Promise.resolve([]);

      try {
        const [tracksRes, artistsRes] = await Promise.allSettled([tracksPromise, artistsPromise]);
        if (gen !== searchGeneration) return; // Stale search superseded by newer keystroke

        const remoteTracks = tracksRes.status === 'fulfilled' && Array.isArray(tracksRes.value) ? tracksRes.value : [];
        const dynamicArtists = artistsRes.status === 'fulfilled' && Array.isArray(artistsRes.value) ? artistsRes.value : [];

        // Merge matching artists
        const mergedArtists = [...instantArtists];
        for (const da of dynamicArtists) {
          if (!mergedArtists.some(ma => ma.name.toLowerCase() === da.name.toLowerCase())) {
            mergedArtists.push(da);
          }
        }

        // Merge and deduplicate tracks
        const mergedTracks = [];
        const seenTrackKeys = new Set();
        const addMerged = (t) => {
          if (!t || !t.title) return;
          const k = \`\${(t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')}___\${(t.artist || '').toLowerCase().replace(/[^a-z0-9]/g, '')}\`;
          if (!seenTrackKeys.has(k)) {
            seenTrackKeys.add(k);
            mergedTracks.push(t);
          }
        };

        // Prefer remote tracks with full streams, fall back to local instant tracks
        remoteTracks.forEach(addMerged);
        instantTracks.forEach(addMerged);

        if (count) {
          if (mergedArtists.length > 0) {
            count.textContent = \`\${mergedArtists.length} artist\${mergedArtists.length > 1 ? 's' : ''} & \${mergedTracks.length} songs found worldwide\`;
          } else {
            count.textContent = \`\${mergedTracks.length} songs found worldwide\`;
          }
        }

        renderSearchResults(mergedTracks, mergedArtists);
      } catch (err) {
        console.warn('Search stream error:', err);
      }
    }, isTyping ? 180 : 0);
  };`;

if (oldExecuteSearchRegex.test(main)) {
  main = main.replace(oldExecuteSearchRegex, newExecuteSearchCode);
  console.log('Successfully updated executeSearch in main.js to Instant 0ms Search!');
} else {
  console.warn('Could not match oldExecuteSearchRegex in main.js');
}

fs.writeFileSync('src/main.js', main, 'utf8');
console.log('Finished updating main.js!');
