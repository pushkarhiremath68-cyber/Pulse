import fs from 'fs';

async function runVerification() {
  console.log('🧪 RUNNING PULSE MUSIC ARTWORK & DEFAULT PERMISSIONS VERIFICATION\n');

  const indexHtml = fs.readFileSync('index.html', 'utf8');
  const mainJs = fs.readFileSync('src/main.js', 'utf8');
  const authJs = fs.readFileSync('src/firebaseAuthService.js', 'utf8');
  const playbarJs = fs.readFileSync('src/playbarController.js', 'utf8');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, detail = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // Group 1: Default Access & Zero-Friction Permissions
  console.log('--- 1. Default Access & Permission Gate Removal ---');
  assert('isGateUnlocked returns true unconditionally', 
    authJs.includes('isGateUnlocked()') && authJs.includes('return true;'));
  
  assert('index.html head has CSS display: none !important for #auth-gate-screen',
    indexHtml.includes('#auth-gate-screen,') && indexHtml.includes('display: none !important;'));

  assert('index.html head immediately adds gate-already-unlocked class and stores pulse_gate_unlocked',
    indexHtml.includes("document.documentElement.classList.add('gate-already-unlocked')") &&
    indexHtml.includes("localStorage.setItem('pulse_gate_unlocked', 'true')"));

  assert('Auth gate overlay element has inline display: none !important',
    indexHtml.includes('id="auth-gate-screen"') && indexHtml.includes('style="display: none !important;"'));

  assert('checkAuthGateState in main.js unconditionally hides gate and unlocks app',
    mainJs.includes('gate.classList.add(\'gate-unlocked\')') &&
    mainJs.includes('gate.style.display = \'none\'') &&
    mainJs.includes('app.classList.remove(\'auth-gate-locked\')'));

  assert('handleSignOut does not lock the screen or reset gate to false',
    !mainJs.includes('setGateUnlocked(false);'));

  assert('PWA install prompt removed aggressive 3-second auto timer',
    !mainJs.includes('setTimeout(() => { if (banner) banner.classList.remove(\'hidden\'); }, 3000)'));

  // Group 2: Song Original Icon & Album Artwork Availability
  console.log('\n--- 2. Song Original Icon & Album Artwork Availability ---');
  assert('ensureOriginalAlbumCover exported in playbarController',
    playbarJs.includes('export async function ensureOriginalAlbumCover(track)'));

  assert('ensureOriginalAlbumCover includes Tier 1 iTunes 1000x1000 HD artwork',
    playbarJs.includes('https://itunes.apple.com/search') &&
    playbarJs.includes('1000x1000bb'));

  assert('ensureOriginalAlbumCover includes Tier 2 JioSaavn 500x500 master artwork',
    playbarJs.includes('https://www.jiosaavn.com/api.php') &&
    playbarJs.includes('500x500'));

  assert('updateMediaSession uses dynamic MIME type detection for artwork',
    playbarJs.includes('artworkUrl.includes(\'.webp\') ? \'image/webp\' : \'image/jpeg\''));

  assert('updateMediaSession includes universal untyped fallback for iOS/Android/Windows',
    playbarJs.includes('{ src: artworkUrl }'));

  assert('preloadInitialTrackUI pre-populates playbar with high-res album art on load',
    playbarJs.includes('export function preloadInitialTrackUI()') &&
    playbarJs.includes('1000x1000bb.jpg'));

  assert('initPlaybarController invokes preloadInitialTrackUI()',
    playbarJs.includes('preloadInitialTrackUI();'));

  assert('playTrack stores last track in localStorage (pulse_last_track)',
    playbarJs.includes("localStorage.setItem('pulse_last_track', JSON.stringify(track))"));

  // Group 3: Player Controls (Seek -5s / +5s / Play / Prev / Next)
  console.log('\n--- 3. Player Controls & Seek Icons ---');
  assert('Seek backward 5s button present in index.html with SVG number 5',
    indexHtml.includes('id="btn-seek-backward"') && indexHtml.includes('<text x="12" y="15.5" font-size="8.5" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, -apple-system, sans-serif">5</text>'));

  assert('Seek forward 5s button present in index.html with SVG number 5',
    indexHtml.includes('id="btn-seek-forward"') && indexHtml.includes('<text x="12" y="15.5" font-size="8.5" font-weight="800" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui, -apple-system, sans-serif">5</text>'));

  assert('Fullscreen player has dedicated seek backward 5s SVG',
    indexHtml.includes('fs-step-btn') && indexHtml.includes('icon-seek'));

  // Group 4: Live Artwork API Resolution Test
  console.log('\n--- 4. Live iTunes 1000x1000 Artwork Resolution Test ---');
  const testTracks = [
    { title: 'Blinding Lights', artist: 'The Weeknd' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Die With A Smile', artist: 'Lady Gaga Bruno Mars' }
  ];

  for (const t of testTracks) {
    try {
      const q = `${t.title} ${t.artist}`;
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=1`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const art = data.results?.[0]?.artworkUrl100?.replace('100x100bb', '1000x1000bb');
        if (art && art.includes('1000x1000')) {
          assert(`Live 1000x1000 HD Artwork for "${t.title}" resolved: ${art.slice(0, 50)}...`, true);
        } else {
          assert(`Live artwork for "${t.title}"`, false, 'No artwork URL returned');
        }
      } else {
        assert(`Live search for "${t.title}"`, false, `HTTP ${res.status}`);
      }
    } catch (e) {
      assert(`Live search for "${t.title}"`, false, e.message);
    }
  }

  console.log(`\n==============================================`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
