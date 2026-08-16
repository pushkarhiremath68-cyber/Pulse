const fs = require('fs');

global.window = {
  PULSE_STORAGE_BUCKET: 'music',
  TRACKS_REGISTRY: {}
};
global.fetch = fetch;

const code = fs.readFileSync('src/musicService.js', 'utf8');
eval(code);

async function runTests() {
  console.log('Testing getAudioCandidates across multiple genres:');
  const testTracks = [
    { id: 'in-kesariya', title: 'Kesariya', artist: 'Arijit Singh', storagePath: 'in-kesariya.m4a' },
    { id: 'en-espresso', title: 'Espresso', artist: 'Sabrina Carpenter', storagePath: 'en-espresso.mp4' },
    { id: 'dev-hanuman-chalisa-gulshan', title: 'Shri Hanuman Chalisa', artist: 'Gulshan Kumar', storagePath: 'dev-hanuman-chalisa-gulshan.mp4' },
    { id: 'kn-belageddu', title: 'Belageddu', artist: 'Vijay Prakash', storagePath: 'kn-belageddu.mp4' },
    { id: 'pj-295-sidhu', title: '295', artist: 'Sidhu Moose Wala', storagePath: 'in-295-sidhu.m4a' },
    { id: 'random-unseen-song', title: 'Shape of You', artist: 'Ed Sheeran' }
  ];

  for (const track of testTracks) {
    const candidates = await window.musicService.getAudioCandidates(track);
    console.log(`Track '${track.title}' (${track.id}) => ${candidates.length} candidates:`);
    candidates.slice(0, 3).forEach(c => console.log(`   [${c.label}] ${c.url.substring(0, 75)}`));
  }
}

runTests().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
