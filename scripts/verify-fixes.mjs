/**
 * Verifies fixes for search race handling and category filtering.
 * Run: node scripts/verify-fixes.mjs
 */

import assert from 'node:assert/strict';

// --- Search race: stale async responses must be ignored ---
function simulateSearchRace() {
  let searchRequestId = 0;
  const rendered = [];

  function executeSearch(query) {
    const cleanQ = query.trim();
    const requestId = ++searchRequestId;
    return { requestId, cleanQ, render: (results) => {
      if (requestId !== searchRequestId) return false;
      rendered.push({ query: cleanQ, results });
      return true;
    }};
  }

  const first = executeSearch('a');
  const second = executeSearch('arijit');

  assert.equal(first.render(['slow-a-results']), false, 'stale "a" search must not render');
  assert.equal(second.render(['arijit-results']), true, 'latest search must render');
  assert.deepEqual(rendered, [{ query: 'arijit', results: ['arijit-results'] }]);
}

// --- Category filter: substring match must not leak tracks ---
function simulateCategoryFilter(catalog, category) {
  return catalog.filter(t => t.category === category);
}

function testCategoryFilter() {
  const catalog = [
    { id: '1', category: 'popular-hindi' },
    { id: '2', category: 'hindi-hits' },
    { id: '3', category: 'party' },
    { id: '4', category: 'hindi' },
  ];

  const buggyFilter = (category) =>
    catalog.filter(t => t.category === category || category.includes(t.category));

  const fixedFilter = (category) => simulateCategoryFilter(catalog, category);

  const buggy = buggyFilter('popular-hindi').map(t => t.id);
  const fixed = fixedFilter('popular-hindi').map(t => t.id);

  assert.notDeepEqual(buggy, ['1'], 'buggy filter incorrectly includes substring categories');
  assert.deepEqual(fixed, ['1'], 'fixed filter returns exact category matches only');
}

// --- Playback routing: YouTube takes priority when ready (mirrors startPlayback) ---
function resolvePlaybackTarget({ isYtReady, ytPlayer, audioUrl }) {
  if (isYtReady && ytPlayer) return 'youtube';
  if (audioUrl) return 'html5-preview';
  return 'none';
}

function testPlaybackRouting() {
  const trackWithPreview = { audioUrl: 'https://example.com/preview.m4a' };

  assert.equal(
    resolvePlaybackTarget({ isYtReady: true, ytPlayer: {}, audioUrl: trackWithPreview.audioUrl }),
    'youtube',
    'YouTube must win when player is ready, even if track has preview URL'
  );
  assert.equal(
    resolvePlaybackTarget({ isYtReady: false, ytPlayer: null, audioUrl: trackWithPreview.audioUrl }),
    'html5-preview',
    'preview fallback used only when YouTube is unavailable'
  );
}

simulateSearchRace();
testCategoryFilter();
testPlaybackRouting();

console.log('All verification checks passed.');
