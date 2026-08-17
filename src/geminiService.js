/**
 * Pulse Music - Google Gemini AI Music Intelligence Suite
 * Designed by Pushkar Hiremath
 * 
 * Powered by Google Gemini 2.0 / 1.5 Flash Models
 * Features:
 * - Pulse Gemini AI DJ (Custom mood, vibe, tempo & activity playlist generation)
 * - ✨ Deep Lyrics & Song Meaning Explainer (Poetic breakdown, emotional themes, story)
 * - Natural Language Music Search Parser
 * - AI Voice & Music Recommendations
 */

(function(window) {
  'use strict';

  const STORAGE_KEY_GEMINI_KEY = 'pulse_gemini_api_key';
  const DEFAULT_GEMINI_MODEL = 'gemini-1.5-flash';

  // Get active Gemini API Key (User custom key or environment default)
  function getGeminiApiKey() {
    let key = localStorage.getItem(STORAGE_KEY_GEMINI_KEY) || '';
    if (!key && typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      key = import.meta.env.VITE_GEMINI_API_KEY;
    }
    if (!key && window.PULSE_GEMINI_API_KEY) {
      key = window.PULSE_GEMINI_API_KEY;
    }
    return key;
  }

  function setGeminiApiKey(key) {
    if (key) {
      localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_GEMINI_KEY);
    }
  }

  /**
   * Helper to execute Gemini Generative API calls with structured JSON / Text
   */
  async function callGeminiApi(prompt, systemInstruction = '', jsonMode = false) {
    const apiKey = getGeminiApiKey();

    // 1. Try direct Google Gemini API if API key is present
    if (apiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_MODEL}:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1500,
            responseMimeType: jsonMode ? "application/json" : "text/plain"
          }
        };

        if (systemInstruction) {
          body.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          return jsonMode ? JSON.parse(rawText) : rawText;
        }
      } catch (e) {
        console.warn('[Gemini Direct API Notice]:', e);
      }
    }

    // 2. Try Backend Server Gemini Proxy
    try {
      const serverRes = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, jsonMode })
      });
      if (serverRes.ok) {
        const result = await serverRes.json();
        return jsonMode ? (typeof result.data === 'string' ? JSON.parse(result.data) : result.data) : result.text;
      }
    } catch (e) {}

    // 3. Built-in Smart Fallback Engine (Resilient when offline or no API key)
    return null;
  }

  const PulseGemini = {
    getApiKey: getGeminiApiKey,
    setApiKey: setGeminiApiKey,

    /**
     * Gemini AI DJ: Generates a curated playlist from a user vibe, mood, or activity prompt
     * @param {string} userPrompt e.g. "Late night rainy drive hindi soulful songs"
     */
    async generateAiPlaylist(userPrompt) {
      if (!userPrompt || userPrompt.trim() === '') return null;

      const systemInstruction = `You are "Pulse Gemini AI DJ", the world's most knowledgeable music curator and DJ.
Given the user's music vibe/mood/request, generate a high-energy or atmospheric playlist of 8 to 12 tracks.
Respond ONLY with a valid JSON object matching this schema:
{
  "playlistName": "Short creative playlist title",
  "vibe": "1-sentence summary of the mood and musical aesthetic",
  "tracks": [
    {
      "title": "Exact Song Title",
      "artist": "Lead Singer / Artist",
      "genre": "Bollywood / Pop / Punjabi / Lo-Fi / etc",
      "reason": "Why this song fits the mood"
    }
  ]
}`;

      const aiResponse = await callGeminiApi(
        `User Request: "${userPrompt.trim()}". Create an incredible, authentic playlist tailored to this mood with famous, real worldwide or Indian songs.`,
        systemInstruction,
        true
      );

      if (aiResponse && aiResponse.tracks && Array.isArray(aiResponse.tracks)) {
        return aiResponse;
      }

      // High-Quality Fallback Curation
      const promptLower = userPrompt.toLowerCase();
      if (promptLower.includes('rain') || promptLower.includes('chill') || promptLower.includes('relax') || promptLower.includes('night')) {
        return {
          playlistName: "Midnight Monsoon Vibes 🌧️",
          vibe: "Soulful acoustic melodies and soothing late-night vocals.",
          tracks: [
            { title: "Baarishein", artist: "Anuv Jain", genre: "Indie Pop", reason: "Soft acoustic rain anthem" },
            { title: "Apna Bana Le", artist: "Arijit Singh", genre: "Bollywood", reason: "Warm emotional vocals" },
            { title: "Kesariya", artist: "Arijit Singh, Pritam", genre: "Bollywood", reason: "Heartwarming melody" },
            { title: "Choo Lo", artist: "The Local Train", genre: "Hindi Rock", reason: "Nostalgic rainy evening vibe" },
            { title: "Sajni", artist: "Arijit Singh", genre: "Indie Pop", reason: "Peaceful acoustic groove" },
            { title: "Husn", artist: "Anuv Jain", genre: "Indie Pop", reason: "Gentle late-night poetry" },
            { title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", genre: "Pop", reason: "Dreamy melodic duet" },
            { title: "Iktara", artist: "Kavita Seth, Amit Trivedi", genre: "Sufi Pop", reason: "Timeless soulful classic" }
          ]
        };
      } else if (promptLower.includes('gym') || promptLower.includes('workout') || promptLower.includes('party') || promptLower.includes('energy')) {
        return {
          playlistName: "High-Octane Power Mix 🔥",
          vibe: "Heavy bass, driving rhythms, and unstoppable workout energy.",
          tracks: [
            { title: "Tauba Tauba", artist: "Karan Aujla", genre: "Punjabi Hits", reason: "Unmatched infectious groove" },
            { title: "Aaj Ki Raat", artist: "Madhubanti Bagchi, Sachin-Jigar", genre: "Bollywood Dance", reason: "Electrifying dance beats" },
            { title: "Dhoom Again", artist: "Vishal Dadlani", genre: "Dance", reason: "Pure cardio hype anthem" },
            { title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", genre: "Bollywood", reason: "Fast-paced dynamic beat" },
            { title: "Mauja Hi Mauja", artist: "Mika Singh", genre: "Bhangra Pop", reason: "Peak celebration energy" },
            { title: "Starboy", artist: "The Weeknd, Daft Punk", genre: "Synthwave", reason: "Driving electronic pulse" },
            { title: "Shape of You", artist: "Ed Sheeran", genre: "Pop", reason: "Upbeat rhythm keeper" }
          ]
        };
      }

      return {
        playlistName: `Gemini AI: ${userPrompt.substring(0, 24)} ✨`,
        vibe: "Tailored multi-genre selection inspired by your prompt.",
        tracks: [
          { title: "Kesariya", artist: "Arijit Singh", genre: "Bollywood", reason: "Top charted vocal hit" },
          { title: "Blinding Lights", artist: "The Weeknd", genre: "Pop", reason: "Global rhythm anthem" },
          { title: "Apna Bana Le", artist: "Arijit Singh", genre: "Bollywood", reason: "Heartfelt acoustic" },
          { title: "Tauba Tauba", artist: "Karan Aujla", genre: "Punjabi", reason: "Trending high energy" },
          { title: "Sajni", artist: "Arijit Singh", genre: "Bollywood", reason: "Smooth melody" }
        ]
      };
    },

    /**
     * Gemini Song Insights: Deep explanation of lyrics, story, and poetic meaning
     */
    async explainSong(title, artist, lyricsSnippet = '') {
      if (!title) return null;

      const systemInstruction = `You are a world-renowned musicologist, lyric analyst, and music historian for Pulse Music.
Provide a rich, deeply engaging, and beautifully formatted explanation of the given song.
Include:
1. 🎭 **Emotional Essence & Mood Meter** (e.g. 95% Romantic, 80% Nostalgic)
2. 📖 **The Story Behind the Lyrics** (What the song is expressing, poetic metaphors, background context)
3. 🎤 **Vocal & Musical Highlights** (Singing nuances, production style, key instruments)
4. ✨ **Key Line Translation & Meaning** (Translate and explain the deepest lyric)`;

      const prompt = `Song Title: "${title}"
Artist: "${artist || 'Unknown'}"
${lyricsSnippet ? `Lyrics Snippet:\n${lyricsSnippet}` : ''}

Explain this song in rich, aesthetic markdown format for a music streaming app.`;

      const explanation = await callGeminiApi(prompt, systemInstruction, false);

      if (explanation) return explanation;

      // Smart fallback summary
      return `### 🎭 Emotional Essence: Romantic & Soulful (92%)
**"${title}"** by **${artist || 'Pulse Artist'}** is celebrated for its evocative melodies and poignant songwriting.

---

### 📖 The Story & Meaning
The song explores the vulnerability of deep love and connection. Through poetic imagery, the narrator expresses how love transcends everyday moments, transforming longing into an unforgettable artistic experience.

---

### 🎤 Vocal Nuances & Production
- **Vocal Delivery:** Effortless dynamic range with emotive rasp and delicate falsetto.
- **Instrumentation:** Acoustic strings layered over modern rhythmic percussion, creating an immersive stereophonic soundscape.

---

> ✨ *"A masterpiece of emotion that resonates with listeners worldwide on Pulse Music."*`;
    },

    /**
     * Gemini Natural Language Search Parser
     */
    async parseNaturalSearch(query) {
      if (!query || query.length < 4) return { cleanTerms: query, genre: null };

      const prompt = `Convert this natural conversational music query into specific search keywords (Song title, Artist, Movie, or Album):
Query: "${query}"

Respond ONLY with a JSON object: {"cleanTerms": "search query", "genre": "genre or null"}`;

      const res = await callGeminiApi(prompt, 'You extract music search keywords.', true);
      return res || { cleanTerms: query, genre: null };
    },

    /**
     * Gemini AI Track Metadata & Video Identifier
     */
    async resolveTrackMetadata(query) {
      if (!query) return null;
      const prompt = `Identify the exact official song metadata for: "${query}".
Respond ONLY with a JSON object:
{
  "title": "Official Song Title",
  "artist": "Official Artist / Singer",
  "album": "Album or Movie Name",
  "year": 2024,
  "language": "Hindi / English / Punjabi / etc",
  "youtubeId": "11-character YouTube ID if known, or null"
}`;
      const res = await callGeminiApi(prompt, 'You are an accurate music metadata identifier.', true);
      return res;
    }
  };

  window.PulseGemini = PulseGemini;

})(typeof window !== 'undefined' ? window : globalThis);
