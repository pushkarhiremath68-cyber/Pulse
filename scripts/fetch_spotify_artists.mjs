import fs from 'fs';

async function check() {
  const ids = {
    'Arijit Singh': '4YRxDV8whtuzgg2rh2YrmY',
    'Sonu Nigam': '1tq9q4m0zS4mFhUuM9e5bO',
    'Shreya Ghoshal': '0oOet2C40bcD2oTG8UUpII',
    'KK': '4fEkbug6kZIOq9creAeogb',
    'Pritam': '1wRPtKGflJrxyOPZsSwMMx',
    'Mohit Chauhan': '1mYsTxn95iR0s4cu65WMaq',
    'Alka Yagnik': '6v7uWw88g4q7U1rTfS7U2n',
    'Kishore Kumar': '4W91bbPB2CTSsHwq7uo4oy',
    'Lata Mangeshkar': '61IHI26sQ1wdfJps7g7Fqf',
    'Mohammed Rafi': '0gxyHStUvyNjUhUNEGiaMb'
  };

  for (const [name, id] of Object.entries(ids)) {
    try {
      const res = await fetch('https://open.spotify.com/artist/' + id, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await res.text();
      const m = html.match(/property="og:image"\s+content="([^"]+)"/);
      console.log(name, '->', m ? m[1] : 'null');
    } catch (e) {
      console.log(name, 'error', e.message);
    }
  }
}
check();

