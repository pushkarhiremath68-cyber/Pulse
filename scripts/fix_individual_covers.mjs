import fs from 'fs';

let content = fs.readFileSync('src/catalogService.js', 'utf8');

// Replacements for tracks sharing covers with other songs
const fixes = [
  // 1. Levels by Avicii
  {
    target: /\{\s*id:\s*['"]ytm-_ovdm2yX4MA['"],\s*title:\s*['"]Levels['"],\s*artist:\s*['"]Avicii['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-_ovdm2yX4MA", title: "Levels", artist: "Avicii", coverUrl: "https://i.ytimg.com/vi/_ovdm2yX4MA/hqdefault.jpg"`
  },
  // 2. Please Please Please in CATALOG_CATEGORIES and LANGUAGE_PLAYLISTS
  {
    target: /\{\s*id:\s*['"](?:ytm-cF1Na4AIecM|rel-please-please-please)['"],\s*title:\s*['"]Please Please Please['"],\s*artist:\s*['"]Sabrina Carpenter['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music211\/v4\/57\/e8\/7b\/57e87ba0-5057-9bb9-c247-ce7dbe426e89\/24UMGIM55213\.rgb\.jpg\/600x600bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/57/e8/7b/57e87ba0-5057-9bb9-c247-ce7dbe426e89/24UMGIM55213.rgb.jpg/600x600bb.jpg', 'https://i.ytimg.com/vi/cF1Na4AIecM/hqdefault.jpg')
  },
  // 3. Perfect by Ed Sheeran
  {
    target: /\{\s*id:\s*['"]ytm-2Vv-BfVoq4g['"],\s*title:\s*['"]Perfect['"],\s*artist:\s*['"]Ed Sheeran['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music115\/v4\/15\/e6\/e8\/15e6e8a4-4190-6a8b-86c3-ab4a51b88288\/190295851286\.jpg\/1000x1000bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg', 'https://i.ytimg.com/vi/2Vv-BfVoq4g/hqdefault.jpg')
  },
  // 4. Rolling in the Deep by Adele
  {
    target: /\{\s*id:\s*['"]ytm-rYEDA3JcQqw['"],\s*title:\s*['"]Rolling in the Deep['"],\s*artist:\s*['"]Adele['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music221\/v4\/eb\/ca\/25\/ebca2596-cd1e-b295-91a3-771c868d0a79\/191404113868\.png\/600x600bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg', 'https://i.ytimg.com/vi/rYEDA3JcQqw/hqdefault.jpg')
  },
  // 5. All of Me by John Legend
  {
    target: /\{\s*id:\s*['"]ytm-450p7goxZqg['"],\s*title:\s*['"]All of Me['"],\s*artist:\s*['"]John Legend['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music125\/v4\/08\/23\/fc\/0823fcd9-cb44-695b-32bf-b3bf904f852b\/886444265780\.jpg\/1000x1000bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf904f852b/886444265780.jpg/1000x1000bb.jpg', 'https://i.ytimg.com/vi/450p7goxZqg/hqdefault.jpg')
  },
  // 6. Animals by Martin Garrix
  {
    target: /\{\s*id:\s*['"]ytm-gCYcHz2k5x0['"],\s*title:\s*['"]Animals['"],\s*artist:\s*['"]Martin Garrix['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-gCYcHz2k5x0", title: "Animals", artist: "Martin Garrix", coverUrl: "https://i.ytimg.com/vi/gCYcHz2k5x0/hqdefault.jpg"`
  },
  // 7. Closer by Chainsmokers
  {
    target: /\{\s*id:\s*['"]ytm-0zGcUoRlhmw['"],\s*title:\s*['"]Closer['"],\s*artist:\s*['"]The Chainsmokers ft\. Halsey['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-0zGcUoRlhmw", title: "Closer", artist: "The Chainsmokers ft. Halsey", coverUrl: "https://i.ytimg.com/vi/0zGcUoRlhmw/hqdefault.jpg"`
  },
  // 8. Sweet Child O' Mine by Guns N' Roses
  {
    target: /\{\s*id:\s*['"]ytm-1w7OgIMMRc4['"],\s*title:\s*['"]Sweet Child O' Mine['"],\s*artist:\s*['"]Guns N' Roses['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-1w7OgIMMRc4", title: "Sweet Child O' Mine", artist: "Guns N' Roses", coverUrl: "https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg"`
  },
  // 9. Lean On by Major Lazer
  {
    target: /\{\s*id:\s*['"]ytm-YqeW9_5kURI['"],\s*title:\s*['"]Lean On['"],\s*artist:\s*['"]Major Lazer & DJ Snake['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-YqeW9_5kURI", title: "Lean On", artist: "Major Lazer & DJ Snake", coverUrl: "https://i.ytimg.com/vi/YqeW9_5kURI/hqdefault.jpg"`
  },
  // 10. Yellow by Coldplay
  {
    target: /\{\s*id:\s*['"]ytm-yKNxeF4KMsY['"],\s*title:\s*['"]Yellow['"],\s*artist:\s*['"]Coldplay['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music115\/v4\/52\/aa\/85\/52aa851f-15b7-6322-f91f-df84b15b7b19\/190295978044\.jpg\/600x600bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/52/aa/85/52aa851f-15b7-6322-f91f-df84b15b7b19/190295978044.jpg/600x600bb.jpg', 'https://i.ytimg.com/vi/yKNxeF4KMsY/hqdefault.jpg')
  },
  // 11. Pehle Bhi Main in Lang:1
  {
    target: /\{\s*id:\s*['"]ytm-t5MlnGOKGDI['"],\s*title:\s*['"]Pehle Bhi Main['"],\s*artist:\s*['"]Vishal Mishra['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music126\/v4\/db\/ad\/5e\/dbad5e8b-0bee-d962-92d4-021cbb89cf04\/196871584252\.jpg\/1000x1000bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/db/ad/5e/dbad5e8b-0bee-d962-92d4-021cbb89cf04/196871584252.jpg/1000x1000bb.jpg', 'https://i.ytimg.com/vi/t5MlnGOKGDI/hqdefault.jpg')
  },
  // 12. Sairat Zaala Ji in Lang:7
  {
    target: /\{\s*id:\s*['"]ytm-Oq8j5Qz9Q6U['"],\s*title:\s*['"]Sairat Zaala Ji['"],\s*artist:\s*['"]Chinmayi Sripaada['"],\s*coverUrl:\s*['"]https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/Music211\/v4\/c7\/42\/27\/c742279a-586b-976a-df12-659f8a37912a\/8902894358897_cover\.jpg\/1000x1000bb\.jpg['"]/g,
    replace: (match) => match.replace('https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/c7/42/27/c742279a-586b-976a-df12-659f8a37912a/8902894358897_cover.jpg/1000x1000bb.jpg', 'https://i.ytimg.com/vi/Oq8j5Qz9Q6U/hqdefault.jpg')
  },
  // 13. Interstellar & Spider-Verse tracks in MOVIE_PLAYLISTS
  {
    target: /\{\s*id:\s*['"]ytm-m3zvVGJrTP8['"],\s*ytId:\s*['"]m3zvVGJrTP8['"],\s*title:\s*['"]No Time For Caution['"],\s*artist:\s*['"]Hans Zimmer['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-m3zvVGJrTP8", ytId: "m3zvVGJrTP8", title: "No Time For Caution", artist: "Hans Zimmer", coverUrl: "https://i.ytimg.com/vi/m3zvVGJrTP8/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-RxabLA7UQ9k['"],\s*ytId:\s*['"]RxabLA7UQ9k['"],\s*title:\s*['"]Time \(Inception\)['"],\s*artist:\s*['"]Hans Zimmer['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-RxabLA7UQ9k", ytId: "RxabLA7UQ9k", title: "Time (Inception)", artist: "Hans Zimmer", coverUrl: "https://i.ytimg.com/vi/RxabLA7UQ9k/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-N4b4qUp8Sqw['"],\s*ytId:\s*['"]N4b4qUp8Sqw['"],\s*title:\s*['"]S\.T\.A\.Y\.['"],\s*artist:\s*['"]Hans Zimmer['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-N4b4qUp8Sqw", ytId: "N4b4qUp8Sqw", title: "S.T.A.Y.", artist: "Hans Zimmer", coverUrl: "https://i.ytimg.com/vi/N4b4qUp8Sqw/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-qC4BvA_1Wk0['"],\s*ytId:\s*['"]qC4BvA_1Wk0['"],\s*title:\s*['"]Day One['"],\s*artist:\s*['"]Hans Zimmer['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-qC4BvA_1Wk0", ytId: "qC4BvA_1Wk0", title: "Day One", artist: "Hans Zimmer", coverUrl: "https://i.ytimg.com/vi/qC4BvA_1Wk0/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-o_Ay_iDRAbc['"],\s*ytId:\s*['"]o_Ay_iDRAbc['"],\s*title:\s*['"]Mountains['"],\s*artist:\s*['"]Hans Zimmer['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-o_Ay_iDRAbc", ytId: "o_Ay_iDRAbc", title: "Mountains", artist: "Hans Zimmer", coverUrl: "https://i.ytimg.com/vi/o_Ay_iDRAbc/hqdefault.jpg"`
  },
  // Spider-Verse
  {
    target: /\{\s*id:\s*['"]ytm-r838F5F-iYg['"],\s*ytId:\s*['"]r838F5F-iYg['"],\s*title:\s*['"]Am I Dreaming['"],\s*artist:\s*['"]Metro Boomin, A\$AP Rocky, Roisee['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-r838F5F-iYg", ytId: "r838F5F-iYg", title: "Am I Dreaming", artist: "Metro Boomin, A$AP Rocky, Roisee", coverUrl: "https://i.ytimg.com/vi/r838F5F-iYg/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-t8T7hI6v_20['"],\s*ytId:\s*['"]t8T7hI6v_20['"],\s*title:\s*['"]Calling['"],\s*artist:\s*['"]Metro Boomin, Swae Lee, NAV['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-t8T7hI6v_20", ytId: "t8T7hI6v_20", title: "Calling", artist: "Metro Boomin, Swae Lee, NAV", coverUrl: "https://i.ytimg.com/vi/t8T7hI6v_20/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-N_GfT-k41_E['"],\s*ytId:\s*['"]N_GfT-k41_E['"],\s*title:\s*['"]Self Love['"],\s*artist:\s*['"]Metro Boomin, Coi Leray['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-N_GfT-k41_E", ytId: "N_GfT-k41_E", title: "Self Love", artist: "Metro Boomin, Coi Leray", coverUrl: "https://i.ytimg.com/vi/N_GfT-k41_E/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-O_3U5x4G9fM['"],\s*ytId:\s*['"]O_3U5x4G9fM['"],\s*title:\s*['"]Annihilate['"],\s*artist:\s*['"]Metro Boomin, Swae Lee, Lil Wayne['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-O_3U5x4G9fM", ytId: "O_3U5x4G9fM", title: "Annihilate", artist: "Metro Boomin, Swae Lee, Lil Wayne", coverUrl: "https://i.ytimg.com/vi/O_3U5x4G9fM/hqdefault.jpg"`
  },
  {
    target: /\{\s*id:\s*['"]ytm-wR7wWc93T24['"],\s*ytId:\s*['"]wR7wWc93T24['"],\s*title:\s*['"]Mona Lisa['"],\s*artist:\s*['"]Dominic Fike['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-wR7wWc93T24", ytId: "wR7wWc93T24", title: "Mona Lisa", artist: "Dominic Fike", coverUrl: "https://i.ytimg.com/vi/wR7wWc93T24/hqdefault.jpg"`
  },
  // 14. Leo Naa Ready ytId and cover
  {
    target: /\{\s*id:\s*['"]ytm-szvt1vD0Uug['"],\s*ytId:\s*['"]szvt1vD0Uug['"],\s*title:\s*['"]Naa Ready['"],\s*artist:\s*['"]Thalapathy Vijay, Anirudh['"],\s*coverUrl:\s*['"][^'"]+['"]/g,
    replace: `{ id: "ytm-0a61Q20a_9E", ytId: "0a61Q20a_9E", title: "Naa Ready", artist: "Thalapathy Vijay, Anirudh", coverUrl: "https://i.ytimg.com/vi/0a61Q20a_9E/hqdefault.jpg"`
  }
];

let applied = 0;
fixes.forEach(f => {
  const before = content;
  content = content.replace(f.target, f.replace);
  if (content !== before) applied++;
});

console.log(`Applied ${applied} out of ${fixes.length} track cover fixes!`);
fs.writeFileSync('src/catalogService.js', content, 'utf8');
