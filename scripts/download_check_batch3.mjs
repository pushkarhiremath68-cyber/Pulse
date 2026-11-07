import fs from 'fs';

const list3 = {
  'spb': 'https://cdn-images.dzcdn.net/images/artist/d892204d2b88ad355fb022e09dd6c134/1000x1000-000000-80-0-0.jpg',
  'chithra': 'https://cdn-images.dzcdn.net/images/artist/b955b3207b61e722cf4d63ee0c762b12/1000x1000-000000-80-0-0.jpg',
  'dsp': 'https://cdn-images.dzcdn.net/images/artist/a904f8ee6cc4dcb472f75bd8ae1a21da/1000x1000-000000-80-0-0.jpg',
  'thaman': 'https://cdn-images.dzcdn.net/images/artist/f42d76b5c7e4e5dcb1afb373321f16c4/1000x1000-000000-80-0-0.jpg',
  'vijay_prakash': 'https://cdn-images.dzcdn.net/images/artist/3d112cbc8570a026002b7e05142dc191/1000x1000-000000-80-0-0.jpg',
  'anirudh': 'https://cdn-images.dzcdn.net/images/artist/9da0a547b39e99bc35c6a9724aef91bf/1000x1000-000000-80-0-0.jpg',
  'amit_trivedi': 'https://cdn-images.dzcdn.net/images/artist/b1c15791419c0f9c6ea4a55f80319d6a/1000x1000-000000-80-0-0.jpg',
  'vishal_shekhar': 'https://cdn-images.dzcdn.net/images/artist/5871137ebfd9723ea757b8380fe404c5/1000x1000-000000-80-0-0.jpg',
  'shankar_mahadevan': 'https://cdn-images.dzcdn.net/images/artist/aefd6e3d941a0a1fd8baea6cf4a03c6a/1000x1000-000000-80-0-0.jpg',
  'jasleen_royal': 'https://cdn-images.dzcdn.net/images/artist/c83791c10f0ec33e1d8a18b1a8ff9f84/1000x1000-000000-80-0-0.jpg',
  'b_praak': 'https://cdn-images.dzcdn.net/images/artist/efe513aabaa0a94c4db307ac3431b833/1000x1000-000000-80-0-0.jpg',
  'guru_randhawa': 'https://cdn-images.dzcdn.net/images/artist/108309345087dbd61b29766185e93b72/1000x1000-000000-80-0-0.jpg',
  'anuv_jain': 'https://cdn-images.dzcdn.net/images/artist/eb0c0e91c8ad621b41178e0d66c81057/1000x1000-000000-80-0-0.jpg',
  'prateek_kuhad': 'https://cdn-images.dzcdn.net/images/artist/7f69b3905ae630b3f7bcd826bd2dc46f/1000x1000-000000-80-0-0.jpg',
  'sid_sriram': 'https://cdn-images.dzcdn.net/images/artist/fbe3e1d17fc6958e047f011f74233f82/1000x1000-000000-80-0-0.jpg',
  'michael_jackson': 'https://cdn-images.dzcdn.net/images/artist/ff1c8cf777db1efc2043b90d79dcbfc3/1000x1000-000000-80-0-0.jpg',
  'queen': 'https://cdn-images.dzcdn.net/images/artist/eb41ddbc505b7c7e68d5d81a4be8c7f7/1000x1000-000000-80-0-0.jpg',
  'lady_gaga': 'https://cdn-images.dzcdn.net/images/artist/7565262f7661b0d762621a8d69ba6f49/1000x1000-000000-80-0-0.jpg',
  'katy_perry': 'https://cdn-images.dzcdn.net/images/artist/9c144bd1ed91b2a59c826cf1d1cde633/1000x1000-000000-80-0-0.jpg',
  'appaji': 'https://cdn-images.dzcdn.net/images/artist/dd10749e7dee94c191fb4326b4bf23f6/1000x1000-000000-80-0-0.jpg'
};

async function dlBatch3() {
  for (const [name, url] of Object.entries(list3)) {
    try {
      const res = await fetch(url);
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(`scripts/check_${name}.jpg`, buf);
      console.log('Saved check_' + name + '.jpg');
    } catch (e) {
      console.error(name, e.message);
    }
  }
}
dlBatch3();
