/**
 * Pulse Music - LRCLIB Live Synced Lyrics Engine & Parser
 * Features:
 * - Direct LRCLIB API Integration with application client header
 * - High-precision LRC parser supporting [mm:ss.xx] & [mm:ss.xxx] timestamps
 * - Fallback to plain lyrics or verified song lyrics registry
 * - High-performance binary search for active lyric line index (60fps synced)
 */

const LRCLIB_BASE = 'https://lrclib.net/api';
const memoryCache = new Map();

/**
 * Cleans track titles by stripping common suffixes like (feat. ...), [Official Audio], etc.
 */
export function cleanSearchTerm(text) {
  if (!text) return '';
  return text
    .replace(/\s*-\s*(?:single|ep|edit|remastered|deluxe|explicit)$/gi, '')
    .replace(/\s*\([^)]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version|live|deluxe|from|original)[^)]*\)/gi, '')
    .replace(/\s*\[[^\]]*(?:feat|ft|official|remix|bonus|audio|video|soundtrack|version|live|deluxe|from|original)[^\]]*\]/gi, '')
    .replace(/\s*-\s*(?:official|audio|video|lyric|remix|song|soundtrack).*/gi, '')
    .trim();
}

/**
 * Normalizes artist name for cleaner query matching
 */
export function cleanArtistName(text) {
  if (!text) return '';
  return text.split(',')[0].split('&')[0].split('•')[0].split('ft.')[0].split('feat.')[0].trim();
}

/**
 * Parses raw LRC format ([mm:ss.xx] or [mm:ss.xxx]) into timestamped line objects
 * @param {string} lrcText
 * @returns {Array<{ time: number, text: string }>}
 */
export function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const parsed = [];
  const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;
  const metadataTagRegex = /^\[(ti|ar|al|au|by|offset|re|ve|length):.*\]$/i;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed || metadataTagRegex.test(trimmed)) continue;

    const matches = [...trimmed.matchAll(timeTagRegex)];
    if (matches.length > 0) {
      const text = trimmed.replace(timeTagRegex, '').trim();
      matches.forEach(match => {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const msStr = match[3] || '0';
        const ms = msStr.length === 2 ? parseInt(msStr, 10) / 100 : (msStr.length === 3 ? parseInt(msStr, 10) / 1000 : parseFloat(`0.${msStr}`));
        const totalSeconds = parseFloat((min * 60 + sec + ms).toFixed(3));
        parsed.push({ time: totalSeconds, text: text || '♪' });
      });
    }
  }

  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Parses plain un-synced text lyrics into line objects
 * @param {string} plainText
 * @returns {Array<{ time: null, text: string }>}
 */
export function parsePlainLyrics(plainText) {
  if (!plainText || typeof plainText !== 'string') return [];
  return plainText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(text => ({ time: null, text }));
}

/**
 * Fetches synced lyrics from LRCLIB with fallbacks
 * @param {Object|string} trackOrTitle
 * @param {string} [optArtist]
 * @returns {Promise<Object>}
 */
export async function getLyrics(trackOrTitle, optArtist = '', optDuration = 0) {
  if (!trackOrTitle) return null;

  let title = typeof trackOrTitle === 'string' ? trackOrTitle : (trackOrTitle.title || '');
  let artist = typeof trackOrTitle === 'string' ? optArtist : (trackOrTitle.artist || '');
  let duration = typeof trackOrTitle === 'object' && trackOrTitle.duration ? trackOrTitle.duration : optDuration;

  const cleanTitle = cleanSearchTerm(title);
  const cleanArtist = cleanArtistName(artist);
  if (!cleanTitle) return null;

  const cacheKey = `${cleanTitle.toLowerCase()}___${cleanArtist.toLowerCase()}`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  const reqHeaders = {
    'Lrclib-Client': 'PulseMusic/2.4.0 (https://github.com/pushkarhiremath68-cyber/Pulse)',
    'User-Agent': 'PulseMusic/2.4.0'
  };

  // 1. Direct GET Query to LRCLIB
  try {
    let getUrl = `${LRCLIB_BASE}/get?track_name=${encodeURIComponent(cleanTitle)}`;
    if (cleanArtist) getUrl += `&artist_name=${encodeURIComponent(cleanArtist)}`;
    if (duration && duration > 0) getUrl += `&duration=${Math.round(duration)}`;

    const res = await fetch(getUrl, {
      headers: reqHeaders,
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const data = await res.json();
      if (data.syncedLyrics || data.plainLyrics) {
        const isSynced = Boolean(data.syncedLyrics && data.syncedLyrics.trim().length > 0);
        const lines = isSynced ? parseLrc(data.syncedLyrics) : parsePlainLyrics(data.plainLyrics);
        const payload = {
          title: data.trackName || title,
          artist: data.artistName || artist,
          isSynced,
          lines,
          rawPlain: data.plainLyrics || lines.map(l => l.text).join('\n'),
          source: 'LRCLIB Synced Lyrics',
          notFound: false
        };
        memoryCache.set(cacheKey, payload);
        return payload;
      }
    }
  } catch (e) {}

  // 2. Search Fallback on LRCLIB
  try {
    const searchUrl = `${LRCLIB_BASE}/search?q=${encodeURIComponent(`${cleanTitle} ${cleanArtist}`.trim())}`;
    const res = await fetch(searchUrl, {
      headers: reqHeaders,
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const list = await res.json();
      if (Array.isArray(list) && list.length > 0) {
        const item = list.find(x => x.syncedLyrics && x.syncedLyrics.trim().length > 0) || list[0];
        if (item.syncedLyrics || item.plainLyrics) {
          const isSynced = Boolean(item.syncedLyrics && item.syncedLyrics.trim().length > 0);
          const lines = isSynced ? parseLrc(item.syncedLyrics) : parsePlainLyrics(item.plainLyrics);
          const payload = {
            title: item.trackName || title,
            artist: item.artistName || artist,
            isSynced,
            lines,
            rawPlain: item.plainLyrics || lines.map(l => l.text).join('\n'),
            source: 'LRCLIB Synced Lyrics',
            notFound: false
          };
          memoryCache.set(cacheKey, payload);
          return payload;
        }
      }
    }
  } catch (e) {}

  // 3. Fallback to Verified Built-In Lyrics Registry
  const verified = getVerifiedLocalLyrics(cleanTitle, cleanArtist);
  if (verified) {
    memoryCache.set(cacheKey, verified);
    return verified;
  }

  return {
    title,
    artist,
    isSynced: false,
    lines: [],
    rawPlain: '',
    source: 'None',
    notFound: true
  };
}

/**
 * Built-In Registry for chartbuster anthems with synchronized or plain lines
 */
function getVerifiedLocalLyrics(cleanTitle, cleanArtist) {
  const t = cleanTitle.toLowerCase();

  const REGISTRY = {
    'starboy': {
      isSynced: true,
      raw: `[00:09.10]I'm tryna put you in the worst mood, ah
[00:11.80]P1 cleaner than your church shoes, ah
[00:14.20]Milli point two just to hurt you, ah
[00:16.80]All red Lamb' just to tease you, ah
[00:19.40]None of these toys on lease too, ah
[00:21.80]Made your whole year in a week too, yah
[00:24.40]Main girl out your league too, ah
[00:27.10]Side girl out of your league too, ah
[00:29.80]Look what you've done
[00:33.20]I'm a motherfuckin' starboy
[00:35.40]Look what you've done
[00:38.20]I'm a motherfuckin' starboy
[00:40.40]Every day a brother try to test me, ah
[00:43.00]Every day a brother try to end me, ah
[00:45.60]Pull up in the Roadster SV, ah
[00:48.20]House so empty, need a centerpiece, ah`
    },
    'blinding lights': {
      isSynced: true,
      raw: `[00:15.50]Yeah
[00:27.20]I've been tryin' to call
[00:30.80]I've been on my own for long enough
[00:34.50]Maybe you can show me how to love, maybe
[00:42.10]I'm going through withdrawals
[00:45.80]You don't even have to do too much
[00:49.40]You can turn me on with just a touch, baby
[00:57.10]I look around and Sin City's cold and empty
[01:02.80]No one's around to judge me
[01:06.40]I can't see clearly when you're gone
[01:11.20]I said, ooh, I'm blinded by the lights
[01:18.50]No, I can't sleep until I feel your touch`
    },
    'kesariya': {
      isSynced: true,
      raw: `[00:20.10]Mujhko itna bataye koyi
[00:24.80]Kaise tujhse dil na lagaye koyi
[00:29.60]Rabba ne tujhko banane mein
[00:34.20]Kardi hai husn ki khaali tijoriyan
[00:39.50]Kaajal ki sihayi se likhi
[00:44.20]Hai tune jaane kitno ki love storiyan
[00:49.50]Kesariya tera ishq hai piya
[00:54.20]Rang jaaun jo main haath lagaun
[00:59.10]Din beete saara teri fikr mein
[01:03.80]Rain saari teri khair manaun`
    },
    'chaleya': {
      isSynced: true,
      raw: `[00:12.30]Ishq mein dil bana hai
[00:15.60]Ishq mein dil fanaa hai
[00:18.90]Hone do ab jo hona hai
[00:24.50]Chaleya teri ore chaleya
[00:28.10]Chaleya teri ore chaleya
[00:31.80]Mahiya teri ore chaleya
[00:35.40]Har din har pal tere hi sang chaleya`
    },
    'tum hi ho': {
      isSynced: true,
      raw: `[00:16.20]Hum tere bin ab reh nahi sakte
[00:23.50]Tere bina kya wajood mera
[00:31.00]Tujhse juda agar ho jaayenge
[00:37.80]Toh khud se hi ho jaayenge juda
[00:45.00]Kyunki tum hi ho
[00:48.50]Ab tum hi ho
[00:52.20]Zindagi ab tum hi ho
[00:59.50]Chain bhi, mera dard bhi
[01:06.80]Meri aashiqui ab tum hi ho`
    },
    'shape of you': {
      isSynced: true,
      raw: `[00:09.50]The club isn't the best place to find a lover
[00:11.80]So the bar is where I go
[00:14.20]Me and my friends at the table doing shots
[00:16.50]Drinking fast and then we talk slow
[00:19.00]Come over and start up a conversation with just me
[00:21.80]And trust me I'll give it a chance now
[00:24.20]Took my hand, stop, put Van the Man on the jukebox
[00:26.80]And then we start to dance, and now I'm singing like
[00:29.50]Girl, you know I want your love
[00:32.00]Your love was handmade for somebody like me
[00:34.50]Come on now, follow my lead
[00:37.00]I may be crazy, don't mind me
[00:39.50]Say, boy, let's not talk too much
[00:42.00]Grab on my waist and put that body on me
[00:44.80]Come on now, follow my lead
[00:47.50]Come, come on now, follow my lead
[00:49.80]I'm in love with the shape of you`
    },
    'cruel summer': {
      isSynced: true,
      raw: `[00:10.20]Fever dream high in the quiet of the night
[00:13.50]You know that I caught it
[00:16.80]Bad, bad boy, shiny toy with a price
[00:20.10]You know that I bought it
[00:23.40]Killing me slow, out the window
[00:26.80]I'm always waiting for you to be waiting below
[00:30.10]Devils roll the dice, angels roll their eyes
[00:33.40]What doesn't kill me makes me want you more
[00:36.80]And it's new, the shape of your body
[00:40.10]It's blue, the feeling I've got
[00:43.40]And it's ooh, whoa oh
[00:46.80]It's a cruel summer with you`
    },
    'brown munde': {
      isSynced: true,
      raw: `[00:14.20]Gaddi 'ch vajde gane
[00:17.50]Akhan 'ch nasha te sir te tohar
[00:21.00]Bande ne desi munde
[00:24.20]Desi munde, brown munde
[00:27.80]Brown munde!
[00:31.00]Ambran te udde jiddan baaj hunde ne
[00:34.50]Apne he banaye hoye saaj hunde ne`
    },
    'perfect': {
      isSynced: true,
      raw: `[00:12.50]I found a love, for me
[00:23.80]Darling, just dive right in and follow my lead
[00:35.20]Well, I found a girl, beautiful and sweet
[00:47.00]Oh, I never knew you were the someone waiting for me
[00:57.80]'Cause we were just kids when we fell in love
[01:04.20]Not knowing what it was
[01:10.00]I will not give you up this time
[01:16.50]Darling, just kiss me slow
[01:21.80]Your heart is all I own
[01:25.50]And in your eyes, you're holding mine
[01:31.00]Baby, I'm dancing in the dark
[01:37.50]With you between my arms`
    }
  };

  for (const [key, val] of Object.entries(REGISTRY)) {
    if (t.includes(key) || key.includes(t)) {
      const lines = val.isSynced ? parseLrc(val.raw) : parsePlainLyrics(val.raw);
      return {
        title: cleanTitle,
        artist: cleanArtist,
        isSynced: val.isSynced,
        lines,
        rawPlain: lines.map(l => l.text).join('\n'),
        source: 'Pulse Verified Synced Registry',
        notFound: false
      };
    }
  }

  return null;
}

/**
 * High-performance binary search to find the active lyric line index for current timestamp
 * @param {Array<{ time: number, text: string }>} lines
 * @param {number} currentTime
 * @returns {number} Active index, or -1 if before first line
 */
export function getActiveLineIndex(lines, currentTime) {
  if (!Array.isArray(lines) || lines.length === 0) return -1;

  if (lines[0].time !== null && currentTime < lines[0].time) {
    return -1;
  }

  let low = 0;
  let high = lines.length - 1;
  let result = -1;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const lineTime = lines[mid].time;

    if (lineTime === null) {
      return -1;
    }

    if (lineTime <= currentTime) {
      result = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
}

const lyricsService = {
  getLyrics,
  parseLrc,
  parsePlainLyrics,
  getActiveLineIndex,
  cleanSearchTerm,
  cleanArtistName
};

if (typeof window !== 'undefined') {
  window.lyricsService = lyricsService;
  window.PulseLyrics = lyricsService;
}

export default lyricsService;
