import { execSync } from 'child_process';

const list = [
  'Hara Hara Mahadeva',
  'Mere Gurudev',
  'Sita Ram',
  'Govinda Hare',
  'Jaya Bhagavan'
];

for (const name of list) {
  const query = 'Krishna Das ' + name;
  try {
    const out = execSync(`curl.exe -s -L "https://www.youtube.com/results?search_query=${encodeURIComponent(query)}"`, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024
    });
    const match = out.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    console.log(name, '->', match ? match[1] : 'none');
  } catch (e) {
    console.log(name, '-> error:', e.message);
  }
}
