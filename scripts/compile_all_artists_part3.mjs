import fs from 'fs';
import { createArtist } from './mega_artists_data.mjs';

const EXISTING_MERGED = JSON.parse(fs.readFileSync('scripts/merged_artist_db.json', 'utf8'));
const MORE = {};

// 32. Shawn Mendes
MORE['shawn-mendes'] = createArtist({
  name: "Shawn Mendes",
  listeners: "48,200,000",
  followersCount: "42,100,000",
  rank: "#9 in Global Acoustic Pop",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg",
  bio: "Shawn Peter Raul Mendes is a Canadian singer-songwriter who rose from acoustic Vine covers to global arena stardom. With four Billboard 200 #1 albums and multi-platinum smashes like 'Señorita', 'Treat You Better', and 'Stitches', Mendes is celebrated for earnest lyricism, soulful pop-rock arrangements, and world stadium tours.",
  instagram: "shawnmendes",
  x: "ShawnMendes",
  facebook: "ShawnMendesOfficial",
  youtube: "ShawnMendesOfficial",
  tourName: "Wonder World Stadium Tour",
  tourDates: "Toronto, New York, London, Paris",
  topTracks: [
    { title: "Señorita (with Camila Cabello)", album: "Shawn Mendes (Deluxe)", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "Pkh8UtuejGw", duration: 190 },
    { title: "Treat You Better", album: "Illuminate", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "lY2yjAdbvdQ", duration: 187 },
    { title: "Stitches", album: "Handwritten", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "VbfpW0pbvaU", duration: 206 },
    { title: "There's Nothing Holdin' Me Back", album: "Illuminate", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "dT2owtxkU8k", duration: 199 },
    { title: "In My Blood", album: "Shawn Mendes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "36tggrpRoTI", duration: 211 },
    { title: "Mercy", album: "Illuminate", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "KkGVmN68ByU", duration: 208 },
    { title: "It'll Be Okay", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 222 },
    { title: "Lost In Japan", album: "Shawn Mendes", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 201 },
    { title: "Monster (with Justin Bieber)", album: "Wonder", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "MPbUaIZAaeA", duration: 178 },
    { title: "Wonder", album: "Wonder", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/1000x1000bb.jpg", ytId: "fHeQemJJQII", duration: 172 }
  ]
});

// 33. Rihanna
MORE['rihanna'] = createArtist({
  name: "Rihanna",
  listeners: "79,400,000",
  followersCount: "88,200,000",
  rank: "#5 Worldwide",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg",
  bio: "Robyn Rihanna Fenty is a Barbadian singer, businesswoman, and global icon who holds 14 Billboard Hot 100 number-one singles (the third-most in history) and nine Grammy Awards. Known for her chameleon-like reinvention and unmistakable Caribbean swagger, her critically acclaimed masterpiece Anti and record-breaking Super Bowl LVII Halftime show cemented her eternal cultural immortality.",
  instagram: "badgalriri",
  x: "rihanna",
  facebook: "rihanna",
  youtube: "RihannaVEVO",
  tourName: "Anti World Stadium Tour Retrospective",
  tourDates: "Bridgetown, Los Angeles, London, Paris",
  topTracks: [
    { title: "Diamonds", album: "Unapologetic", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "lWA2pjMjpBs", duration: 225 },
    { title: "Umbrella (feat. JAY-Z)", album: "Good Girl Gone Bad", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "CvBfHwUxHIk", duration: 275 },
    { title: "We Found Love (feat. Calvin Harris)", album: "Talk That Talk", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "tg00YEETFzg", duration: 215 },
    { title: "Work (feat. Drake)", album: "Anti", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "HL1UzIK-flA", duration: 219 },
    { title: "Stay (feat. Mikky Ekko)", album: "Unapologetic", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "JF8BRvqGCNs", duration: 240 },
    { title: "Only Girl (In the World)", album: "Loud", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "pa14VNsdSYM", duration: 235 },
    { title: "Love on the Brain", album: "Anti", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "0RyInjfgNc4", duration: 224 },
    { title: "Lift Me Up", album: "Black Panther: Wakanda Forever", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "Mx_OexsUI2M", duration: 196 },
    { title: "Don't Stop The Music", album: "Good Girl Gone Bad", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "yd8jh9QYfEs", duration: 267 },
    { title: "Needed Me", album: "Anti", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/1000x1000bb.jpg", ytId: "wfN4PVaOU5Q", duration: 191 }
  ]
});

// 34. Beyoncé
MORE['beyonce'] = createArtist({
  name: "Beyoncé",
  listeners: "68,400,000",
  followersCount: "78,500,000",
  rank: "#1 Most Awarded Artist in Grammy History",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg",
  bio: "Beyoncé Giselle Knowles-Carter is an American singer, songwriter, and cultural matriarch recognized as one of the greatest performers of all time. With 32 Grammy Awards (the most of any individual in history), her genre-redefining cultural works—from Lemonade and Renaissance to Cowboy Carter—have shattered boundaries across R&B, pop, dance, and country.",
  instagram: "beyonce",
  x: "Beyonce",
  facebook: "beyonce",
  youtube: "Beyonce",
  tourName: "Renaissance World Stadium Tour",
  tourDates: "Houston, Atlanta, London, Paris, Stockholm",
  topTracks: [
    { title: "TEXAS HOLD 'EM", album: "COWBOY CARTER", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "238Z4YaAr1g", duration: 233 },
    { title: "Halo", album: "I Am... Sasha Fierce", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "bnVUHWCynig", duration: 224 },
    { title: "Crazy In Love (feat. JAY-Z)", album: "Dangerously in Love", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "ViwtNLUqkMY", duration: 236 },
    { title: "CUFF IT", album: "RENAISSANCE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "yDde5JvF_rI", duration: 225 },
    { title: "Single Ladies (Put a Ring on It)", album: "I Am... Sasha Fierce", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "4m1EFMoRFvY", duration: 193 },
    { title: "BREAK MY SOUL", album: "RENAISSANCE", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "yjki-9Pth4I", duration: 278 },
    { title: "Love On Top", album: "4", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "Ob7vObnFUJc", duration: 267 },
    { title: "Formation", album: "Lemonade", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "WDZJPJV__bQ", duration: 206 },
    { title: "Drunk in Love (feat. JAY-Z)", album: "BEYONCÉ", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "p1JPKLa-Ofc", duration: 323 },
    { title: "II MOST WANTED (with Miley Cyrus)", album: "COWBOY CARTER", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2a/aa/b4/2aaab42a-a4cb-a600-4a25-d78961495960/18UMGIM17204.rgb.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 208 }
  ]
});

// 35. Shakira
MORE['shakira'] = createArtist({
  name: "Shakira",
  listeners: "64,200,000",
  followersCount: "58,400,000",
  rank: "#1 Queen of Latin Music",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg",
  bio: "Shakira Isabel Mebarak Ripoll is a Colombian singer, songwriter, and multi-instrumentalist hailed globally as the 'Queen of Latin Music'. Renowned for signature belly-dance choreography and infectious crossover hits like 'Hips Don't Lie' and the FIFA World Cup anthem 'Waka Waka', she holds three Grammy Awards and over 95 million album sales worldwide.",
  instagram: "shakira",
  x: "shakira",
  facebook: "shakira",
  youtube: "shakira",
  tourName: "Las Mujeres Ya No Lloran World Tour",
  tourDates: "Bogotá, Miami, Los Angeles, Madrid, Buenos Aires",
  topTracks: [
    { title: "Hips Don't Lie (feat. Wyclef Jean)", album: "Oral Fixation, Vol. 2", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "DUT5rEU6pqM", duration: 218 },
    { title: "Waka Waka (This Time for Africa)", album: "Sale el Sol", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "pRpeEdMmmQ0", duration: 202 },
    { title: "Whenever, Wherever", album: "Laundry Service", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "weRHy87uQ58", duration: 196 },
    { title: "BZRP Music Sessions, Vol. 53", album: "Singles", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "CocEMWdc7Ck", duration: 213 },
    { title: "La Tortura (feat. Alejandro Sanz)", album: "Fijación Oral, Vol. 1", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "Dsp_8Lm1eSk", duration: 213 },
    { title: "Loca (feat. Dizzee Rascal)", album: "Sale el Sol", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "K1p8qX2m9x0", duration: 193 },
    { title: "Chantaje (feat. Maluma)", album: "El Dorado", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "6MgqjaijEqI", duration: 195 },
    { title: "She Wolf", album: "She Wolf", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "booKpA4bWpM", duration: 188 },
    { title: "PUNTERÍA (with Cardi B)", album: "Las Mujeres Ya No Lloran", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 181 },
    { title: "Underneath Your Clothes", album: "Laundry Service", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/64/70/1c/64701cff-71ed-912f-ce62-71d409f5e6ad/195497640560.jpg/1000x1000bb.jpg", ytId: "bpOSxM0TFez", duration: 225 }
  ]
});

// 36. ZAYN
MORE['zayn'] = createArtist({
  name: "ZAYN",
  listeners: "38,500,000",
  followersCount: "35,100,000",
  rank: "#2 in Alt R&B / Soul",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg",
  bio: "Zayn Javadd Malik, known mononymously as ZAYN, is an English singer and songwriter acclaimed for his silky falsetto, genre-blurring R&B production, and soulful artistic introspection. With his global debut solo single 'PILLOWTALK', he became the first British male artist to debut at number one on both the US and UK charts simultaneously.",
  instagram: "zayn",
  x: "zaynmalik",
  facebook: "zayn",
  youtube: "Zayn",
  tourName: "Stairway to the Sky Live Tour 2026",
  tourDates: "London, Las Vegas, New York, Tokyo",
  topTracks: [
    { title: "PILLOWTALK", album: "Mind of Mine", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "C_3d6GntKbk", duration: 202 },
    { title: "Dusk Till Dawn (feat. Sia)", album: "Icarus Falls", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "tt2k8PGm-TI", duration: 239 },
    { title: "I Don't Wanna Live Forever (with Taylor Swift)", album: "Fifty Shades Darker", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "7F37r50VUTQ", duration: 245 },
    { title: "A Whole New World (with Zhavia Ward)", album: "Aladdin", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "rg_zwK_sLEY", duration: 242 },
    { title: "LIKE I WOULD", album: "Mind of Mine", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "pTazn4h6wEQ", duration: 192 },
    { title: "Vibez", album: "Nobody Is Listening", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "VSpgaN3HNQQ", duration: 163 },
    { title: "Alienated", album: "ROOM UNDER THE STAIRS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 248 },
    { title: "What I Am", album: "ROOM UNDER THE STAIRS", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 211 },
    { title: "Let Me", album: "Icarus Falls", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "J-dv_DcDD_A", duration: 185 },
    { title: "iT's YoU", album: "Mind of Mine", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/1000x1000bb.jpg", ytId: "u_P8q4L1w9c", duration: 226 }
  ]
});

// 37. Mohit Chauhan
MORE['mohit-chauhan'] = createArtist({
  name: "Mohit Chauhan",
  listeners: "24,100,000",
  followersCount: "18,400,000",
  rank: "#1 Indian Folk-Rock & Acoustic Icon",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg",
  bio: "Mohit Chauhan is an acclaimed Indian singer, composer, and two-time Filmfare Award winner whose earthy, soulful mountain tone breathed life into the legendary soundtrack of Imtiaz Ali's Rockstar. From founding the 90s indie-pop band Silk Route to voicing timeless road-trip anthems, Chauhan's acoustic folk-rock magic remains peerless.",
  instagram: "mohitchauhanofficial",
  x: "_MohitChauhan",
  facebook: "MohitChauhanOfficial",
  youtube: "MohitChauhanOfficial",
  tourName: "Rockstar Acoustic Symphony Tour",
  tourDates: "Shimla, Delhi, Mumbai, Bengaluru, London",
  topTracks: [
    { title: "Nadaan Parindey", album: "Rockstar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "ttKG4NqD_w4", duration: 384 },
    { title: "Tum Se Hi", album: "Jab We Met", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "cbTKYfN-w_M", duration: 323 },
    { title: "Kun Faya Kun", album: "Rockstar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "T94PHkuydcw", duration: 473 },
    { title: "Pee Loon", album: "Once Upon a Time in Mumbaai", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "ZgIeBq14F30", duration: 288 },
    { title: "Matargashti", album: "Tamasha", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "Vbh4p_W3V5s", duration: 328 },
    { title: "Ilahi", album: "Yeh Jawaani Hai Deewani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "fdubeMFwuGs", duration: 229 },
    { title: "Dooba Dooba", album: "Boondein (Silk Route)", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "d8IT-163M8U", duration: 295 },
    { title: "Masakali", album: "Delhi-6", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "yWJy_mS9b-I", duration: 334 },
    { title: "Jo Bhi Main", album: "Rockstar", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "72UVTUx551E", duration: 275 },
    { title: "Tujhe Bhula Diya", album: "Anjaana Anjaani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/eb/1b/38/eb1b3835-41fd-de2e-2550-4e9780fa6443/8902894623056_cover.jpg/1000x1000bb.jpg", ytId: "f4o9f8G6yXg", duration: 281 }
  ]
});

// 38. Pritam
MORE['pritam'] = createArtist({
  name: "Pritam",
  listeners: "45,800,000",
  followersCount: "31,200,000",
  rank: "#1 Bollywood Chart-Topping Composer",
  banner: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg",
  avatar: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg",
  bio: "Pritam Chakraborty, known simply as Pritam, is the undisputed architect of 21st-century Bollywood film music. Winner of multiple National Film Awards and six Filmfare Awards for Best Music Director, his timeless compositions across Yeh Jawaani Hai Deewani, Ae Dil Hai Mushkil, Jab We Met, Brahmastra, and Barfi! have shaped the musical subconscious of over a billion people.",
  instagram: "ipritamofficial",
  x: "ipritamofficial",
  facebook: "pritam.chakraborty",
  youtube: "PritamOfficial",
  tourName: "Pritam Jam Room Live Symphony",
  tourDates: "Mumbai, Delhi, London, Dubai, Toronto",
  topTracks: [
    { title: "Kesariya", album: "Brahmastra", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "BddP6PYo2gs", duration: 268 },
    { title: "Channa Mereya", album: "Ae Dil Hai Mushkil", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "284VoEWS_84", duration: 289 },
    { title: "Shayad", album: "Love Aaj Kal", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "y1Z_p8m9vIo", duration: 247 },
    { title: "Tum Se Hi", album: "Jab We Met", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "cbTKYfN-w_M", duration: 323 },
    { title: "Badtameez Dil", album: "Yeh Jawaani Hai Deewani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "II2EO3Nw4t0", duration: 252 },
    { title: "Ae Dil Hai Mushkil", album: "Ae Dil Hai Mushkil", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "6FURuLYrR_Q", duration: 269 },
    { title: "Ilahi", album: "Yeh Jawaani Hai Deewani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "fdubeMFwuGs", duration: 229 },
    { title: "Hawayein", album: "Jab Harry Met Sejal", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "cYOB941gymo", duration: 290 },
    { title: "Subhanallah", album: "Yeh Jawaani Hai Deewani", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "uO09wP8s8lM", duration: 249 },
    { title: "Raabta", album: "Agent Vinod", coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/1000x1000bb.jpg", ytId: "c2M_6rB1_gA", duration: 243 }
  ]
});

// Merge
const FULL_DB_3 = { ...EXISTING_MERGED, ...MORE };
console.log('Grand total curated artists (final):', Object.keys(FULL_DB_3).length);
fs.writeFileSync('scripts/merged_artist_db.json', JSON.stringify(FULL_DB_3, null, 2), 'utf8');
console.log('Final merged_artist_db.json updated!');

