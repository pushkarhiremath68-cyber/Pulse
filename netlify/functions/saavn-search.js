const CryptoJS = require('crypto-js');

function decryptSaavnUrl(encryptedMediaUrl) {
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

exports.handler = async function(event, context) {
  const q = event.queryStringParameters.q || event.queryStringParameters.query || '';
  if (!q) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'SUCCESS', results: [] })
    };
  }

  try {
    const cleanQ = q.trim().replace(/[()\[\]{}"'|]/g, ' ');
    const saavnApiUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=30&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQ)}`;
    
    const fetchRes = await fetch(saavnApiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    
    const data = await fetchRes.json();
    const rawResults = data.results || [];
    const results = [];

    for (const item of rawResults) {
      let streamUrl = '';
      if (item.encrypted_media_url) {
        const dec = decryptSaavnUrl(item.encrypted_media_url);
        if (dec) streamUrl = dec['320'] || dec['160'] || dec['96'] || '';
      }

      let cover = (item.image || '').replace('50x50', '500x500').replace('150x150', '500x500');
      const title = (item.song || item.title || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();
      const artist = (item.singers || item.primary_artists || item.more_info?.singers || item.artist || 'Pulse Artist').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").trim();

      results.push({
        id: `saavn-${item.id || Math.random().toString(36).substr(2, 8)}`,
        title,
        artist,
        album: (item.album || item.more_info?.album || 'Studio Release').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim(),
        coverUrl: cover || './pulse-logo.png',
        duration: parseInt(item.duration, 10) || 220,
        streamUrl,
        previewUrl: '',
        genre: item.language ? `${item.language.charAt(0).toUpperCase() + item.language.slice(1)} Studio` : 'Master Studio Audio',
        source: 'Studio Master Audio (YouTube)'
      });
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ status: 'SUCCESS', results })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message, results: [] })
    };
  }
};
