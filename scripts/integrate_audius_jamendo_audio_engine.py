import re

with open('src/audioEngine.js', 'r', encoding='utf-8') as f:
    engine = f.read()

# Enhanced Audius + Jamendo live stream search integration in resolveCandidates
audius_jamendo_block = """
      // =====================================================================
      // AUDIUS & JAMENDO API SOUNDTRACK STREAM ENGINE
      // =====================================================================
      if (searchTerms) {
        // A. Jamendo API Live Track Search & Direct 320k Stream Resolution
        try {
          const jamendoUrl = `https://api.jamendo.com/v3.0/tracks/?client_id=23b33f2a&format=json&limit=5&namesearch=${encodeURIComponent(searchTerms)}&include=musicinfo+licenses`;
          const jRes = await fetch(jamendoUrl, { signal: AbortSignal.timeout(2800) });
          if (jRes.ok) {
            const jData = await jRes.json();
            if (jData && jData.results && Array.isArray(jData.results) && jData.results.length > 0) {
              for (const jt of jData.results) {
                if (jt.audio) {
                  add(jt.audio, 'Jamendo Live Master MP3 (320k)', 320);
                  add(`https://api.jamendo.com/v3.0/tracks/file/?client_id=23b33f2a&id=${jt.id}&audioformat=mp32`, 'Jamendo HD Stream (320k)', 320);
                  add(`https://api.jamendo.com/v3.0/tracks/file/?client_id=23b33f2a&id=${jt.id}&audioformat=mp31`, 'Jamendo Standard Stream (128k)', 128);
                }
              }
            }
          }
        } catch (e) {
          console.warn('[Pulse Jamendo Audio Resolver Notice]:', e.message);
        }

        // B. Audius Decentralized Discovery Nodes Live Search & Stream Resolution
        try {
          const audiusNodes = [
            'https://discoveryprovider.audius.co',
            'https://audius-discovery-1.cultur3stake.com',
            'https://audius-dp.singapore.creatorseed.com',
            'https://dn2.monophonic.digital'
          ];
          const node = audiusNodes[Math.floor(Math.random() * audiusNodes.length)];
          const audiusSearchUrl = `${node}/v1/tracks/search?query=${encodeURIComponent(searchTerms)}&app_name=PULSE_APP`;
          const aRes = await fetch(audiusSearchUrl, { signal: AbortSignal.timeout(3000) });
          if (aRes.ok) {
            const aData = await aRes.json();
            if (aData && aData.data && Array.isArray(aData.data) && aData.data.length > 0) {
              for (const at of aData.data.slice(0, 3)) {
                if (at.id) {
                  for (const n of audiusNodes.slice(0, 2)) {
                    add(`${n}/v1/tracks/${at.id}/stream?app_name=PULSE_APP`, 'Audius Master Audio Stream (320k)', 320);
                  }
                }
              }
            }
          }
        } catch (e) {
          console.warn('[Pulse Audius Audio Resolver Notice]:', e.message);
        }
      }
"""

if 'AUDIUS & JAMENDO API SOUNDTRACK STREAM ENGINE' not in engine:
    # Insert right before JioSaavn search
    engine = engine.replace(
        '// 3. JioSaavn High-Bitrate Decrypted Streams',
        audius_jamendo_block.strip() + '\n\n      // 3. JioSaavn High-Bitrate Decrypted Streams'
    )
    with open('src/audioEngine.js', 'w', encoding='utf-8') as f:
        f.write(engine)
    print("[OK] Integrated Audius & Jamendo Audio Soundtrack Stream Engine into src/audioEngine.js")
else:
    print("[INFO] Audius & Jamendo Engine already present in src/audioEngine.js")
