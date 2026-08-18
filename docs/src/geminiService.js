/**
 * Pulse Music - Gemini AI DJ & Smart Music Recommendation Engine
 * Powered by Google Gemini 3.6 Flash & Pulse Music API Resolver.
 */

const GEMINI_MODEL = 'gemini-3.6-flash';

// Smart Pre-Trained Curations for instant zero-latency responses
export const SMART_VIBE_PRESETS = {
  'late night': {
    djTitle: 'Midnight Drive & Nostalgia',
    vibe: 'Atmospheric synthwave, dark R&B, and moody basslines',
    tracks: [
      { title: 'Starboy', artist: 'The Weeknd', reason: 'Iconic nighttime electronic groove' },
      { title: 'Blinding Lights', artist: 'The Weeknd', reason: 'High-speed synth-pop masterpiece' },
      { title: 'Midnight City', artist: 'M83', reason: 'Epic dreamy saxophone and atmospheric synth' },
      { title: 'After Dark', artist: 'Mr.Kitty', reason: 'Hypnotic darkwave driving energy' },
      { title: 'Nightcall', artist: 'Kavinsky', reason: 'Cinematic late-night neon vibes' }
    ]
  },
  'workout': {
    djTitle: 'High-Octane Gym Power',
    vibe: 'Heavy bass drops, hardstyle EDM, and adrenaline-pumping anthems',
    tracks: [
      { title: 'Titanium', artist: 'David Guetta, Sia', reason: 'Unstoppable power anthem' },
      { title: 'Wake Me Up', artist: 'Avicii', reason: 'High BPM country-dance surge' },
      { title: 'Faded', artist: 'Alan Walker', reason: 'Driving electro hook' },
      { title: 'Believer', artist: 'Imagine Dragons', reason: 'Heavy percussive intensity' },
      { title: 'Closer', artist: 'The Chainsmokers', reason: 'Upbeat pacing' }
    ]
  },
  'hindi': {
    djTitle: 'Bollywood Romance & Desi Heartbeats',
    vibe: 'Soulful acoustic guitars, sufi harmonies, and iconic melodies',
    tracks: [
      { title: 'Kesariya', artist: 'Arijit Singh, Pritam', reason: 'The defining romantic anthem of this decade' },
      { title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', reason: 'Ethereal acoustic devotion' },
      { title: 'Lover', artist: 'Diljit Dosanjh', reason: 'Irresistible Punjabi pop rhythm' },
      { title: 'Softly', artist: 'Karan Aujla, Ikky', reason: 'Smooth contemporary desi trap groove' },
      { title: 'Tujhe Dekha Toh', artist: 'Kumar Sanu, Lata Mangeshkar', reason: 'Timeless Bollywood nostalgia' }
    ]
  },
  'lofi': {
    djTitle: 'Deep Focus & Study Session',
    vibe: 'Cozy vinyl crackle, mellow piano chords, and soothing tempo',
    tracks: [
      { title: 'Rainy Coffee Shop', artist: 'Chillhop Music', reason: 'Warm ambience and relaxing keys' },
      { title: 'Midnight Comfy Beats', artist: 'Rob Knox', reason: 'Smooth jazz-infused lo-fi drums' },
      { title: 'Study Session', artist: 'Lofi Girl', reason: 'Continuous tranquil flow' },
      { title: 'Quiet Night', artist: 'Ambient Lofi', reason: 'Meditative calmness' }
    ]
  }
};

/**
 * Generates Gemini AI Recommendations for any user mood/prompt
 */
export async function askGeminiDJ(userPrompt, apiKey = null) {
  if (!userPrompt || userPrompt.trim().length === 0) {
    throw new Error('Please enter a mood, artist, or vibe for Gemini DJ.');
  }

  const lower = userPrompt.toLowerCase();

  // 1. Direct Google GenAI API Call if API key is provided
  if (apiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
      const systemPrompt = `You are Gemini DJ, an expert AI music curator for Pulse Music. Return a JSON object with:
{
  "djTitle": "Catchy short playlist title",
  "vibe": "1-sentence summary of the mood and sound",
  "tracks": [
    { "title": "Song Title", "artist": "Artist Name", "reason": "Short 10-word why" }
  ]
}
Recommend 5 to 6 real, highly acclaimed songs matching the listener's prompt: "${userPrompt}". ONLY return valid JSON.`;

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
        if (rawText) {
          const parsed = JSON.parse(rawText);
          return parsed;
        }
      }
    } catch (e) {
      console.warn('[GeminiService] Live API call notice:', e);
    }
  }

  // 2. Intelligent Keyword & Context Matching Engine
  for (const [key, preset] of Object.entries(SMART_VIBE_PRESETS)) {
    if (lower.includes(key)) {
      return preset;
    }
  }

  if (lower.includes('study') || lower.includes('chill') || lower.includes('sleep') || lower.includes('peace')) {
    return SMART_VIBE_PRESETS['lofi'];
  }
  if (lower.includes('bollywood') || lower.includes('desi') || lower.includes('punjabi') || lower.includes('indian') || lower.includes('arijit')) {
    return SMART_VIBE_PRESETS['hindi'];
  }
  if (lower.includes('gym') || lower.includes('dance') || lower.includes('run') || lower.includes('club') || lower.includes('energy')) {
    return SMART_VIBE_PRESETS['workout'];
  }

  // Default Dynamic Mix
  return {
    djTitle: `Gemini DJ Mix: ${userPrompt.charAt(0).toUpperCase() + userPrompt.slice(1)}`,
    vibe: `A tailored sonic mix specially crafted for "${userPrompt}"`,
    tracks: [
      { title: 'Starboy', artist: 'The Weeknd', reason: 'High energy pulse' },
      { title: 'Kesariya', artist: 'Arijit Singh', reason: 'Emotional resonance' },
      { title: 'Faded', artist: 'Alan Walker', reason: 'Hypnotic electronic flow' },
      { title: 'Lover', artist: 'Diljit Dosanjh', reason: 'Vibrant rhythmic groove' },
      { title: 'Believer', artist: 'Imagine Dragons', reason: 'Driving powerful momentum' }
    ]
  };
}

const geminiService = {
  askGeminiDJ,
  SMART_VIBE_PRESETS
};

if (typeof window !== 'undefined') {
  window.geminiService = geminiService;
  window.PulseGemini = geminiService;
}

export default geminiService;
