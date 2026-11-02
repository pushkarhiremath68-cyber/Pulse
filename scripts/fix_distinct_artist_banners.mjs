import fs from 'fs';

let catalog = fs.readFileSync('src/catalogService.js', 'utf8');

const updates = {
  "beyonce": {
    banner: "https://i.ytimg.com/vi/238Z4YaBd-Y/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/238Z4YaBd-Y/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/238Z4YaBd-Y/hqdefault.jpg"
  },
  "prateek-kuhad": {
    banner: "https://i.ytimg.com/vi/Il7Nv270zNk/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/Il7Nv270zNk/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/Il7Nv270zNk/hqdefault.jpg"
  },
  "pritam": {
    banner: "https://i.ytimg.com/vi/BddP6PYo2gs/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg"
  },
  "darshan-raval": {
    banner: "https://i.ytimg.com/vi/k9iX_99lI4s/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/k9iX_99lI4s/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/k9iX_99lI4s/hqdefault.jpg"
  },
  "shawn-mendes": {
    banner: "https://i.ytimg.com/vi/Pkh8UtuejGw/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/Pkh8UtuejGw/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/Pkh8UtuejGw/hqdefault.jpg"
  },
  "anuv-jain": {
    banner: "https://i.ytimg.com/vi/gQL9V4fsN_c/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/gQL9V4fsN_c/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/gQL9V4fsN_c/hqdefault.jpg"
  },
  "shakira": {
    banner: "https://i.ytimg.com/vi/pRpeEdMmmQ0/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/pRpeEdMmmQ0/hqdefault.jpg"
  },
  "mohit-chauhan": {
    banner: "https://i.ytimg.com/vi/ttKphvupYFw/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/ttKphvupYFw/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/ttKphvupYFw/hqdefault.jpg"
  },
  "lata-mangeshkar": {
    banner: "https://i.ytimg.com/vi/TFr6G5zveS8/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/TFr6G5zveS8/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/TFr6G5zveS8/hqdefault.jpg"
  },
  "ar-rahman": {
    banner: "https://i.ytimg.com/vi/Yc5OyXmHD0w/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/Yc5OyXmHD0w/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/Yc5OyXmHD0w/hqdefault.jpg"
  },
  "nusrat-fateh-ali-khan": {
    banner: "https://i.ytimg.com/vi/h9wB5t12oK0/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/h9wB5t12oK0/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/h9wB5t12oK0/hqdefault.jpg"
  },
  "rahat-fateh-ali-khan": {
    banner: "https://i.ytimg.com/vi/kw4tT7SCmaY/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg"
  },
  "kk": {
    banner: "https://i.ytimg.com/vi/8g2e-m6910U/maxresdefault.jpg",
    avatar: "https://i.ytimg.com/vi/8g2e-m6910U/hqdefault.jpg",
    firstSongCover: "https://i.ytimg.com/vi/8g2e-m6910U/hqdefault.jpg"
  }
};

for (const [key, data] of Object.entries(updates)) {
  const artistBlockRegex = new RegExp(`"${key}":\\s*\\{[\\s\\S]*?"banner":\\s*"([^"]+)",[\\s\\S]*?"avatar":\\s*"([^"]+)",`);
  const match = catalog.match(artistBlockRegex);
  if (match) {
    const fullMatch = match[0];
    const updated = fullMatch
      .replace(/"banner":\s*"[^"]+"/, `"banner": "${data.banner}"`)
      .replace(/"avatar":\s*"[^"]+"/, `"avatar": "${data.avatar}"`);
    catalog = catalog.replace(fullMatch, updated);
    console.log(`Updated banner & avatar for: ${key}`);
  } else {
    console.warn(`Could not find block for: ${key}`);
  }
}

fs.writeFileSync('src/catalogService.js', catalog, 'utf8');
console.log('Finished updating distinct artist banners!');

