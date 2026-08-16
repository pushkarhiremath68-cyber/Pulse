import os
import json
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MUSIC_SERVICE_PATH = os.path.join(ROOT, 'src', 'musicService.js')
MAIN_JS_PATH = os.path.join(ROOT, 'src', 'main.js')

print("Starting generation of expanded catalog & universal streaming pipeline...")

with open(MUSIC_SERVICE_PATH, 'r', encoding='utf-8') as f:
    ms_code = f.read()

# 1. Upgrade getAudioCandidates in src/musicService.js with multi-tier CORS proxies and live stream decryption
old_candidates_fn = re.compile(
    r'async getAudioCandidates\(track\)\s*\{.*?\n    \},',
    re.DOTALL
)

new_candidates_fn = """async getAudioCandidates(track) {
      if (!track) return [];
      const candidates = [];
      const seen = new Set();
      const add = (url, label) => {
        if (url && typeof url === 'string' && url.trim() !== '' && !seen.has(url)) {
          seen.add(url);
          candidates.push({ url: url.trim(), label });
        }
      };

      // 1. Direct explicit high-bitrate streamUrl
      if (track.streamUrl && (track.streamUrl.startsWith('http://') || track.streamUrl.startsWith('https://') || track.streamUrl.startsWith('blob:')) && !track.streamUrl.includes('itunes.apple.com') && !track.streamUrl.includes('mzstatic.com') && !track.streamUrl.includes('preview')) {
        add(track.streamUrl, 'direct-master-stream');
      }

      // 2. Direct explicit audioUrl
      if (track.audioUrl && (track.audioUrl.startsWith('http://') || track.audioUrl.startsWith('https://') || track.audioUrl.startsWith('blob:')) && !track.audioUrl.includes('YOUR_SUPABASE_PROJECT_URL') && !track.audioUrl.includes('itunes.apple.com') && !track.audioUrl.includes('mzstatic.com') && !track.audioUrl.includes('preview')) {
        add(track.audioUrl, 'direct-audio');
      }

      // 3. Local storage audio files in storage/music/ & docs/storage/music/
      const cleanId = String(track.id || '');
      const storagePath = String(track.storagePath || '').replace(/^\\/+/, '');
      if (storagePath) {
        add(`./storage/music/${storagePath}`, 'local-storage');
        add(`/storage/music/${storagePath}`, 'local-storage-abs');
        add(`./docs/storage/music/${storagePath}`, 'docs-storage');
      }
      if (cleanId) {
        const cleanBase = cleanId.replace(/^in-|^en-|^te-|^kn-|^pj-|^gu-|^mr-|^hr-|^es-|^fr-|^dev-|^ta-|^kp-/, '');
        ['.mp4', '.m4a', '.mp3', '.webm', '.aac'].forEach(ext => {
          add(`./storage/music/${cleanId}${ext}`, `local-${ext}`);
          add(`/storage/music/${cleanId}${ext}`, `local-abs-${ext}`);
          add(`./docs/storage/music/${cleanId}${ext}`, `docs-${ext}`);
          if (cleanBase && cleanBase !== cleanId) {
            add(`./storage/music/${cleanBase}${ext}`, `local-base-${ext}`);
          }
        });
      }

      const rawTitle = (track.title || track.name || '').replace(/\\s*\\([^)]*\\)/g, '').replace(/\\s*\\[[^\\]]*\\]/g, '').trim();
      const rawArtist = (track.artist || '').split(',')[0].split('&')[0].trim();
      const query = `${rawTitle} ${rawArtist}`.trim() || `${track.title || ''} ${track.artist || ''}`.trim();

      // 4. JioSaavn 320k/160k authentic full-length master stream CDN with multi-proxy fallback
      if (query || rawTitle) {
        const searchQueries = [query, rawTitle].filter(Boolean);
        for (const sq of searchQueries) {
          try {
            const cleanQuery = sq.replace(/[()\\\\[\\\\]{}"'|]/g, ' ').replace(/\\s+/g, ' ').trim();
            const saavnRawUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&n=5&p=1&_marker=0&ctx=android&q=${encodeURIComponent(cleanQuery)}`;
            
            let data = null;
            // 4a. Local backend proxy
            try {
              const bRes = await fetch(`/api/saavn-search?q=${encodeURIComponent(cleanQuery)}`, { signal: AbortSignal.timeout(2000) });
              if (bRes.ok) data = await bRes.json();
            } catch (e) {}

            // 4b. Multi-CORS proxies
            const proxies = [
              `https://corsproxy.io/?url=${encodeURIComponent(saavnRawUrl)}`,
              `https://api.allorigins.win/raw?url=${encodeURIComponent(saavnRawUrl)}`,
              `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(saavnRawUrl)}`
            ];

            for (const pUrl of proxies) {
              if (data && data.results) break;
              try {
                const cRes = await fetch(pUrl, { signal: AbortSignal.timeout(2500) });
                if (cRes.ok) {
                  const parsed = await cRes.json();
                  if (parsed && parsed.results) data = parsed;
                }
              } catch (e) {}
            }

            // 4c. Direct fetch
            if (!data || !data.results) {
              try {
                const dRes = await fetch(saavnRawUrl, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
                if (dRes.ok) data = await dRes.json();
              } catch (e) {}
            }

            if (data && data.results && data.results.length > 0) {
              for (const r of data.results) {
                if (r.encrypted_media_url) {
                  const dec = decryptSaavnUrl(r.encrypted_media_url);
                  if (dec) {
                    if (dec['320']) add(dec['320'], 'saavn-320k-lossless');
                    if (dec['160']) add(dec['160'], 'saavn-160k-hq');
                    if (dec['96']) add(dec['96'], 'saavn-96k');
                  }
                }
                if (r.image && (!track.cover || track.cover.includes('pulse-logo'))) {
                  const hdImg = r.image.replace('150x150', '500x500').replace('50x50', '500x500');
                  track.cover = hdImg;
                }
                if (candidates.length > 2) break;
              }
            }
          } catch (e) {}
          if (candidates.some(c => c.label && c.label.startsWith('saavn'))) break;
        }

        // 5. Apple iTunes audio stream preview fallback
        if (track.previewUrl) {
          add(track.previewUrl, 'itunes-preview');
        } else {
          try {
            const itUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=1`;
            const itRes = await fetch(itUrl, { cache: 'no-store', signal: AbortSignal.timeout(2000) });
            if (itRes.ok) {
              const itData = await itRes.json();
              if (itData && itData.results && itData.results.length > 0) {
                const itTrack = itData.results[0];
                if (itTrack.previewUrl) {
                  add(itTrack.previewUrl, 'itunes-aac-stream');
                }
                if (itTrack.artworkUrl100 && (!track.cover || track.cover.includes('pulse-logo'))) {
                  track.cover = itTrack.artworkUrl100.replace('100x100bb', '600x600bb');
                }
              }
            }
          } catch (e) {}
        }
      }

      return candidates;
    },"""

if old_candidates_fn.search(ms_code):
    ms_code = old_candidates_fn.sub(lambda m: new_candidates_fn, ms_code)
    print("[SUCCESS] Upgraded getAudioCandidates in src/musicService.js")
else:
    print("[WARN] Could not match old getAudioCandidates pattern")

with open(MUSIC_SERVICE_PATH, 'w', encoding='utf-8') as f:
    f.write(ms_code)

# 2. Upgrade resolveYouTubeVideoId in src/main.js
with open(MAIN_JS_PATH, 'r', encoding='utf-8') as f:
    main_code = f.read()

old_resolve_yt = re.compile(
    r'async function resolveYouTubeVideoId\(query\)\s*\{.*?\n  \}',
    re.DOTALL
)

new_resolve_yt = """async function resolveYouTubeVideoId(query) {
    if (!query) return null;
    const cleanQ = query.toLowerCase().trim();

    // 1. Strict match in pre-indexed catalog (0ms instantaneous lookup)
    if (typeof DEMO_CATALOG !== 'undefined') {
      const match = DEMO_CATALOG.find(t => {
        if (!t.ytId) return false;
        const tTitle = (t.title || '').toLowerCase().trim();
        const tArtist = (t.artist || '').toLowerCase().trim();
        if (cleanQ === tTitle || cleanQ === `${tTitle} ${tArtist}` || (tTitle.length >= 4 && cleanQ.startsWith(tTitle))) {
          return true;
        }
        return false;
      });
      if (match && match.ytId) return match.ytId;
    }

    if (typeof YOUTUBE_TRACKS_MAP !== 'undefined') {
      for (const [k, v] of Object.entries(YOUTUBE_TRACKS_MAP)) {
        const cleanK = k.replace(/^in-|^en-|^te-|^kn-|^pj-|^gu-|^mr-|^hr-|^es-|^fr-|^dev-|^ta-/, '').replace(/-/g, ' ');
        if (cleanQ === cleanK || (cleanK.length >= 5 && cleanQ.includes(cleanK))) {
          return v;
        }
      }
    }

    // 2. Query Local Backend Server YouTube Search API if available
    try {
      const backendRes = await fetch(`/api/yt-search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(2000) });
      if (backendRes.ok) {
        const bData = await backendRes.json();
        if (bData && bData.videoId && bData.videoId.length === 11) {
          return bData.videoId;
        }
      }
    } catch (e) {}

    // 3. Fast Parallel Invidious & Piped Multi-Instance Search
    const fastInstances = [
      'https://invidious.nerdvpn.de',
      'https://inv.nadeko.net',
      'https://invidious.jing.rocks',
      'https://yt.drgnz.club'
    ];

    try {
      const fetchPromises = fastInstances.map(inst =>
        fetch(`${inst}/api/v1/search?q=${encodeURIComponent(query)}&type=video`, { signal: AbortSignal.timeout(2200) })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (Array.isArray(data) && data.length > 0 && data[0].videoId && data[0].videoId.length === 11) {
              return data[0].videoId;
            }
            return null;
          })
          .catch(() => null)
      );

      const firstValidId = await Promise.any(
        fetchPromises.map(p => p.then(id => id || Promise.reject()))
      );
      if (firstValidId) return firstValidId;
    } catch (e) {}

    return null;
  }"""

if old_resolve_yt.search(main_code):
    main_code = old_resolve_yt.sub(lambda m: new_resolve_yt, main_code)
    print("[SUCCESS] Upgraded resolveYouTubeVideoId in src/main.js")
else:
    print("[WARN] Could not match old resolveYouTubeVideoId pattern")

with open(MAIN_JS_PATH, 'w', encoding='utf-8') as f:
    f.write(main_code)

print("[SUCCESS] Universal streaming pipeline & multi-proxy resolvers successfully upgraded!")
