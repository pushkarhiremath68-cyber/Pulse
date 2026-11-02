import fs from 'fs';

const mergedDb = JSON.parse(fs.readFileSync('scripts/merged_artist_db.json', 'utf8'));
let catalogContent = fs.readFileSync('src/catalogService.js', 'utf8');

// Find start and end of ARTIST_DATABASE in catalogService.js
const startAnchor = 'export const ARTIST_DATABASE = {';
const startIdx = catalogContent.indexOf(startAnchor);
if (startIdx === -1) {
  console.error('Could not find startAnchor');
  process.exit(1);
}

const endAnchor = '\nexport const SIMILAR_ARTIST_MAP = {';
const endIdx = catalogContent.indexOf(endAnchor, startIdx);
if (endIdx === -1) {
  console.error('Could not find endAnchor');
  process.exit(1);
}

// Generate the new ARTIST_DATABASE string
const newDbString = 'export const ARTIST_DATABASE = ' + JSON.stringify(mergedDb, null, 2) + ';';

// Update SIMILAR_ARTIST_MAP with curated pairings for new artists
const SIMILAR_MAP = {
  "arijit-singh": ["shreya-ghoshal", "atif-aslam"],
  "shreya-ghoshal": ["arijit-singh", "sonu-nigam"],
  "sonu-nigam": ["shreya-ghoshal", "kk"],
  "kk": ["mohit-chauhan", "sonu-nigam"],
  "sid-sriram": ["anirudh-ravichander", "arijit-singh"],
  "atif-aslam": ["arijit-singh", "rahat-fateh-ali-khan"],
  "ap-dhillon": ["diljit-dosanjh", "sidhu-moosewala"],
  "diljit-dosanjh": ["karan-aujla", "ap-dhillon"],
  "sidhu-moosewala": ["karan-aujla", "diljit-dosanjh"],
  "karan-aujla": ["sidhu-moosewala", "diljit-dosanjh"],
  "the-weeknd": ["bruno-mars", "dua-lipa"],
  "taylor-swift": ["sabrina-carpenter", "billie-eilish"],
  "billie-eilish": ["olivia-rodrigo", "taylor-swift"],
  "sabrina-carpenter": ["taylor-swift", "olivia-rodrigo"],
  "olivia-rodrigo": ["sabrina-carpenter", "billie-eilish"],
  "hasan-raheem": ["ali-sethi", "kaifi-khalil"],
  "kaifi-khalil": ["ali-sethi", "atif-aslam"],
  "ali-sethi": ["atif-aslam", "kaifi-khalil"],
  "appaji": ["arijit-singh", "lata-mangeshkar"],
  "coldplay": ["imagine-dragons", "linkin-park"],
  "eminem": ["drake", "kendrick-lamar"],
  "drake": ["kendrick-lamar", "travis-scott"],
  "kendrick-lamar": ["drake", "eminem"],
  "travis-scott": ["drake", "post-malone"],
  "post-malone": ["justin-bieber", "travis-scott"],
  "justin-bieber": ["charlie-puth", "shawn-mendes"],
  "shawn-mendes": ["justin-bieber", "charlie-puth"],
  "charlie-puth": ["shawn-mendes", "bruno-mars"],
  "ariana-grande": ["lady-gaga", "dua-lipa"],
  "lady-gaga": ["ariana-grande", "beyonce"],
  "rihanna": ["beyonce", "drake"],
  "beyonce": ["rihanna", "lady-gaga"],
  "shakira": ["bad-bunny", "rihanna"],
  "zayn": ["harry-styles", "the-weeknd"],
  "harry-styles": ["zayn", "shawn-mendes"],
  "bts": ["blackpink", "the-weeknd"],
  "blackpink": ["bts", "dua-lipa"],
  "ed-sheeran": ["coldplay", "taylor-swift"],
  "anirudh-ravichander": ["sid-sriram", "ar-rahman"],
  "ar-rahman": ["anirudh-ravichander", "pritam"],
  "pritam": ["arijit-singh", "ar-rahman"],
  "badshah": ["honey-singh", "karan-aujla"],
  "honey-singh": ["badshah", "diljit-dosanjh"],
  "neha-kakkar": ["sunidhi-chauhan", "shreya-ghoshal"],
  "sunidhi-chauhan": ["neha-kakkar", "shreya-ghoshal"],
  "jubin-nautiyal": ["arijit-singh", "darshan-raval"],
  "darshan-raval": ["jubin-nautiyal", "anuv-jain"],
  "anuv-jain": ["prateek-kuhad", "darshan-raval"],
  "prateek-kuhad": ["anuv-jain", "mohit-chauhan"],
  "mohit-chauhan": ["kk", "arijit-singh"],
  "nusrat-fateh-ali-khan": ["rahat-fateh-ali-khan", "atif-aslam"],
  "rahat-fateh-ali-khan": ["nusrat-fateh-ali-khan", "atif-aslam"],
  "kishore-kumar": ["mohammed-rafi", "lata-mangeshkar"],
  "lata-mangeshkar": ["kishore-kumar", "shreya-ghoshal"],
  "imagine-dragons": ["coldplay", "linkin-park"],
  "bruno-mars": ["the-weeknd", "ed-sheeran"],
  "adele": ["taylor-swift", "ed-sheeran"],
  "linkin-park": ["imagine-dragons", "coldplay"],
  "dua-lipa": ["the-weeknd", "taylor-swift"],
  "bad-bunny": ["the-weeknd", "shakira"]
};

const newSimilarMapString = 'export const SIMILAR_ARTIST_MAP = ' + JSON.stringify(SIMILAR_MAP, null, 2) + ';';

// Find end of SIMILAR_ARTIST_MAP
const samEndAnchor = '\nexport function getCuratedSimilarArtists';
const samEndIdx = catalogContent.indexOf(samEndAnchor, endIdx);
if (samEndIdx === -1) {
  console.error('Could not find samEndAnchor');
  process.exit(1);
}

// Rebuild content
catalogContent = catalogContent.slice(0, startIdx) + 
  newDbString + '\n\n' + 
  newSimilarMapString + '\n' + 
  catalogContent.slice(samEndIdx);

fs.writeFileSync('src/catalogService.js', catalogContent, 'utf8');
console.log('Successfully injected mega artist database into src/catalogService.js!');
