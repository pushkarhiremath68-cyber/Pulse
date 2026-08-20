const INVIDIOUS_INSTANCES = [
  'https://invidious.nerdvpn.de',
  'https://inv.tux.pizza',
  'https://invidious.private.coffee',
  'https://invidious.jing.rocks'
];

async function testInvidiousStream(videoId) {
  console.log(`Testing Invidious stream resolution for ${videoId}...`);
  const nodesToRace = INVIDIOUS_INSTANCES.map(n => ({ type: 'invidious', url: `${n}/api/v1/videos/${videoId}?fields=title,author,lengthSeconds,formatStreams,adaptiveFormats` }));
  
  try {
    const fastestResolved = await Promise.any(
      nodesToRace.map(async (node) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        try {
          const res = await fetch(node.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!res.ok) throw new Error(`Not ok: ${res.status} from ${node.url}`);
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          
          const formats = data.adaptiveFormats || data.formatStreams || [];
          if (formats.length > 0) {
            const bestStream = formats.find(s => s.type && s.type.includes('audio/mp4')) || formats.find(s => s.type && s.type.includes('audio/webm'));
            if (bestStream && bestStream.url) {
              return { url: bestStream.url, source: node.url };
            }
          }
          throw new Error('No audio streams');
        } catch (e) {
          clearTimeout(timeoutId);
          console.log(`[Fail] ${node.url} -> ${e.message}`);
          throw e;
        }
      })
    );
    console.log(`SUCCESS: Got stream from ${fastestResolved.source}`);
    console.log(`Stream URL: ${fastestResolved.url.substring(0, 50)}...`);
  } catch (e) {
    console.log('ALL INVIDIOUS NODES FAILED!');
    console.error(e);
  }
}

testInvidiousStream('Umqb9KENgmk').catch(console.error);
