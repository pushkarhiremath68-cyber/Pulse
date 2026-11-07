import fs from 'fs';

const list = {
  'udit': 'https://cdn-images.dzcdn.net/images/artist/287f18b3d4798dfff688a9246184b084/1000x1000-000000-80-0-0.jpg',
  'kumar_sanu': 'https://cdn-images.dzcdn.net/images/artist/7ad58f1c03087a082e22a718acc3f1fc/1000x1000-000000-80-0-0.jpg',
  'alka_yagnik': 'https://cdn-images.dzcdn.net/images/artist/ebb52754c04679e33acf4d6056fa211a/1000x1000-000000-80-0-0.jpg',
  'kishore_kumar': 'https://cdn-images.dzcdn.net/images/artist/5972263348ad902e29a4749e748ff452/1000x1000-000000-80-0-0.jpg',
  'lata_mangeshkar': 'https://cdn-images.dzcdn.net/images/artist/837d46f90f541736e07817f463317c80/1000x1000-000000-80-0-0.jpg',
  'mohammed_rafi': 'https://cdn-images.dzcdn.net/images/artist/9e79b89a9b2073fae0cc2f6bce278abe/1000x1000-000000-80-0-0.jpg',
  'mukesh': 'https://cdn-images.dzcdn.net/images/artist/681c4defe94f8a7c23bbdb1b5edfd143/1000x1000-000000-80-0-0.jpg',
  'asha_bhosle': 'https://cdn-images.dzcdn.net/images/artist/6e2b8e5131fd1357c6452139f4e6d578/1000x1000-000000-80-0-0.jpg',
  'jagjit_singh': 'https://cdn-images.dzcdn.net/images/artist/b8a9b9c156d494b1a86fb2135ab30f5b/1000x1000-000000-80-0-0.jpg',
  'shaan': 'https://cdn-images.dzcdn.net/images/artist/1ec5435a81d309a3bf82ba82030e767b/1000x1000-000000-80-0-0.jpg',
  'mohit_chauhan': 'https://cdn-images.dzcdn.net/images/artist/f9533880207ac5714b65e760e5686af8/1000x1000-000000-80-0-0.jpg',
  'pritam': 'https://cdn-images.dzcdn.net/images/artist/d4914ccd414067cd5e2c108867079a85/1000x1000-000000-80-0-0.jpg',
  'ar_rahman': 'https://cdn-images.dzcdn.net/images/artist/bd34315ef977a62a9e28c1ab19bb8ac4/1000x1000-000000-80-0-0.jpg'
};

async function dlBatch() {
  for (const [name, url] of Object.entries(list)) {
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
dlBatch();
