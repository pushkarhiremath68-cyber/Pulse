import { getFeaturedArtists, getArtistDetails } from '../src/catalogService.js';

console.log('--- FEATURED ARTISTS AVATARS ---');
const featured = getFeaturedArtists();
const avatarMap = new Map();
featured.forEach(a => {
  console.log(`Artist: "${a.name}"`);
  console.log(`  Avatar: ${a.avatar}`);
  if (!avatarMap.has(a.avatar)) avatarMap.set(a.avatar, []);
  avatarMap.get(a.avatar).push(a.name);
});

console.log('\n--- CHECKING DUPLICATE AVATARS IN FEATURED ARTISTS ---');
avatarMap.forEach((names, url) => {
  if (names.length > 1) {
    console.log(`DUPLICATE AVATAR for ${names.join(', ')}:\n  ${url}`);
  }
});

console.log('\n--- CHECKING ARTISTS IN DB ---');
const testArtists = [
  "Arijit Singh", "Atif Aslam", "AP Dhillon", "Diljit Dosanjh",
  "The Weeknd", "Taylor Swift", "Billie Eilish", "Sabrina Carpenter",
  "Hasan Raheem", "Kaifi Khalil", "Ali Sethi", "Appaji",
  "Coldplay", "Eminem", "Ed Sheeran", "Anirudh Ravichander",
  "Imagine Dragons", "Bruno Mars", "Adele", "Linkin Park",
  "Dua Lipa", "Bad Bunny"
];

const dbPhotoMap = new Map();
testArtists.forEach(name => {
  const details = getArtistDetails(name);
  console.log(`Artist: "${details.name}"`);
  console.log(`  Banner: ${details.banner}`);
  console.log(`  Avatar: ${details.avatar}`);
  if (!dbPhotoMap.has(details.banner)) dbPhotoMap.set(details.banner, []);
  dbPhotoMap.get(details.banner).push(details.name);
});

console.log('\n--- CHECKING DUPLICATE BANNERS IN DB ---');
dbPhotoMap.forEach((names, url) => {
  if (names.length > 1) {
    console.log(`DUPLICATE BANNER for ${names.join(', ')}:\n  ${url}`);
  }
});
