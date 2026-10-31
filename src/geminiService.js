/**
 * Pulse Music - Gemini AI Music Intelligence & Resolution Service
 * Powered by Google Gemini AI & Multi-Source Audio Gateway.
 * Resolves exact song titles, regional lyrics, artist vocals, and audio streams.
 */

import { sanitizeObject } from './security.js';

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
  ],
  'devi kavacham': [
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'Devi Kavacham Appaji' },
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'Devi Kavacham Jai Srimatha Appaji' },
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'b2t2XURj7MU' }
  ],
  'devi kavacham by appaji': [
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'Devi Kavacham Appaji' },
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'b2t2XURj7MU' }
  ],
  'appaji': [
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'Devi Kavacham Appaji' },
    { title: 'Sri Lalitha Sahasranama Stotram', artist: 'Appaji', query: 'Sri Lalitha Sahasranama Appaji' }
  ],
  'b2t2xurj7mu': [
    { title: 'Devi Kavacham', artist: 'Appaji', query: 'Devi Kavacham Appaji' }
  ],
  'wishes': [
    { title: 'Wishes', artist: 'Hasan Raheem, Umair, Talwiinder', query: 'Wishes Hasan Raheem Umair Talwiinder' }
  ],
  'wishes hasan raheem': [
    { title: 'Wishes', artist: 'Hasan Raheem, Umair, Talwiinder', query: 'Wishes Hasan Raheem Umair Talwiinder' }
  ],
  'hasan raheem': [
    { title: 'Wishes', artist: 'Hasan Raheem, Umair, Talwiinder', query: 'Wishes Hasan Raheem Umair Talwiinder' },
    { title: 'Peechay Hutt', artist: 'Hasan Raheem, Justin Bibis, Talal Qureshi', query: 'Peechay Hutt Coke Studio Hasan Raheem' }
  ],
  'pakistani': [
    { title: 'Wishes', artist: 'Hasan Raheem, Umair, Talwiinder', query: 'Wishes Hasan Raheem' },
    { title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', query: 'Pasoori Coke Studio Ali Sethi Shae Gill' },
    { title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', query: 'Kahani Suno 2.0 Kaifi Khalil' },
    { title: 'Aadat', artist: 'Atif Aslam, Jal', query: 'Aadat Atif Aslam Jal' },
    { title: 'Tajdar E Haram', artist: 'Atif Aslam', query: 'Tajdar E Haram Coke Studio Atif Aslam' }
  ],
  'pakistani songs': [
    { title: 'Wishes', artist: 'Hasan Raheem, Umair, Talwiinder', query: 'Wishes Hasan Raheem' },
    { title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', query: 'Pasoori Coke Studio Ali Sethi Shae Gill' },
    { title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', query: 'Kahani Suno 2.0 Kaifi Khalil' },
    { title: 'Tu Jhoom', artist: 'Abida Parveen, Naseebo Lal', query: 'Tu Jhoom Coke Studio Season 14' },
    { title: 'Afreen Afreen', artist: 'Rahat Fateh Ali Khan, Momina Mustehsan', query: 'Afreen Afreen Coke Studio' }
  ],
  'pasoori': [
    { title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', query: 'Pasoori Coke Studio Ali Sethi Shae Gill' }
  ],
  'kahani suno': [
    { title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', query: 'Kahani Suno 2.0 Kaifi Khalil' }
  ],
  'atif aslam': [
    { title: 'Aadat', artist: 'Atif Aslam, Jal', query: 'Aadat Atif Aslam Jal' },
    { title: 'Tajdar E Haram', artist: 'Atif Aslam', query: 'Tajdar E Haram Coke Studio Atif Aslam' },
    { title: 'Woh Lamhe Woh Baatein', artist: 'Atif Aslam', query: 'Woh Lamhe Woh Baatein Atif Aslam' },
    { title: 'Tera Hone Laga Hoon', artist: 'Atif Aslam', query: 'Tera Hone Laga Hoon Atif Aslam' }
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
  const cleanQuery = typeof userQuery === 'string' ? userQuery.trim().slice(0, 150).replace(/[\r\n\t]/g, ' ') : '';
  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('PULSE_GEMINI_API_KEY'));
  
  if (!key || !cleanQuery) {
    return disambiguateQuery(userQuery);
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    const systemPrompt = `You are a YouTube Music Search Intelligence Agent for Pulse Music.
Given user search input: "${cleanQuery}" (could be lyrics snippet, misspelled title, movie name, or artist), return a JSON object:
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
        const parsed = sanitizeObject(JSON.parse(rawText));
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
  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
    throw new Error('Please enter a mood, artist, or vibe for Pulse AI.');
  }

  const cleanPrompt = userPrompt.trim().slice(0, 150).replace(/[\r\n\t]/g, ' ');
  const key = apiKey || (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('PULSE_GEMINI_API_KEY'));

  if (key) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
      const systemPrompt = `You are Pulse AI, an expert music curator for Pulse Music app. Given user request: "${cleanPrompt}", return a JSON object with 6-8 real, streamable songs on YouTube:
{
  "djTitle": "A catchy, creative playlist title (max 8 words)",
  "vibe": "One sentence describing the mood/atmosphere",
  "tracks": [
    { "title": "Exact official song title", "artist": "Official primary artist name", "ytQuery": "Best YouTube search query to find this exact song", "reason": "Brief 8-12 word reason why this fits" }
  ]
}
Rules:
- Return ONLY real, existing songs by real artists
- Prioritize official studio recordings, not covers or remixes
- Include a diverse mix (not all by one artist)
- Match the language/region if the user specifies one
- Return 6-8 tracks
- ONLY return valid JSON, nothing else.`;

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
        if (rawText) return sanitizeObject(JSON.parse(rawText));
      }
    } catch (e) {}
  }

  // Fallback intelligent AI DJ playlist based on keywords — expanded to 12+ categories
  const p = userPrompt.toLowerCase();

  if (p.includes('bollywood') || p.includes('hindi') || p.includes('romantic') || p.includes('arijit')) {
    return {
      djTitle: `Pulse AI: Bollywood & Soulful Melodies`,
      vibe: `Soulful vocals, acoustic guitars and heartfelt romance from Hindi cinema`,
      tracks: [
        { title: 'Tum Hi Ho', artist: 'Arijit Singh', ytQuery: 'Tum Hi Ho Arijit Singh', reason: 'Timeless romantic anthem that defines love' },
        { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', ytQuery: 'Chaleya Jawan Arijit Singh', reason: 'Upbeat modern melody with electric energy' },
        { title: 'Kesariya', artist: 'Arijit Singh', ytQuery: 'Kesariya Brahmastra', reason: 'Golden warm romance soaked in color' },
        { title: 'Apna Bana Le', artist: 'Arijit Singh', ytQuery: 'Apna Bana Le Bhediya', reason: 'Deep soulful connection and longing' },
        { title: 'Tere Vaaste', artist: 'Varun Jain, Sachin-Jigar', ytQuery: 'Tere Vaaste Zara Hatke Zara Bachke', reason: 'Sweet modern love ballad' },
        { title: 'Phir Aur Kya Chahiye', artist: 'Arijit Singh', ytQuery: 'Phir Aur Kya Chahiye Zara Hatke', reason: 'Reflective poetic melody about gratitude' }
      ]
    };
  }

  if (p.includes('sad') || p.includes('heartbreak') || p.includes('pain') || p.includes('breakup') || p.includes('cry')) {
    return {
      djTitle: `Pulse AI: Heartbreak & Midnight Tears`,
      vibe: `Songs that understand your pain — raw emotion and melancholy`,
      tracks: [
        { title: 'Channa Mereya', artist: 'Arijit Singh', ytQuery: 'Channa Mereya Arijit Singh', reason: 'The ultimate heartbreak anthem of the decade' },
        { title: 'Agar Tum Saath Ho', artist: 'Arijit Singh, Alka Yagnik', ytQuery: 'Agar Tum Saath Ho Tamasha', reason: 'Bittersweet farewell soaked in raw pain' },
        { title: 'Kabira', artist: 'Arijit Singh, Tochi Raina', ytQuery: 'Kabira Yeh Jawaani Hai Deewani', reason: 'Wandering soul searching for meaning' },
        { title: 'Someone Like You', artist: 'Adele', ytQuery: 'Someone Like You Adele', reason: 'Iconic global heartbreak ballad' },
        { title: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', ytQuery: 'Ae Dil Hai Mushkil Arijit Singh', reason: 'Unrequited love captured in melody' },
        { title: 'All Too Well (10 Minute)', artist: 'Taylor Swift', ytQuery: 'All Too Well Taylor Swift 10 Minute', reason: 'Epic storytelling of love lost' }
      ]
    };
  }

  if (p.includes('workout') || p.includes('gym') || p.includes('energy') || p.includes('edm') || p.includes('pump')) {
    return {
      djTitle: `Pulse AI: High-Energy Power Surge`,
      vibe: `Pounding bass, peak BPM and unstoppable adrenaline for maximum intensity`,
      tracks: [
        { title: 'Titanium', artist: 'David Guetta ft. Sia', ytQuery: 'Titanium David Guetta Sia', reason: 'Maximum motivational energy anthem' },
        { title: 'Faded', artist: 'Alan Walker', ytQuery: 'Faded Alan Walker', reason: 'Hypnotic electro rhythm and drop' },
        { title: 'Animals', artist: 'Martin Garrix', ytQuery: 'Animals Martin Garrix', reason: 'Huge festival club drop energy' },
        { title: 'Wake Me Up', artist: 'Avicii', ytQuery: 'Wake Me Up Avicii', reason: 'Uplifting stadium anthem for motivation' },
        { title: 'Levels', artist: 'Avicii', ytQuery: 'Levels Avicii', reason: 'Classic EDM anthem that never gets old' },
        { title: 'Lean On', artist: 'Major Lazer, DJ Snake', ytQuery: 'Lean On Major Lazer DJ Snake', reason: 'Tropical bass energy with global beat' }
      ]
    };
  }

  if (p.includes('punjabi') || p.includes('dhillon') || p.includes('shubh') || p.includes('sidhu')) {
    return {
      djTitle: `Pulse AI: Punjabi Urban Drill & Hype`,
      vibe: `Heavy basslines, swagger and viral Punjabi beats — pure hype energy`,
      tracks: [
        { title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill', ytQuery: 'Brown Munde AP Dhillon', reason: 'Global Punjabi anthem with heavy bass' },
        { title: 'Excuses', artist: 'AP Dhillon', ytQuery: 'Excuses AP Dhillon', reason: 'Smooth mellow groove and swagger' },
        { title: 'Elevated', artist: 'Shubh', ytQuery: 'Elevated Shubh', reason: 'Hard-hitting urban flow masterpiece' },
        { title: 'No Love', artist: 'Shubh', ytQuery: 'No Love Shubh', reason: 'Deep catchy drill rhythm energy' },
        { title: '295', artist: 'Sidhu Moose Wala', ytQuery: '295 Sidhu Moose Wala', reason: 'Legendary Punjabi anthem with depth' },
        { title: 'Insane', artist: 'AP Dhillon', ytQuery: 'Insane AP Dhillon', reason: 'Viral bass-heavy banger' }
      ]
    };
  }

  if (p.includes('tamil') || p.includes('anirudh') || p.includes('kuthu') || p.includes('kollywood')) {
    return {
      djTitle: `Pulse AI: Tamil Viral Beats & Kuthu`,
      vibe: `High-energy Tamil bangers with massive bass drops and infectious hooks`,
      tracks: [
        { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', ytQuery: 'Arabic Kuthu Beast Anirudh', reason: 'Massive viral Tamil-Arabic fusion banger' },
        { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', ytQuery: 'Vaathi Coming Master Anirudh', reason: 'Stadium-shaking bass and hype energy' },
        { title: 'Illuminati', artist: 'Anirudh, Dabzee', ytQuery: 'Illuminati Aavesham Anirudh', reason: 'Hypnotic dark groove with killer drops' },
        { title: 'Jailer Title Track', artist: 'Anirudh Ravichander', ytQuery: 'Jailer Title Track Anirudh', reason: 'Cinematic mass anthem energy' },
        { title: 'Ranjithame', artist: 'Anirudh, Jonita Gandhi', ytQuery: 'Ranjithame Varisu', reason: 'Upbeat dance number with catchy hooks' },
        { title: 'Why This Kolaveri Di', artist: 'Dhanush', ytQuery: 'Why This Kolaveri Di Dhanush', reason: 'The original viral Tamil sensation' }
      ]
    };
  }

  if (p.includes('telugu') || p.includes('pushpa') || p.includes('rrr') || p.includes('tollywood') || p.includes('thaman')) {
    return {
      djTitle: `Pulse AI: Telugu Chartbusters & Mass`,
      vibe: `Massive Telugu beats from blockbuster films — pure south Indian energy`,
      tracks: [
        { title: 'Naatu Naatu', artist: 'Rahul Sipligunj, Kaala Bhairava', ytQuery: 'Naatu Naatu RRR', reason: 'Oscar-winning global dance sensation' },
        { title: 'Srivalli', artist: 'Sid Sriram', ytQuery: 'Srivalli Pushpa', reason: 'Hauntingly beautiful melody with depth' },
        { title: 'Oo Antava', artist: 'Indravathi Chauhan', ytQuery: 'Oo Antava Pushpa', reason: 'Viral seductive groove and bass' },
        { title: 'Buttabomma', artist: 'Armaan Malik', ytQuery: 'Buttabomma Ala Vaikunthapurramuloo', reason: 'Sweet romantic melody with mass appeal' },
        { title: 'Jigelu Rani', artist: 'Rahul Sipligunj', ytQuery: 'Jigelu Rani Rangasthalam', reason: 'High-energy folk dance anthem' },
        { title: 'Saami Saami', artist: 'Mounika Yadav', ytQuery: 'Saami Saami Pushpa', reason: 'Addictive folk-pop rhythm and dance' }
      ]
    };
  }

  if (p.includes('kannada') || p.includes('kantara') || p.includes('kgf') || p.includes('sandalwood')) {
    return {
      djTitle: `Pulse AI: Kannada Hits & Cinema Vibes`,
      vibe: `Powerful Kannada melodies from cinema's finest — raw emotion and folk energy`,
      tracks: [
        { title: 'Singara Siriye', artist: 'Vijay Prakash, Ananya Bhat', ytQuery: 'Singara Siriye Kantara', reason: 'Cinematic folk masterpiece with spiritual depth' },
        { title: 'Varaha Roopam', artist: 'Sai Vignesh', ytQuery: 'Varaha Roopam Kantara', reason: 'Haunting divine chant turned anthem' },
        { title: 'Salaam Rocky Bhai', artist: 'Vijay Prakash', ytQuery: 'Salaam Rocky Bhai KGF', reason: 'Adrenaline-pumping mass anthem' },
        { title: 'Gaalipata', artist: 'Sonu Nigam', ytQuery: 'Gaalipata Sonu Nigam Kannada', reason: 'Soulful romantic breeze melody' },
        { title: 'Bombe Helutaithe', artist: 'Raghu Dixit', ytQuery: 'Bombe Helutaithe Raajakumara', reason: 'Feel-good romantic charm' },
        { title: 'Toofan', artist: 'V Harikrishna', ytQuery: 'Toofan KGF Chapter 2', reason: 'Epic cinematic action anthem' }
      ]
    };
  }

  if (p.includes('pakistani') || p.includes('coke studio') || p.includes('urdu') || p.includes('atif') || p.includes('nusrat')) {
    return {
      djTitle: `Pulse AI: Pakistani Soul & Coke Studio`,
      vibe: `Hauntingly beautiful Pakistani vocals — from Coke Studio to modern indie`,
      tracks: [
        { title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', ytQuery: 'Pasoori Coke Studio Ali Sethi Shae Gill', reason: 'Global viral sensation — east meets west' },
        { title: 'Kahani Suno 2.0', artist: 'Kaifi Khalil', ytQuery: 'Kahani Suno 2.0 Kaifi Khalil', reason: 'Deeply emotional storytelling in melody' },
        { title: 'Tu Jhoom', artist: 'Abida Parveen, Naseebo Lal', ytQuery: 'Tu Jhoom Coke Studio Season 14', reason: 'Two legends in divine Sufi ecstasy' },
        { title: 'Afreen Afreen', artist: 'Rahat Fateh Ali Khan, Momina Mustehsan', ytQuery: 'Afreen Afreen Coke Studio', reason: 'Qawwali magic meets modern beauty' },
        { title: 'Tajdar E Haram', artist: 'Atif Aslam', ytQuery: 'Tajdar E Haram Coke Studio Atif Aslam', reason: 'Atif\'s most powerful devotional rendition' },
        { title: 'Wishes', artist: 'Hasan Raheem, Umair', ytQuery: 'Wishes Hasan Raheem Umair Talwiinder', reason: 'Modern Pakistani indie pop gem' }
      ]
    };
  }

  if (p.includes('lofi') || p.includes('lo-fi') || p.includes('chill') || p.includes('study') || p.includes('relax') || p.includes('sleep')) {
    return {
      djTitle: `Pulse AI: Lo-Fi Chill & Study Beats`,
      vibe: `Mellow beats, warm textures and ambient vibes for focus and relaxation`,
      tracks: [
        { title: 'Snowman', artist: 'Sia', ytQuery: 'Snowman Sia', reason: 'Soft warm vocal perfect for chill' },
        { title: 'Sunflower', artist: 'Post Malone, Swae Lee', ytQuery: 'Sunflower Post Malone', reason: 'Laid-back groove with gentle energy' },
        { title: 'Love Yourself', artist: 'Justin Bieber', ytQuery: 'Love Yourself Justin Bieber', reason: 'Minimalist acoustic chill perfection' },
        { title: 'Electric Love', artist: 'BØRNS', ytQuery: 'Electric Love BORNS', reason: 'Dreamy synth-pop with soft energy' },
        { title: 'Night Changes', artist: 'One Direction', ytQuery: 'Night Changes One Direction', reason: 'Nostalgic soft melody for quiet moments' },
        { title: 'Fly Me to the Moon', artist: 'Frank Sinatra', ytQuery: 'Fly Me to the Moon Frank Sinatra', reason: 'Timeless classic for cozy evenings' }
      ]
    };
  }

  if (p.includes('rock') || p.includes('metal') || p.includes('alt') || p.includes('nirvana') || p.includes('linkin') || p.includes('queen')) {
    return {
      djTitle: `Pulse AI: Rock Legends & Alt Anthems`,
      vibe: `Guitar-driven power, raw emotion and stadium-filling rock energy`,
      tracks: [
        { title: 'Bohemian Rhapsody', artist: 'Queen', ytQuery: 'Bohemian Rhapsody Queen', reason: 'The greatest rock opera ever composed' },
        { title: 'Numb', artist: 'Linkin Park', ytQuery: 'Numb Linkin Park', reason: 'Iconic nu-metal anthem of a generation' },
        { title: 'Smells Like Teen Spirit', artist: 'Nirvana', ytQuery: 'Smells Like Teen Spirit Nirvana', reason: 'Grunge revolution in one song' },
        { title: 'Thunder', artist: 'Imagine Dragons', ytQuery: 'Thunder Imagine Dragons', reason: 'Modern rock with massive pop appeal' },
        { title: 'Back In Black', artist: 'AC/DC', ytQuery: 'Back In Black AC DC', reason: 'Hard rock\'s most iconic riff' },
        { title: 'In the End', artist: 'Linkin Park', ytQuery: 'In the End Linkin Park', reason: 'Emotional masterpiece with iconic verses' }
      ]
    };
  }

  if (p.includes('party') || p.includes('club') || p.includes('dance') || p.includes('hype') || p.includes('friday') || p.includes('vibe')) {
    return {
      djTitle: `Pulse AI: Ultimate Party & Club Bangers`,
      vibe: `High-energy tracks to light up any party — pure dance floor fire`,
      tracks: [
        { title: 'Levitating', artist: 'Dua Lipa', ytQuery: 'Levitating Dua Lipa', reason: 'Irresistible disco-pop dance energy' },
        { title: 'Uptown Funk', artist: 'Bruno Mars, Mark Ronson', ytQuery: 'Uptown Funk Bruno Mars', reason: 'The ultimate feel-good party anthem' },
        { title: 'Don\'t Start Now', artist: 'Dua Lipa', ytQuery: 'Don\'t Start Now Dua Lipa', reason: 'Infectious bass groove and confidence' },
        { title: 'Cheap Thrills', artist: 'Sia', ytQuery: 'Cheap Thrills Sia', reason: 'Dance anthem with global reach' },
        { title: 'Dynamite', artist: 'BTS', ytQuery: 'Dynamite BTS', reason: 'K-pop party energy with English lyrics' },
        { title: 'Senorita', artist: 'Camila Cabello, Shawn Mendes', ytQuery: 'Senorita Camila Cabello Shawn Mendes', reason: 'Sultry summer heat on the dance floor' }
      ]
    };
  }

  if (p.includes('korean') || p.includes('kpop') || p.includes('k-pop') || p.includes('bts') || p.includes('blackpink')) {
    return {
      djTitle: `Pulse AI: K-Pop Hits & Korean Vibes`,
      vibe: `Infectious K-pop energy with world-class production and choreography`,
      tracks: [
        { title: 'Dynamite', artist: 'BTS', ytQuery: 'Dynamite BTS', reason: 'Global K-pop anthem in English' },
        { title: 'How You Like That', artist: 'BLACKPINK', ytQuery: 'How You Like That BLACKPINK', reason: 'Hard-hitting girl power anthem' },
        { title: 'Gangnam Style', artist: 'PSY', ytQuery: 'Gangnam Style PSY', reason: 'The original viral K-pop sensation' },
        { title: 'Butter', artist: 'BTS', ytQuery: 'Butter BTS', reason: 'Smooth summer bop with slick groove' },
        { title: 'Pink Venom', artist: 'BLACKPINK', ytQuery: 'Pink Venom BLACKPINK', reason: 'Fierce energy with massive drops' },
        { title: 'Love Dive', artist: 'IVE', ytQuery: 'Love Dive IVE', reason: 'Elegant modern K-pop perfection' }
      ]
    };
  }

  if (p.includes('devotional') || p.includes('spiritual') || p.includes('bhajan') || p.includes('mantra') || p.includes('prayer')) {
    return {
      djTitle: `Pulse AI: Sacred Devotional & Spiritual`,
      vibe: `Divine chants, mantras and spiritual melodies for inner peace`,
      tracks: [
        { title: 'Devi Kavacham', artist: 'Appaji', ytQuery: 'Devi Kavacham Appaji', reason: 'Sacred protection chant with divine power' },
        { title: 'Hanuman Chalisa', artist: 'Hariharan', ytQuery: 'Hanuman Chalisa Hariharan', reason: 'Most powerful devotional recitation' },
        { title: 'Aigiri Nandini', artist: 'Bombay Jayashri', ytQuery: 'Aigiri Nandini Mahishasura Mardini', reason: 'Ancient hymn of divine feminine power' },
        { title: 'Om Jai Jagdish Hare', artist: 'Anuradha Paudwal', ytQuery: 'Om Jai Jagdish Hare Aarti', reason: 'Classic universal evening prayer' },
        { title: 'Sri Lalitha Sahasranama', artist: 'Appaji', ytQuery: 'Sri Lalitha Sahasranama Appaji', reason: 'Sacred 1000 names of the divine mother' },
        { title: 'Achyutam Keshavam', artist: 'Madhuri Shanbhag', ytQuery: 'Achyutam Keshavam Krishna Bhajan', reason: 'Blissful Krishna devotional melody' }
      ]
    };
  }

  if (p.includes('90') || p.includes('nostalgia') || p.includes('old') || p.includes('retro') || p.includes('classic')) {
    return {
      djTitle: `Pulse AI: 90s Nostalgia & Retro Gems`,
      vibe: `Throwback anthems and golden-era melodies that never get old`,
      tracks: [
        { title: 'Chaiyya Chaiyya', artist: 'Sukhwinder Singh', ytQuery: 'Chaiyya Chaiyya Dil Se', reason: 'Iconic Bollywood dance anthem on a train' },
        { title: 'Wonderwall', artist: 'Oasis', ytQuery: 'Wonderwall Oasis', reason: 'The defining britpop anthem of the 90s' },
        { title: 'Tujhe Dekha To', artist: 'Kumar Sanu, Lata Mangeshkar', ytQuery: 'Tujhe Dekha To DDLJ', reason: 'The most romantic Bollywood melody ever' },
        { title: 'I Want It That Way', artist: 'Backstreet Boys', ytQuery: 'I Want It That Way Backstreet Boys', reason: 'Ultimate 90s pop boy band anthem' },
        { title: 'Pehla Nasha', artist: 'Udit Narayan, Sadhana Sargam', ytQuery: 'Pehla Nasha Jo Jeeta Wohi Sikandar', reason: 'First love captured in pure melody' },
        { title: 'Smack That', artist: 'Akon ft. Eminem', ytQuery: 'Smack That Akon Eminem', reason: 'Peak 2000s crossover banger energy' }
      ]
    };
  }

  if (p.includes('hip hop') || p.includes('rap') || p.includes('r&b') || p.includes('rnb') || p.includes('drake') || p.includes('eminem')) {
    return {
      djTitle: `Pulse AI: Hip-Hop & R&B Essentials`,
      vibe: `Hard-hitting bars, smooth R&B vocals and urban groove energy`,
      tracks: [
        { title: 'Lose Yourself', artist: 'Eminem', ytQuery: 'Lose Yourself Eminem', reason: 'The greatest motivational rap anthem ever' },
        { title: 'God\'s Plan', artist: 'Drake', ytQuery: 'God\'s Plan Drake', reason: 'Smooth melodic rap with deep groove' },
        { title: 'Blinding Lights', artist: 'The Weeknd', ytQuery: 'Blinding Lights The Weeknd', reason: 'Synthwave R&B masterpiece with retro energy' },
        { title: 'HUMBLE.', artist: 'Kendrick Lamar', ytQuery: 'HUMBLE Kendrick Lamar', reason: 'Hard-hitting lyrical dominance and swagger' },
        { title: 'Starboy', artist: 'The Weeknd, Daft Punk', ytQuery: 'Starboy The Weeknd', reason: 'Dark electro R&B with stellar production' },
        { title: 'Sicko Mode', artist: 'Travis Scott', ytQuery: 'Sicko Mode Travis Scott', reason: 'Genre-bending trap with wild energy' }
      ]
    };
  }

  // Default: Global Pop & Crossover Hits
  return {
    djTitle: `Pulse AI: ${userPrompt}`,
    vibe: `AI curated playlist matching "${userPrompt}" — the best of global music`,
    tracks: [
      { title: 'Blinding Lights', artist: 'The Weeknd', ytQuery: 'Blinding Lights The Weeknd', reason: 'Global synthwave masterpiece' },
      { title: 'Starboy', artist: 'The Weeknd ft. Daft Punk', ytQuery: 'Starboy The Weeknd', reason: 'High energy electro groove' },
      { title: 'Shape of You', artist: 'Ed Sheeran', ytQuery: 'Shape of You Ed Sheeran', reason: 'Catchy rhythmic pop perfection' },
      { title: 'Cruel Summer', artist: 'Taylor Swift', ytQuery: 'Cruel Summer Taylor Swift', reason: 'Soaring summer pop anthem' },
      { title: 'Levitating', artist: 'Dua Lipa', ytQuery: 'Levitating Dua Lipa', reason: 'Disco-pop with irresistible groove' },
      { title: 'As It Was', artist: 'Harry Styles', ytQuery: 'As It Was Harry Styles', reason: 'Breezy modern pop with depth' }
    ]
  };
}

export const askPulseAI = askGeminiDJ;

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
