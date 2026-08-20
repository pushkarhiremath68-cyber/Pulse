/**
 * Pulse Music - Gemini AI Music Intelligence & Resolution Service
 * Powered by Google Gemini AI & Multi-Source Audio Gateway.
 * Resolves exact song titles, regional lyrics, artist vocals, and audio streams.
 */

const GEMINI_MODEL = 'gemini-3.6-flash';

// Comprehensive Smart Knowledge Base for Instant Zero-Latency Resolution
export const SMART_KNOWLEDGE_BASE = {
  'udi udi zulfein': [
    { title: 'Udi Udi Jaye', artist: 'Sukhwinder Singh, Bhoomi Trivedi', query: 'Udi Udi Jaye Raees' },
    { title: 'Yeh Reshmi Zulfen', artist: 'Mohammed Rafi', query: 'Yeh Reshmi Zulfen' },
    { title: 'Ude Dil Befikre', artist: 'Benny Dayal', query: 'Ude Dil Befikre' },
    { title: 'Zulfen', artist: 'Arooh', query: 'Zulfen' }
  ],
  'gulabi aankhen': [
    { title: 'Gulabi Aankhen', artist: 'Mohammed Rafi', query: 'Gulabi Aankhen The Train' },
    { title: 'Gulabi 2.0', artist: 'Amaal Mallik, Tulsi Kumar', query: 'Gulabi 2.0' }
  ],
  'kesariya': [
    { title: 'Kesariya', artist: 'Pritam, Arijit Singh', query: 'Kesariya Brahmastra Arijit Singh' }
  ],
  'chaleya': [
    { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', query: 'Chaleya Jawan Arijit Singh' }
  ],
  'tum hi ho': [
    { title: 'Tum Hi Ho', artist: 'Arijit Singh', query: 'Tum Hi Ho Aashiqui 2' }
  ],
  'brown munde': [
    { title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill', query: 'Brown Munde AP Dhillon' }
  ],
  'blinding lights': [
    { title: 'Blinding Lights', artist: 'The Weeknd', query: 'Blinding Lights The Weeknd' }
  ],
  'starboy': [
    { title: 'Starboy (feat. Daft Punk)', artist: 'The Weeknd', query: 'Starboy The Weeknd' }
  ],
  'shape of you': [
    { title: 'Shape of You', artist: 'Ed Sheeran', query: 'Shape of You Ed Sheeran' }
  ],
  'cruel summer': [
    { title: 'Cruel Summer', artist: 'Taylor Swift', query: 'Cruel Summer Taylor Swift' }
  ],
  'arabic kuthu': [
    { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', query: 'Arabic Kuthu Beast' }
  ],
  'zingaat': [
    { title: 'Zingaat', artist: 'Ajay-Atul', query: 'Zingaat Sairat Ajay Atul' }
  ],
  'singara siriye': [
    { title: 'Singara Siriye', artist: 'Vijay Prakash, Ananya Bhat', query: 'Singara Siriye Kantara' }
  ],
  'naatu naatu': [
    { title: 'Naatu Naatu', artist: 'Rahul Sipligunj, Kaala Bhairava', query: 'Naatu Naatu RRR' }
  ]
};

/**
 * Intelligent Smart Disambiguation for regional & colloquial queries
 */
export function disambiguateQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== 'string') return [rawQuery];
  const q = rawQuery.trim().toLowerCase();
  
  if (SMART_KNOWLEDGE_BASE[q]) {
    return SMART_KNOWLEDGE_BASE[q].map(x => x.query);
  }

  const queries = [rawQuery];
  const words = q.split(/\s+/);

  if (words.length > 1) {
    queries.push(words.slice(0, 2).join(' '));
    queries.push(words[words.length - 1]);
    
    // Hinglish and regional phonetic normalizations
    const phonetic = q
      .replace(/zulfein/g, 'zulfen')
      .replace(/aankhein/g, 'aankhen')
      .replace(/raatan/g, 'raataan')
      .replace(/lambiyan/g, 'lambiyan')
      .replace(/song/gi, '')
      .replace(/audio/gi, '')
      .replace(/track/gi, '')
      .trim();
    
    if (phonetic && phonetic !== q && !queries.includes(phonetic)) {
      queries.push(phonetic);
    }
  }

  return queries;
}

/**
 * Resolves user query using Gemini AI to identify exact YouTube title & artist
 */
export async function resolveQueryWithGemini(userQuery, apiKey = null) {
  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('PULSE_GEMINI_API_KEY'));
  
  if (!key || !userQuery) {
    return disambiguateQuery(userQuery);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    const systemPrompt = `You are a YouTube Music Search Intelligence Agent for Pulse Music.
Given user search input: "${userQuery}" (could be lyrics snippet, misspelled title, movie name, or artist), return a JSON object:
{
  "canonicalTitle": "Official exact song title",
  "artist": "Primary artist",
  "searchQueries": ["Best YouTube search query 1", "Search query 2", "Search query 3"]
}
ONLY return valid JSON.`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      }),
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const json = await res.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (rawText) {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0) {
          return parsed.searchQueries;
        }
      }
    }
  } catch (e) {}

  return disambiguateQuery(userQuery);
}

/**
 * Curates a complete high-fidelity YouTube playlist based on user vibe / mood
 */
export async function askGeminiDJ(userPrompt, apiKey = null) {
  if (!userPrompt || userPrompt.trim().length === 0) {
    throw new Error('Please enter a mood, artist, or vibe for Gemini DJ.');
  }

  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('PULSE_GEMINI_API_KEY'));

  if (key) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
      const systemPrompt = `You are Gemini DJ for Pulse Music. Return a JSON object with top real streamable YouTube songs:
{
  "djTitle": "Catchy short playlist title",
  "vibe": "1-sentence mood summary",
  "tracks": [
    { "title": "Exact Song Title", "artist": "Official Artist Name", "ytQuery": "Song Artist Official Audio", "reason": "10-word vibe why" }
  ]
}
Recommend 6 top acclaimed tracks for: "${userPrompt}". ONLY return valid JSON.`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        }),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const json = await res.json();
        const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) return JSON.parse(rawText);
      }
    } catch (e) {}
  }

  // Fallback intelligent AI DJ playlist based on keywords
  const p = userPrompt.toLowerCase();
  if (p.includes('bollywood') || p.includes('hindi') || p.includes('romantic') || p.includes('arijit')) {
    return {
      djTitle: `Gemini DJ: Bollywood & Soulful Melodies`,
      vibe: `Soulful vocals, acoustic guitars and heartfelt romance`,
      tracks: [
        { title: 'Tum Hi Ho', artist: 'Arijit Singh', ytQuery: 'Tum Hi Ho Arijit Singh', reason: 'Timeless romantic anthem' },
        { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', ytQuery: 'Chaleya Jawan Arijit Singh', reason: 'Upbeat modern melody' },
        { title: 'Kesariya', artist: 'Arijit Singh', ytQuery: 'Kesariya Brahmastra', reason: 'Golden warm romance' },
        { title: 'Apna Bana Le', artist: 'Arijit Singh', ytQuery: 'Apna Bana Le Bhediya', reason: 'Deep soulful connection' }
      ]
    };
  } else if (p.includes('workout') || p.includes('gym') || p.includes('energy') || p.includes('edm')) {
    return {
      djTitle: `Gemini DJ: High-Energy Power Surge`,
      vibe: `Pounding bass, peak BPM and unstoppable adrenaline`,
      tracks: [
        { title: 'Titanium', artist: 'David Guetta ft. Sia', ytQuery: 'Titanium David Guetta Sia', reason: 'Maximum motivational energy' },
        { title: 'Faded', artist: 'Alan Walker', ytQuery: 'Faded Alan Walker', reason: 'Hypnotic electro rhythm' },
        { title: 'Animals', artist: 'Martin Garrix', ytQuery: 'Animals Martin Garrix', reason: 'Huge festival club drop' },
        { title: 'Wake Me Up', artist: 'Avicii', ytQuery: 'Wake Me Up Avicii', reason: 'Uplifting stadium anthem' }
      ]
    };
  } else if (p.includes('punjabi') || p.includes('dhillon') || p.includes('shubh')) {
    return {
      djTitle: `Gemini DJ: Punjabi Urban Drill & Hype`,
      vibe: `Heavy basslines, swagger and viral Punjabi beats`,
      tracks: [
        { title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill', ytQuery: 'Brown Munde AP Dhillon', reason: 'Global Punjabi anthem' },
        { title: 'Excuses', artist: 'AP Dhillon', ytQuery: 'Excuses AP Dhillon', reason: 'Smooth mellow groove' },
        { title: 'Elevated', artist: 'Shubh', ytQuery: 'Elevated Shubh', reason: 'Hard-hitting urban flow' },
        { title: 'No Love', artist: 'Shubh', ytQuery: 'No Love Shubh', reason: 'Deep catchy drill rhythm' }
      ]
    };
  }

  return {
    djTitle: `Gemini DJ: ${userPrompt}`,
    vibe: `AI curated playlist matching "${userPrompt}"`,
    tracks: [
      { title: 'Blinding Lights', artist: 'The Weeknd', ytQuery: 'Blinding Lights The Weeknd', reason: 'Global synthwave masterpiece' },
      { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', ytQuery: 'Starboy The Weeknd', reason: 'High energy electro groove' },
      { title: 'Shape of You', artist: 'Ed Sheeran', ytQuery: 'Shape of You Ed Sheeran', reason: 'Catchy rhythmic pop' },
      { title: 'Cruel Summer', artist: 'Taylor Swift', ytQuery: 'Cruel Summer Taylor Swift', reason: 'Soaring summer pop anthem' }
    ]
  };
}

const geminiService = {
  disambiguateQuery,
  resolveQueryWithGemini,
  askGeminiDJ,
  SMART_KNOWLEDGE_BASE
};

if (typeof window !== 'undefined') {
  window.geminiService = geminiService;
}

export default geminiService;
