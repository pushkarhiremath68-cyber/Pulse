import fs from 'fs';

let js = fs.readFileSync('src/main.js', 'utf8');

const regexPhone = /\/\/\s*PHONE NUMBER AUTHENTICATION CONTROLLER[\s\S]*?(?=window\.handleSignOut\s*=\s*async)/;
if (regexPhone.test(js)) {
  js = js.replace(regexPhone, '');
  console.log('Removed Phone Auth Controller via regex!');
} else {
  console.log('regexPhone did not match');
}

const regexPauseResume = /window\.pauseHeroAutoPlay\s*=\s*function\(\)\s*\{[\s\S]*?window\.resumeHeroAutoPlay\s*=\s*function\(\)\s*\{[\s\S]*?\};/;
const newPauseResume = `window.pauseHeroAutoPlay = function() {
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

if (regexPauseResume.test(js)) {
  js = js.replace(regexPauseResume, newPauseResume);
  console.log('Replaced pause/resume hero auto play!');
} else {
  console.log('regexPauseResume did not match');
}

fs.writeFileSync('src/main.js', js, 'utf8');
