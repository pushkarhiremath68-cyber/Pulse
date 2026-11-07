import https from 'https';

https.get('https://pulse-music-app-68.web.app/index.html', res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Live HTTP Status:', res.statusCode);
    console.log('Includes theme-color #000000:', data.includes('content="#000000"'));
    console.log('Includes background-color #000000:', data.includes('background-color: #000000 !important;'));
  });
});

