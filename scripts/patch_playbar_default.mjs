import fs from 'fs';

let content = fs.readFileSync('src/playbarController.js', 'utf8');

const oldResumeRegex = /export function resume\(\) \{[\r\n\s]+if \(!currentTrack\) return;/;
const newResume = `export function resume() {
  if (!currentTrack) {
    const anthem = {
      id: "hero-slide-1",
      ytId: "4NRXx6U8ABQ",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/1000x1000bb.jpg",
      duration: 200,
      source: "Studio Master Audio (YouTube)"
    };
    playTrack(anthem);
    return;
  }`;

if (oldResumeRegex.test(content)) {
  content = content.replace(oldResumeRegex, newResume);
  fs.writeFileSync('src/playbarController.js', content, 'utf8');
  console.log('Successfully updated playbar resume() default anthem handler!');
} else {
  console.warn('Could not match oldResumeRegex in playbarController.js');
}
