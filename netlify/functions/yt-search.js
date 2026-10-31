exports.handler = async function(event, context) {
  const q = event.queryStringParameters.q || event.queryStringParameters.query || '';
  if (!q) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ results: [] })
    };
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
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ results: results.slice(0, 25) })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message, results: [] })
    };
  }
};
