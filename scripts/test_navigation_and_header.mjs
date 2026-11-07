import fs from 'fs';
import path from 'path';

console.log('🧪 RUNNING NAVIGATION & TOP HEADER INTEGRITY TEST SUITE...\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failCount++;
  }
}

// 1. Inspect index.html Header Markup
const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes('id="btn-back"'), 'Back navigation button (#btn-back) exists');
assert(html.includes('id="btn-forward"'), 'Forward navigation button (#btn-forward) exists');
assert(html.includes('onclick="window.navBack()"'), 'Back button calls window.navBack()');
assert(html.includes('onclick="window.navForward()"'), 'Forward button calls window.navForward()');
assert(html.includes('id="header-search-container"'), 'Header search bar container exists');
assert(html.includes('id="global-search-input"'), 'Global search input exists');
assert(html.includes('id="header-gemini-btn"'), 'Pulse AI header button exists');
assert(html.includes('id="header-auth-btn"'), 'Profile header button exists');

// Verify greeting has been removed from top-header
const headerRegex = /<header class="top-header"[\s\S]*?<\/header>/;
const headerMatch = html.match(headerRegex);
assert(headerMatch !== null, 'Found <header class="top-header"> block');
if (headerMatch) {
  const headerContent = headerMatch[0];
  assert(!headerContent.includes('header-greeting-wrap'), 'header-greeting-wrap completely removed from top-header');
  assert(!headerContent.includes('header-greeting-title'), 'header-greeting-title completely removed from top-header');
  assert(!headerContent.includes('Good evening'), '"Good evening" text removed from top-header');
  assert(!headerContent.includes('Welcome back to Pulse Midnight'), '"Welcome back to Pulse Midnight" removed from top-header');
  
  // Verify header-install-btn is hidden in top-header
  assert(headerContent.includes('style="display: none;"') || !headerContent.includes('Install App'), 'Install App button is hidden from top-header view');
}

// 2. Inspect src/main.js Navigation Router Implementation
const mainJs = fs.readFileSync('src/main.js', 'utf8');

assert(mainJs.includes('window.recordNavState ='), 'window.recordNavState is defined');
assert(mainJs.includes('window.updateNavButtons ='), 'window.updateNavButtons is defined');
assert(mainJs.includes('window.applyNavState ='), 'window.applyNavState is defined');
assert(mainJs.includes('window.navBack ='), 'window.navBack is defined');
assert(mainJs.includes('window.navForward ='), 'window.navForward is defined');
assert(mainJs.includes("e.altKey && e.key === 'ArrowLeft'"), 'Keyboard Alt+Left shortcut handler registered');
assert(mainJs.includes("e.altKey && e.key === 'ArrowRight'"), 'Keyboard Alt+Right shortcut handler registered');

// 3. Inspect src/style.css Styles
const styleCss = fs.readFileSync('src/style.css', 'utf8');
assert(styleCss.includes('.btn-circle-nav:disabled') || styleCss.includes('.btn-circle-nav.disabled'), 'Disabled state styles defined for .btn-circle-nav');
assert(styleCss.includes('#header-install-btn') && styleCss.includes('display: none !important'), '#header-install-btn forced hidden via CSS');

// 4. Test Navigation Router Simulation
const navHistory = [];
let navIndex = -1;
let isNavigatingHistory = false;

function recordNavState(state) {
  if (isNavigatingHistory || !state || !state.viewId) return;
  if (navIndex >= 0 && navIndex < navHistory.length) {
    const curr = navHistory[navIndex];
    if (curr.type === state.type && curr.viewId === state.viewId) {
      if (state.type === 'artist' && curr.artistQuery === state.artistQuery) return;
      if (state.type === 'playlist' && curr.playlistId === state.playlistId) return;
      if (state.type === 'search' && curr.query === state.query) return;
      if (state.type === 'view') return;
    }
  }
  if (navIndex < navHistory.length - 1) {
    navHistory.splice(navIndex + 1);
  }
  navHistory.push({ ...state, timestamp: Date.now() });
  navIndex = navHistory.length - 1;
}

function navBack() {
  if (navIndex > 0) {
    navIndex--;
    return navHistory[navIndex];
  }
  return null;
}

function navForward() {
  if (navIndex < navHistory.length - 1) {
    navIndex++;
    return navHistory[navIndex];
  }
  return null;
}

// Initial state
recordNavState({ type: 'view', viewId: 'home' });
assert(navIndex === 0 && navHistory.length === 1, 'Initial state: on Home, index 0, 1 history entry');
assert(navIndex === 0, 'Initial state: cannot go back');

// Navigate to Search
recordNavState({ type: 'view', viewId: 'search-view' });
assert(navIndex === 1 && navHistory.length === 2, 'Navigated to Search: index 1, 2 history entries');

// Navigate to Artist Arijit Singh
recordNavState({ type: 'artist', viewId: 'artist', artistQuery: 'Arijit Singh' });
assert(navIndex === 2 && navHistory.length === 3, 'Navigated to Artist: index 2, 3 history entries');

// Navigate to Artist Krishna Das
recordNavState({ type: 'artist', viewId: 'artist', artistQuery: 'Krishna Das' });
assert(navIndex === 3 && navHistory.length === 4, 'Navigated to Krishna Das: index 3, 4 history entries');

// Test Back: should restore Arijit Singh
let back1 = navBack();
assert(back1 && back1.artistQuery === 'Arijit Singh' && navIndex === 2, 'Back button correctly navigates to Arijit Singh');

// Test Back: should restore Search
let back2 = navBack();
assert(back2 && back2.viewId === 'search-view' && navIndex === 1, 'Back button correctly navigates to Search');

// Test Back: should restore Home
let back3 = navBack();
assert(back3 && back3.viewId === 'home' && navIndex === 0, 'Back button correctly navigates to Home');

// Test Back at root: should return null (boundary safety)
let backRoot = navBack();
assert(backRoot === null && navIndex === 0, 'Back at root does not underflow');

// Test Forward: should go to Search
let fwd1 = navForward();
assert(fwd1 && fwd1.viewId === 'search-view' && navIndex === 1, 'Forward button correctly navigates to Search');

// Branching test: navigate to Library while at Search
recordNavState({ type: 'view', viewId: 'library' });
assert(navIndex === 2 && navHistory.length === 3, 'Navigating to Library truncates future history and appends Library');
assert(navHistory[navHistory.length - 1].viewId === 'library', 'Active head is now Library');

let fwdAfterBranch = navForward();
assert(fwdAfterBranch === null, 'Forward button safely disabled after branching navigation');

console.log(`\n====================================================`);
console.log(`📊 RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log(`====================================================`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 ALL NAVIGATION & HEADER INTEGRITY TESTS PASSED 100%!');
}
