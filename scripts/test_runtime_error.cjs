const { JSDOM } = require('jsdom');
const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');

const dom = new JSDOM(html, {
  url: 'https://pulse-music-app-68.web.app/?source=pwa',
  runScripts: 'dangerously',
  resources: 'usable'
});

const { window } = dom;

window.addEventListener('error', (e) => {
  console.error('JS RUNTIME ERROR:', e.message, e.error);
});

console.log('Document loaded successfully in JSDOM.');
console.log('Title:', window.document.title);
console.log('Quick picks container innerHTML length:', (window.document.getElementById('home-quick-picks-container')?.innerHTML || '').length);
console.log('Shelves container innerHTML length:', (window.document.getElementById('dynamic-home-shelves')?.innerHTML || '').length);
