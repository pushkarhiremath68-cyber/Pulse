const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  let contentType = 'text/html';
  if (ext === '.js') contentType = 'application/javascript';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.json') contentType = 'application/json';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.svg') contentType = 'image/svg+xml';
  
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4175, async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.stack || err.message}`));

  await page.goto('http://localhost:4175', { waitUntil: 'networkidle2' });

  // 1. Play first song from Quick Picks (Main screen)
  console.log('Testing Play Home Track via window.playTrackDirect...');
  const playResult = await page.evaluate(async () => {
    try {
      const qp = window.__quickPicks;
      if (!qp || qp.length === 0) return { error: 'No quickpicks' };
      window.playTrackDirect(qp[0], qp);
      return { success: true, track: qp[0].title };
    } catch (e) {
      return { error: e.message };
    }
  });
  console.log('Play result:', playResult);
  await new Promise(r => setTimeout(r, 2000));

  // 2. Check Playbar state
  const playbarTitle = await page.$eval('#player-title', el => el.textContent).catch(() => 'N/A');
  const playbarArtist = await page.$eval('#player-artist', el => el.textContent).catch(() => 'N/A');
  console.log('Playbar now playing:', { playbarTitle, playbarArtist });

  // 3. Test Search
  console.log('Testing Search via window.executeSearch...');
  await page.evaluate(() => {
    window.executeSearch('Kesariya', false);
  });
  await new Promise(r => setTimeout(r, 4000));

  const searchCardsCount = await page.$$eval('.track-card', els => els.length).catch(() => 0);
  console.log('Search results count:', searchCardsCount);

  // 4. Play first search result
  if (searchCardsCount > 0) {
    const playSearchResult = await page.evaluate(() => {
      try {
        window.playSearchTrack(0);
        return { success: true };
      } catch (e) {
        return { error: e.message };
      }
    });
    console.log('Play search result:', playSearchResult);
    await new Promise(r => setTimeout(r, 2000));
    const newPlaybarTitle = await page.$eval('#player-title', el => el.textContent).catch(() => 'N/A');
    console.log('Playbar after search play:', newPlaybarTitle);
  }

  console.log('--- CONSOLE LOGS ---');
  console.log(consoleLogs.join('\n'));

  await browser.close();
  server.close();
});
