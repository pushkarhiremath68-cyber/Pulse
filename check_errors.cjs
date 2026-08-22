const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER_ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE_ERROR:', error.message);
  });

  await page.goto('http://localhost:3001', { waitUntil: 'networkidle2' });
  
  console.log('Clicking on a music card...');
  await page.click('.music-card'); // Click on a Dynamic Genre Shelf song
  
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking on a quick pick...');
  await page.click('.quick-pick-tile'); // Click on a quick pick song
  
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  console.log('Done.');
})();
