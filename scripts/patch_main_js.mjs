import fs from 'fs';

let js = fs.readFileSync('src/main.js', 'utf8');

// 1. Remove phone auth imports from firebaseAuthService
js = js.replace(/\s*sendPhoneOtp,/, '');
js = js.replace(/\s*verifyPhoneOtp,/, '');

// 2. Remove the auto-play video preview timeout in goToHeroSlide
const oldTimeout = `    // Auto-play the video preview automatically for the new slide
    setTimeout(() => {
      window.toggleSlidePreview(nextIndex, true);
    }, 400);`;

if (js.includes(oldTimeout)) {
  js = js.replace(oldTimeout, '    // Video preview is only mounted on explicit listener click');
  console.log('Removed glitchy auto-play video preview timeout from goToHeroSlide');
} else {
  // Try regex
  js = js.replace(/setTimeout\(\(\)\s*=>\s*\{\s*window\.toggleSlidePreview\(nextIndex,\s*true\);\s*\}, 400\);/g, '// Video preview only on user click');
  console.log('Replaced auto preview via regex');
}

// 3. Fix pauseHeroAutoPlay & resumeHeroAutoPlay
const oldPauseResume = `  window.pauseHeroAutoPlay = function() {
    // Disabled per user request (play continuously)
  };

  window.resumeHeroAutoPlay = function() {
    // Disabled per user request
  };`;

const newPauseResume = `  window.pauseHeroAutoPlay = function() {
    isHeroPaused = true;
    if (heroAutoPlayInterval) {
      clearInterval(heroAutoPlayInterval);
      heroAutoPlayInterval = null;
    }
    const banner = document.getElementById('hero-banner');
    if (banner) banner.classList.add('paused');
  };

  window.resumeHeroAutoPlay = function() {
    isHeroPaused = false;
    const banner = document.getElementById('hero-banner');
    if (banner) banner.classList.remove('paused');
    window.startHeroAutoPlayTimer();
  };`;

if (js.includes(oldPauseResume)) {
  js = js.replace(oldPauseResume, newPauseResume);
  console.log('Updated pauseHeroAutoPlay and resumeHeroAutoPlay');
} else {
  console.log('oldPauseResume not found with exact match');
}

// 4. Remove Phone Auth Controller in src/main.js
const phoneAuthStart = '// ---------------------------------------------------------------------------\n  // PHONE NUMBER AUTHENTICATION CONTROLLER (SMS OTP)';
const phoneAuthEnd = 'window.handleSignOut = async function()';

const startIdx = js.indexOf(phoneAuthStart);
const endIdx = js.indexOf(phoneAuthEnd);

if (startIdx !== -1 && endIdx !== -1 && startIdx < endIdx) {
  js = js.substring(0, startIdx) + js.substring(endIdx);
  console.log('Successfully removed Phone Auth Controller from src/main.js!');
} else {
  console.log('Could not find Phone Auth Controller bounds:', { startIdx, endIdx });
}

// 5. Clean up any isPhone or provider === 'phone' in user state
js = js.replace(/const isPhone = user && user\.provider === 'phone';/g, 'const isPhone = false;');
js = js.replace(/const isRealUser = isGoogle \|\| isEmail \|\| isPhone;/g, 'const isRealUser = isGoogle || isEmail;');

fs.writeFileSync('src/main.js', js, 'utf8');
console.log('src/main.js updated successfully!');
