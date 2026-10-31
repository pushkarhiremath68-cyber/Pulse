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
  const q = event.queryStringParameters.q || '';
  const id = event.queryStringParameters.id || '';

  try {
    const query = q || id;
    if (query) {
      const saavnApiUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(query)}`;
      const fetchRes = await fetch(saavnApiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const data = await fetchRes.json();
      const results = data.results || [];
      for (const top of results) {
        if (top && top.encrypted_media_url) {
          const dec = decryptSaavnUrl(top.encrypted_media_url);
          if (dec) {
            const streamUrl = dec['320'] || dec['160'] || dec['96'];
            if (streamUrl) {
              const saavnTitle = (top.song || top.title || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
              const saavnArtist = (top.singers || top.primary_artists || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
              return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                  streamUrl: streamUrl,
                  bitrate: '320kbps',
                  codec: 'mp4/aac',
                  duration: parseInt(top.duration, 10) || 220,
                  title: saavnTitle,
                  artist: saavnArtist,
                  language: top.language || '',
                  source: 'Pulse Master Studio 320k'
                })
              };
            }
          }
        }
      }
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'No stream found' })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
