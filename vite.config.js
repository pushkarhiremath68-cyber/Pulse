import { defineConfig } from 'vite';
import CryptoJS from 'crypto-js';

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

function pulseApiPlugin() {
  return {
    name: 'pulse-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const pathname = urlObj.pathname;

        if (pathname === '/api/saavn-search' || pathname === '/api/search') {
          const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
          if (!q) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'SUCCESS', results: [] }));
            return;
          }

          try {
            const cleanQ = q.trim().replace(/[()\[\]{}"'|]/g, ' ');
            const saavnApiUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=20&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQ)}`;
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

            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ status: 'SUCCESS', results }));
            return;
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message, results: [] }));
            return;
          }
        }

        if (pathname === '/api/ytm/stream') {
          const q = urlObj.searchParams.get('q') || '';
          const id = urlObj.searchParams.get('id') || '';

          try {
            const query = q || id;
            if (query) {
              const saavnApiUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(query)}`;
              const fetchRes = await fetch(saavnApiUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
              });
              const data = await fetchRes.json();
              const top = data.results?.[0];
              if (top && top.encrypted_media_url) {
                const dec = decryptSaavnUrl(top.encrypted_media_url);
                if (dec) {
                  res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  });
                  res.end(JSON.stringify({
                    streamUrl: dec['320'] || dec['160'] || dec['96'],
                    bitrate: '320kbps',
                    codec: 'mp4/aac',
                    duration: parseInt(top.duration, 10) || 220,
                    title: top.song || top.title || '',
                    artist: top.singers || top.primary_artists || '',
                    source: 'Pulse Master Studio 320k'
                  }));
                  return;
                }
              }
            }

            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No stream found' }));
            return;
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
        }

        if (pathname === '/api/yt/search') {
          const q = urlObj.searchParams.get('q') || '';
          if (!q) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ results: [] }));
            return;
          }
          try {
            const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' audio')}`;
            const ytRes = await fetch(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
              }
            });
            const html = await ytRes.text();
            const match = html.match(/var\s+ytInitialData\s*=\s*({.+?});\s*<\/script>/s)
              || html.match(/ytInitialData\s*=\s*({.+?});\s*<\/script>/s)
              || html.match(/window\["ytInitialData"\]\s*=\s*({.+?});/s);
            const results = [];
            if (match) {
              const data = JSON.parse(match[1]);
              const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
              for (const item of contents) {
                const v = item.videoRenderer;
                if (v && v.videoId) {
                  const title = v.title?.runs?.[0]?.text || 'YouTube Track';
                  const artist = v.ownerText?.runs?.[0]?.text || 'Artist';
                  const durationText = v.lengthText?.simpleText || '3:30';
                  let durationSec = 210;
                  if (durationText && durationText.includes(':')) {
                    const p = durationText.split(':').map(Number);
                    durationSec = p.length === 2 ? (p[0] * 60 + p[1]) : (p[0] * 3600 + p[1] * 60 + p[2]);
                  }
                  const thumb = v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
                  results.push({
                    id: `ytm-${v.videoId}`,
                    ytId: v.videoId,
                    title,
                    artist,
                    duration: durationSec,
                    coverUrl: thumb,
                    streamUrl: '',
                    source: 'YouTube Music'
                  });
                }
              }
            }
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({ results: results.slice(0, 25) }));
            return;
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: e.message, results: [] }));
            return;
          }
        }

        next();
      });
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [pulseApiPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    port: 3000,
    open: false
  }
});


