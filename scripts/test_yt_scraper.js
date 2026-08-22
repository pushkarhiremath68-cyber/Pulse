async function testYouTubeScraper(query) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' audio')}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });
  const html = await res.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/s) || html.match(/var ytInitialData\s*=\s*({.+?});/s);
  
  if (match) {
    const data = JSON.parse(match[1]);
    const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
    const results = [];
    for (const item of contents) {
      const v = item.videoRenderer;
      if (v && v.videoId) {
        const title = v.title?.runs?.[0]?.text || 'YouTube Track';
        const artist = v.ownerText?.runs?.[0]?.text || 'Artist';
        const durationText = v.lengthText?.simpleText || '3:30';
        const thumb = v.thumbnail?.thumbnails?.[v.thumbnail.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
        results.push({
          id: `ytm-${v.videoId}`,
          ytId: v.videoId,
          title,
          artist,
          durationText,
          coverUrl: thumb,
          source: 'YouTube Official'
        });
      }
    }
    console.log(`YouTube direct search for "${query}": found ${results.length} tracks!`);
    if (results.length > 0) {
      console.log('Top 3 results:');
      results.slice(0, 3).forEach(r => console.log(`  - [${r.ytId}] ${r.title} by ${r.artist} (${r.durationText})`));
    }
    return results;
  } else {
    console.log('Could not find ytInitialData');
  }
}

async function run() {
  await testYouTubeScraper('Kesariya Arijit Singh');
  await testYouTubeScraper('Blinding Lights The Weeknd');
  await testYouTubeScraper('Brown Munde');
  await testYouTubeScraper('Singara Siriye');
}

run();
