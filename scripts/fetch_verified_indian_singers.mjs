import fs from 'fs';

const singerQueries = {
  'kk': 'Krishnakumar Kunnath',
  'udit-narayan': 'Udit Narayan',
  'kumar-sanu': 'Kumar Sanu',
  'alka-yagnik': 'Alka Yagnik',
  'kishore-kumar': 'Kishore Kumar',
  'lata-mangeshkar': 'Lata Mangeshkar',
  'mohammed-rafi': 'Mohammed Rafi',
  'mukesh': 'Mukesh',
  'asha-bhosle': 'Asha Bhosle',
  'jagjit-singh': 'Jagjit Singh',
  'shaan': 'Shaan',
  'mohit-chauhan': 'Mohit Chauhan',
  'pritam': 'Pritam',
  'ar-rahman': 'A.R. Rahman',
  'badshah': 'Badshah',
  'honey-singh': 'Yo Yo Honey Singh',
  'diljit-dosanjh': 'Diljit Dosanjh',
  'sidhu-moosewala': 'Sidhu Moose Wala',
  'karan-aujla': 'Karan Aujla',
  'ap-dhillon': 'AP Dhillon',
  'neha-kakkar': 'Neha Kakkar',
  'sunidhi-chauhan': 'Sunidhi Chauhan',
  'jubin-nautiyal': 'Jubin Nautiyal',
  'armaan-malik': 'Armaan Malik',
  'darshan-raval': 'Darshan Raval',
  'kailash-kher': 'Kailash Kher',
  'hariharan': 'Hariharan',
  's-p-balasubrahmanyam': 'S.P. Balasubrahmanyam',
  'k-s-chithra': 'K. S. Chithra',
  'devi-sri-prasad': 'Devi Sri Prasad',
  's-thaman': 'Thaman S.',
  'vijay-prakash': 'Vijay Prakash',
  'anirudh-ravichander': 'Anirudh Ravichander',
  'amit-trivedi': 'Amit Trivedi',
  'vishal-shekhar': 'Vishal-Shekhar',
  'shankar-ehsaan-loy': 'Shankar Mahadevan',
  'jasleen-royal': 'Jasleen Royal',
  'b-praak': 'B Praak',
  'guru-randhawa': 'Guru Randhawa',
  'shilpa-rao': 'Shilpa Rao',
  'anuv-jain': 'Anuv Jain',
  'prateek-kuhad': 'Prateek Kuhad',
  'sid-sriram': 'Sid Sriram'
};

async function fetchSingers() {
  const verified = {};
  for (const [id, query] of Object.entries(singerQueries)) {
    try {
      const res = await fetch('https://api.deezer.com/search/artist?q=' + encodeURIComponent(query));
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const top = data.data.find(d => d.name.toLowerCase() === query.toLowerCase()) || data.data[0];
        const photo = top.picture_xl || top.picture_big;
        verified[id] = {
          name: query,
          matched: top.name,
          artistId: top.id,
          photo
        };
        console.log(id.padEnd(22), '->', top.name, '|', photo);
      } else {
        console.log(id.padEnd(22), '-> NO DEEZER MATCH');
      }
    } catch (e) {
      console.error(id, e.message);
    }
    await new Promise(r => setTimeout(r, 120));
  }
  fs.writeFileSync('scripts/verified_indian_singers.json', JSON.stringify(verified, null, 2));
  console.log('Saved scripts/verified_indian_singers.json');
}

fetchSingers();
