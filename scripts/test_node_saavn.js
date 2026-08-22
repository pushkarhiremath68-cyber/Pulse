import CryptoJS from 'crypto-js';

function decryptSaavnMediaUrl(encryptedMediaUrl) {
  if (!encryptedMediaUrl || typeof encryptedMediaUrl !== 'string') return null;
  try {
    const key = CryptoJS.enc.Utf8.parse("38346591");
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl.trim()) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    if (!url || !url.startsWith('http')) return null;

    const u320 = url.replace('_96.mp4', '_320.mp4').replace('_48.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4').replace('_96.m4a', '_320.m4a').replace('_160.m4a', '_320.m4a');
    const u160 = url.replace('_96.mp4', '_160.mp4').replace('_48.mp4', '_160.mp4').replace('_320.mp4', '_160.mp4').replace('_96.m4a', '_160.m4a');
    return {
      '320': u320,
      '160': u160,
      '96': url
    };
  } catch (e) {
    return null;
  }
}

async function testNodeSaavn(query) {
  const url = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  const json = await res.json();
  console.log(`Results for "${query}":`, json.results?.length);
  for (const item of (json.results || []).slice(0, 3)) {
    const dec = decryptSaavnMediaUrl(item.encrypted_media_url);
    console.log(`  - Title: ${item.song} by ${item.singers}`);
    console.log(`    320k Stream: ${dec?.['320']}`);
  }
}

async function run() {
  await testNodeSaavn('Kesariya');
  await testNodeSaavn('Blinding Lights');
  await testNodeSaavn('Starboy');
  await testNodeSaavn('Singara Siriye');
}

run();
