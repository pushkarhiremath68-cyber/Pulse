import fs from 'fs';
import { ARTIST_DATABASE } from '../src/catalogService.js';

const krishnaDas = {
  id: "krishna-das",
  name: "Krishna Das",
  monthlyListeners: "1,450,000",
  followersCount: "920,000",
  worldRank: "#1 Global Kirtan & Sacred Chant Master",
  origin: "Long Island, New York, USA / Kainchi Dham, Uttarakhand, India",
  bio: "Krishna Das is an internationally acclaimed American spiritual chant master, vocalist, and Grammy-nominated devotional artist. Widely revered as the 'Rockstar of Yoga', he was a direct disciple of the legendary Indian saint Neem Karoli Baba (Maharaj-ji). His deeply resonant baritone voice has introduced traditional Hindu kirtan, the Hanuman Chalisa, and ancient sacred Sanskrit mantras to millions of spiritual seekers worldwide.",
  banner: "https://cdn-images.dzcdn.net/images/artist/a1558ef5e7dffee5714fe6097576ac6c/1000x1000-000000-80-0-0.jpg",
  avatar: "https://cdn-images.dzcdn.net/images/artist/a1558ef5e7dffee5714fe6097576ac6c/1000x1000-000000-80-0-0.jpg",
  socials: {
    instagram: "https://www.instagram.com/krishnadasmusic/",
    x: "https://x.com/krishnadas",
    facebook: "https://www.facebook.com/KrishnaDasMusic/",
    youtube: "https://www.youtube.com/@KrishnaDasMusic"
  },
  tourInfo: {
    tourName: "Krishna Das Sacred Chants & Kirtan World Tour 2026",
    status: "Tickets Live",
    dates: "New York, Rishikesh, London, Los Angeles, Maui",
    ticketUrl: "https://www.krishnadas.com/tour/"
  },
  topTracks: [
    {
      id: "ytm-3WrImrl2dmI",
      ytId: "3WrImrl2dmI",
      title: "Hanuman Chalisa",
      artist: "Krishna Das",
      album: "Live on Earth",
      coverUrl: "https://i.ytimg.com/vi/3WrImrl2dmI/hqdefault.jpg",
      duration: 586,
      plays: "48,500,000"
    },
    {
      id: "ytm-ZdjEgaND0n8",
      ytId: "ZdjEgaND0n8",
      title: "Baba Hanuman",
      artist: "Krishna Das",
      album: "Live on Earth",
      coverUrl: "https://i.ytimg.com/vi/ZdjEgaND0n8/hqdefault.jpg",
      duration: 524,
      plays: "32,100,000"
    },
    {
      id: "ytm-JQeCetQmopQ",
      ytId: "JQeCetQmopQ",
      title: "Radhe Shyam",
      artist: "Krishna Das",
      album: "One Track Heart",
      coverUrl: "https://i.ytimg.com/vi/JQeCetQmopQ/hqdefault.jpg",
      duration: 482,
      plays: "27,400,000"
    },
    {
      id: "ytm-PTc8X37oJBE",
      ytId: "PTc8X37oJBE",
      title: "Om Namah Shivaya",
      artist: "Krishna Das",
      album: "Breath of the Heart",
      coverUrl: "https://i.ytimg.com/vi/PTc8X37oJBE/hqdefault.jpg",
      duration: 570,
      plays: "29,800,000"
    },
    {
      id: "ytm-RGighCH7i4Y",
      ytId: "RGighCH7i4Y",
      title: "Sri Ram Jai Ram",
      artist: "Krishna Das",
      album: "Live on Earth",
      coverUrl: "https://i.ytimg.com/vi/RGighCH7i4Y/hqdefault.jpg",
      duration: 448,
      plays: "18,900,000"
    },
    {
      id: "ytm-husGDaTbYkk",
      ytId: "husGDaTbYkk",
      title: "Hara Hara Mahadeva",
      artist: "Krishna Das",
      album: "Live on Earth",
      coverUrl: "https://i.ytimg.com/vi/husGDaTbYkk/hqdefault.jpg",
      duration: 412,
      plays: "16,200,000"
    },
    {
      id: "ytm-0qc0jXs_brU",
      ytId: "0qc0jXs_brU",
      title: "Mere Gurudev",
      artist: "Krishna Das",
      album: "Door of Faith",
      coverUrl: "https://i.ytimg.com/vi/0qc0jXs_brU/hqdefault.jpg",
      duration: 498,
      plays: "21,600,000"
    },
    {
      id: "ytm-c3K1BWeIZyo",
      ytId: "c3K1BWeIZyo",
      title: "Sita Ram",
      artist: "Krishna Das",
      album: "Live on Earth",
      coverUrl: "https://i.ytimg.com/vi/c3K1BWeIZyo/hqdefault.jpg",
      duration: 420,
      plays: "19,300,000"
    },
    {
      id: "ytm-fGDLNvEyUyI",
      ytId: "fGDLNvEyUyI",
      title: "Govinda Hare",
      artist: "Krishna Das",
      album: "Breath of the Heart",
      coverUrl: "https://i.ytimg.com/vi/fGDLNvEyUyI/hqdefault.jpg",
      duration: 465,
      plays: "14,800,000"
    },
    {
      id: "ytm-QRuNUqS2hT8",
      ytId: "QRuNUqS2hT8",
      title: "Jaya Bhagavan",
      artist: "Krishna Das",
      album: "Pilgrim Heart",
      coverUrl: "https://i.ytimg.com/vi/QRuNUqS2hT8/hqdefault.jpg",
      duration: 510,
      plays: "12,400,000"
    }
  ]
};

const updatedDatabase = JSON.parse(JSON.stringify(ARTIST_DATABASE));
updatedDatabase['krishna-das'] = krishnaDas;

const catPath = './src/catalogService.js';
let src = fs.readFileSync(catPath, 'utf8');

// Replace ARTIST_DATABASE in src
const lines = src.split('\n');
const startIdx = lines.findIndex(l => l.trim() === 'export const ARTIST_DATABASE = {');
let endIdx = -1;
for (let i = startIdx + 1; i < lines.length; i++) {
  if (lines[i].trim() === '};' && lines.slice(i, i + 5).some(l => l.includes('SIMILAR_ARTIST_MAP'))) {
    endIdx = i;
    break;
  }
}

if (startIdx === -1 || endIdx === -1) {
  throw new Error(`Boundary markers not found: startIdx=${startIdx}, endIdx=${endIdx}`);
}

const before = lines.slice(0, startIdx).join('\n');
const after = lines.slice(endIdx + 1).join('\n');
const newDbStr = `export const ARTIST_DATABASE = ${JSON.stringify(updatedDatabase, null, 2)};`;

src = `${before}\n${newDbStr}\n${after}`;

// Add alias in getArtistDetails foundKey matching
const aliasTarget = "else if (normalized.includes('jagjit')) foundKey = 'jagjit-singh';";
const aliasReplacement = `else if (normalized.includes('krishna das') || (normalized.includes('krishna') && normalized.includes('das'))) foundKey = 'krishna-das';\n    ${aliasTarget}`;
src = src.replace(aliasTarget, aliasReplacement);

// Add to SIMILAR_ARTIST_MAP
const similarTarget = '"jagjit-singh": [';
const similarReplacement = `"krishna-das": [\n    "appaji",\n    "jagjit-singh",\n    "kailash-kher",\n    "hariharan"\n  ],\n  ${similarTarget}`;
src = src.replace(similarTarget, similarReplacement);

fs.writeFileSync(catPath, src, 'utf8');
console.log('Successfully added Krishna Das to ARTIST_DATABASE and catalogService.js!');
