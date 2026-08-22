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

server.listen(4174, async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.stack || err.message}`));

  await page.goto('http://localhost:4174', { waitUntil: 'networkidle2' });

  const quickPicks = await page.$$eval('.quick-pick-tile', els => els.length).catch(() => 0);
  const musicCards = await page.$$eval('.music-card', els => els.length).catch(() => 0);

  console.log('Mobile Home Stats:', { quickPicks, musicCards });

  // Test Search Input
  await page.type('#global-search-input', 'Kesariya');
  await new Promise(r => setTimeout(r, 2500));

  const searchCards = await page.$$eval('.track-card', els => els.length).catch(() => 0);
  console.log('Mobile Search Cards for Kesariya:', searchCards);

  // Test clicking first song
  if (musicCards > 0) {
    console.log('Clicking first home music card...');
    await page.click('.music-card');
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('Console output:\n' + consoleLogs.join('\n'));

  await browser.close();
  server.close();
});
