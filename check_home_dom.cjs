const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    consoleLogs.push(`[PAGE_ERROR] ${error.stack || error.message}`);
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  } catch (e) {
    try {
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
    } catch (e2) {
      consoleLogs.push(`[NAV_ERROR] ${e2.message}`);
    }
  }

  // Check DOM elements for songs
  const quickPicksCount = await page.$$eval('.quick-pick-tile', els => els.length).catch(() => 0);
  const musicCardsCount = await page.$$eval('.music-card', els => els.length).catch(() => 0);
  const shelfCount = await page.$$eval('.music-shelf-section', els => els.length).catch(() => 0);
  const curatedCount = await page.$$eval('.curated-playlist-card', els => els.length).catch(() => 0);

  console.log('--- DOM STATS ---');
  console.log('quickPicksCount:', quickPicksCount);
  console.log('musicCardsCount:', musicCardsCount);
  console.log('shelfCount:', shelfCount);
  console.log('curatedCount:', curatedCount);
  console.log('--- CONSOLE LOGS ---');
  console.log(consoleLogs.join('\n'));

  await browser.close();
})();
