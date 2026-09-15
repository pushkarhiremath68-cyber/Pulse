const fs = require('fs');
const path = require('path');

const replacementMap = {
  // Lady Gaga & Bruno Mars
  'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/1a/ff/f6/1afff69c-0979-37ea-630e-eefb92c431f2/24UMGIM92429.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/11/ae/f2/11aef294-f57c-bab9-c9fc-529162984e62/24UMGIM85348.rgb.jpg/600x600bb.jpg',
  
  // Sabrina Carpenter - Espresso
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/16/e0/a3/16e0a35a-ae18-f2b3-5778-98e3b526d113/24UMGIM41849.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/57/e8/7b/57e87ba0-5057-9bb9-c247-ce7dbe426e89/24UMGIM55213.rgb.jpg/600x600bb.jpg',
  
  // Billie Eilish - Birds of a Feather
  'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/33/c2/f7/33c2f7ff-5a9a-b44c-7832-68c3ef0545f9/24UMGIM39281.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/92/9f/69/929f69f1-9977-3a44-d674-11f70c852d1b/24UMGIM36186.rgb.jpg/600x600bb.jpg',
  
  // Billie Eilish - Bad Guy
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/80/7e/17/807e174a-2fa9-e932-a50d-d42f8832a829/19UMGIM08994.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/1a/37/d1/1a37d1b1-8508-54f2-f541-bf4e437dda76/19UMGIM05028.rgb.jpg/600x600bb.jpg',
  
  // Dua Lipa - Levitating
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/d5/8b/1a/d58b1a1a-a82f-8700-1c4b-3d9a1758f8b8/190295286101.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/600x600bb.jpg',
  
  // Bruno Mars - That's What I Like
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/b8/b5/8cb8b51d-93cb-9fb3-8321-df13a40498ec/075679904324.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/e3/47/a0/e347a0cc-87ce-5d05-d560-176c7d48f66e/075679904119.jpg/600x600bb.jpg',
  
  // Adele - Someone Like You & Rolling in the Deep
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4b/24/79/4b2479e0-8260-2ff0-6cf9-c3b6f86c2e39/886443208742.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/600x600bb.jpg',
  
  // Post Malone - Sunflower
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b8/6f/a6/b86fa644-8cb2-2051-ce63-ee65275e5f03/18UMGIM68512.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/4b/30/2c/4b302cb6-7a14-5464-4e97-0577e9d0be49/18UMGIM82277.rgb.jpg/600x600bb.jpg',
  
  // Eminem - Mockingbird
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/d5/d3/df/d5d3dfb5-b778-5ca8-0a0e-26f55447b9eb/00602498829449.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/e4/c9/9e/e4c99e72-f72f-d6c8-42f6-7037e8c400a8/00602577028427.rgb.jpg/600x600bb.jpg',
  
  // Eminem - Lose Yourself
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/21/df/b5/21dfb572-c2cb-0568-18e5-3d449339e160/00606949352723.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/08/23/fc/0823fcd9-cb44-695b-32bf-b3bf51d9f800/00606949351229.rgb.jpg/600x600bb.jpg',
  
  // Eminem - Without Me
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/31/54/6a/31546ac5-a0ee-6c3e-d90f-90e6378e4745/00606949329022.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/dd/5c/e6/dd5ce621-f7d2-f767-7a08-e7a7eaa7870b/00602537526994.rgb.jpg/600x600bb.jpg',
  
  // Eminem - Love The Way You Lie
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/38/c4/fa/38c4fa0d-fe3f-08e1-512c-15494d4d62b9/10UMGIM19659.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/95/a4/2c/95a42c0d-f3c8-c70d-3e3a-93cfa4a516d4/00602527394558.rgb.jpg/600x600bb.jpg',
  
  // Post Malone - Circles
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/0c/33/c7/0c33c7f9-6799-318e-49b0-9b48b7a66f0e/19UMGIM78942.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7b/1b/1b/7b1b1b0b-7ce2-b223-f9e0-8e36abe51877/19UMGIM78325.rgb.jpg/600x600bb.jpg',
  
  // Chainsmokers - Closer
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/05/2f/b4/052fb4aa-a82f-8700-1c4b-3d9a1758f8b8/886445989410.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/41/f8/38/41f8380b-9b56-d5d4-31f7-a6411c0c9aaa/886446102054.jpg/600x600bb.jpg',
  
  // Linkin Park - Numb
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/b8/6f/a6/b86fa644-8cb2-2051-ce63-ee65275e5f03/093624948988.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/13/44/05/134405bd-9e27-a678-8953-b5f724201f95/093624948988.jpg/600x600bb.jpg',
  
  // Coldplay - Viva La Vida
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/33/c2/79/33c27940-0255-a0d0-4bf6-0eb0393246eb/5099921211459.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/52/aa/85/52aa851f-15b7-6322-f91f-df84b15b7b19/190295978044.jpg/600x600bb.jpg',
  
  // Coldplay - Yellow
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/05/2f/b4/052fb4aa-a82f-8700-1c4b-3d9a1758f8b8/724352778358.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg',
  
  // Passenger - Let Her Go
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/71/df/b5/71dfb572-c2cb-0568-18e5-3d449339e160/886443425989.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/7e/28/9b7e2896-e049-1663-6791-e0111690ffc1/067003051361.png/600x600bb.jpg',
  
  // Coldplay - Fix You
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/4f/90/a6/4f90a6e0-24da-96ce-63d1-678fe01ad394/724347478652.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/0c/82/48/0c8248a8-4a5b-d30d-8056-f32d650d2fc9/190295978068.jpg/600x600bb.jpg',
  
  // Taylor Swift - Anti-Hero
  'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/f7/a9/b6/f7a9b6c0-671c-3083-d023-e5786b6a2245/22UMGIM95147.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/01/f2/3d01f2e5-5a08-835f-3d30-d031720b2b80/22UM1IM07364.rgb.jpg/600x600bb.jpg',
  
  // Taylor Swift - Love Story
  'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/43/40/e3/4340e340-9fe4-d193-c918-0a0ad058102a/00843930007134.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/c3/d0/1c/c3d01c88-73e7-187e-fd62-e1744de979a6/21UMGIM09915.rgb.jpg/600x600bb.jpg',
  
  // Imagine Dragons - Believer
  'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a4/09/cf/a409cf90-0d33-4318-7b96-7a718b52f1e6/17UMGIM86295.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/11/7a/b8/117ab805-6811-8929-18b9-0fad7baf0c25/17UMGIM98210.rgb.jpg/600x600bb.jpg',
  
  // Imagine Dragons - Demons
  'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/58/01/21/58012170-659f-dcf8-6617-64010372df3b/12UMGIM22363.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/1f/fa/09/1ffa092f-f52f-4a66-7d10-4cc5982dc747/12UMGIM46901.rgb.jpg/600x600bb.jpg',
  
  // Imagine Dragons - Bones
  'https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/3d/bf/9a/3dbf9a1f-fca1-dfeb-c42e-13c55d045d47/22UMGIM16413.rgb.jpg/1000x1000bb.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/33/87/c8/3387c827-adaa-681d-bd10-ce7d8e888b9c/22UMGIM21054.rgb.jpg/600x600bb.jpg',
  
  // Pakistani Songs
  'https://i.ytimg.com/vi/zydG_QW8m68/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/9f/44/a6/9f44a6ef-4438-1794-26ac-7f73d167afbf/artwork.jpg/600x600bb.jpg',
  
  'https://i.ytimg.com/vi/cM7_7_u0b3A/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/41/67/ad/4167ad0c-1dfd-6655-d62d-61d3059cdd10/7316476372880.jpg/600x600bb.jpg',
  
  'https://i.ytimg.com/vi/63Z-j3E5p_Y/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8b/05/74/8b057495-90b4-f039-0bfe-c0a839e940f1/5059713011204_cover.jpg/600x600bb.jpg',
  
  'https://i.ytimg.com/vi/4oJ3B8P_u4M/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/5d/8b/b8/5d8bb828-6871-0390-52b1-714a7ed0e38f/artwork.jpg/600x600bb.jpg',
  
  'https://i.ytimg.com/vi/e4Fz_1R5u9A/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/4f/e0/eb/4fe0eba3-8c2a-ef5c-b31f-a3c4d65c498d/artwork.jpg/600x600bb.jpg',
  
  'https://i.ytimg.com/vi/Q7wPzK5m91c/hqdefault.jpg':
    'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/27/41/48/27414810-2929-aa34-e145-000948a5c8b7/0602465586596.jpg/600x600bb.jpg'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let replacedCount = 0;
  for (const [oldUrl, newUrl] of Object.entries(replacementMap)) {
    if (content.includes(oldUrl)) {
      const regex = new RegExp(oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = content.match(regex);
      replacedCount += matches ? matches.length : 0;
      content = content.replace(regex, newUrl);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath}: replaced ${replacedCount} broken cover URLs.`);
}

processFile(path.resolve(__dirname, '../src/catalogService.js'));
processFile(path.resolve(__dirname, '../src/newReleasesService.js'));
