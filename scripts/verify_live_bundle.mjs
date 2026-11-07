import fs from 'fs';

async function verifyLive() {
  const html = await fetch('https://pulse-music-app-68.web.app').then(r => r.text());
  const match = html.match(/src="([^"]*assets\/index-[^"]+\.js)"/);
  if (match) {
    let path = match[1];
    if (path.startsWith('.')) path = path.slice(1);
    if (!path.startsWith('/')) path = '/' + path;
    const jsUrl = 'https://pulse-music-app-68.web.app' + path;
    console.log('Live bundle URL:', jsUrl);
    const js = await fetch(jsUrl).then(r => r.text());
    console.log('Includes verified Arijit portrait:', js.includes('ac5350cff290edd5b69fa584b8b1bd4f'));
    console.log('Includes Ranbir Kapoor cover:', js.includes('9f13ca3b-e533-03e0-f19a-f0aaa774581d'));
    console.log('Includes verified KK portrait:', js.includes('e118eeb5332fe76610d4b355fdb61b03'));
    console.log('Includes verified Sonu Nigam portrait:', js.includes('812220125c4f0db57050438b65afcf78'));
    console.log('Includes verified Michael Jackson portrait:', js.includes('97fae13b2b30e4aec2e8c9e0c7839d92'));
  } else {
    console.log('Could not find JS bundle script tag in live HTML');
  }
}
verifyLive();
