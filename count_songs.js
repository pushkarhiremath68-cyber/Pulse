import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle0' });
  
  const cardCount = await page.evaluate(() => {
    return document.querySelectorAll('.music-card').length;
  });
  console.log('NUMBER OF MUSIC CARDS:', cardCount);
  
  await browser.close();
})();
