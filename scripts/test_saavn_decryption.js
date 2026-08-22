import CryptoJS from 'crypto-js';

function decryptSaavnMediaUrl(encryptedMediaUrl) {
  if (!encryptedMediaUrl) return null;
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;

    const u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4').replace('_96.m4a', '_320.m4a');
    const u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4').replace('_96.m4a', '_160.m4a');
    return {
      '320': u320,
      '160': u160,
      '96': url
    };
  } catch (e) {
    console.error('Decryption failed:', e);
    return null;
  }
}

async function testJioSaavnDecryption() {
  console.log('Testing JioSaavn search and pure JS decryption...');
  const res = await fetch('https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=3&p=1&_marker=0&ctx=android&q=Kesariya', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const data = await res.json();
  const first = data.results[0];
  console.log('Found song:', first.song, 'Singers:', first.singers);
  console.log('Encrypted url:', first.encrypted_media_url);

  const dec = decryptSaavnMediaUrl(first.encrypted_media_url);
  console.log('Decrypted streams:');
  console.log('320k URL:', dec['320']);
  console.log('160k URL:', dec['160']);

  // Test if audio URL actually plays / returns 200 or 206
  const audioHead = await fetch(dec['320'], { method: 'HEAD' });
  console.log('Audio stream HEAD status:', audioHead.status, 'Content-Type:', audioHead.headers.get('content-type'), 'Content-Length:', audioHead.headers.get('content-length'));
}

testJioSaavnDecryption();
