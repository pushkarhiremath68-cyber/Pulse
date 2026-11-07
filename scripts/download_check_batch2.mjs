import fs from 'fs';

const list2 = {
  'shilpa_rao': 'https://cdn-images.dzcdn.net/images/artist/d6c9df2eb27416ade91b4b8d7caa1669/1000x1000-000000-80-0-0.jpg',
  'sunidhi_chauhan': 'https://cdn-images.dzcdn.net/images/artist/37dbd33ae8cf7075e247968acf4b48da/1000x1000-000000-80-0-0.jpg',
  'neha_kakkar': 'https://cdn-images.dzcdn.net/images/artist/3a0f7ba65d6d8c1081b461ee49cb59e8/1000x1000-000000-80-0-0.jpg',
  'jubin_nautiyal': 'https://cdn-images.dzcdn.net/images/artist/9031b483049b5551abcb11529873b4f6/1000x1000-000000-80-0-0.jpg',
  'armaan_malik': 'https://cdn-images.dzcdn.net/images/artist/3aacd4e00a34aefb6041d30e0cc5bc5e/1000x1000-000000-80-0-0.jpg',
  'darshan_raval': 'https://cdn-images.dzcdn.net/images/artist/9428424029a929927b7081b70d3a0fc6/1000x1000-000000-80-0-0.jpg',
  'diljit_dosanjh': 'https://cdn-images.dzcdn.net/images/artist/79b85e695e0ca6529e56bf3b628e92bd/1000x1000-000000-80-0-0.jpg',
  'sidhu_moosewala': 'https://cdn-images.dzcdn.net/images/artist/f559ebe3851db26a6a47a76b1d95748f/1000x1000-000000-80-0-0.jpg',
  'karan_aujla': 'https://cdn-images.dzcdn.net/images/artist/a91a1d5ea91e85e4f0966569b50e8d6a/1000x1000-000000-80-0-0.jpg',
  'ap_dhillon': 'https://cdn-images.dzcdn.net/images/artist/52594ac9fa763dc163ed13d21cb130ec/1000x1000-000000-80-0-0.jpg',
  'badshah': 'https://cdn-images.dzcdn.net/images/artist/5b90b89299a7d42f81d79afa263a85d2/1000x1000-000000-80-0-0.jpg',
  'honey_singh': 'https://cdn-images.dzcdn.net/images/artist/7859b461c10352f02a11368905f0903f/1000x1000-000000-80-0-0.jpg',
  'kailash_kher': 'https://cdn-images.dzcdn.net/images/artist/32eb684f64a49cae0dc65d85e8a6b317/1000x1000-000000-80-0-0.jpg',
  'hariharan': 'https://cdn-images.dzcdn.net/images/artist/ead44b7f4f45556dc37b026b18040ece/1000x1000-000000-80-0-0.jpg'
};

async function dlBatch2() {
  for (const [name, url] of Object.entries(list2)) {
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
dlBatch2();

