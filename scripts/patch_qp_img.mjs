import fs from 'fs';

let main = fs.readFileSync('src/main.js', 'utf8');

const oldQpImgRegex = /<img src="\$\{track\.coverUrl \|\| \(track\.ytId \? `https:\/\/i\.ytimg\.com\/vi\/\$\{track\.ytId\}\/hqdefault\.jpg` : '\.\/music-cover\.svg'\)\}" alt="\$\{escapeHtml\(track\.title\)\}" class="qp-thumb" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" loading="lazy" onerror="this\.onerror=null; this\.src='\.\/music-cover\.svg';">/;

const newQpImg = `<img src="\${track.coverUrl || track.cover || (track.ytId ? \`https://i.ytimg.com/vi/\${track.ytId}/hqdefault.jpg\` : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80')}" alt="\${escapeHtml(track.title)}" class="qp-thumb" style="width: 54px; height: 54px; border-radius: 8px; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';">`;

if (oldQpImgRegex.test(main)) {
  main = main.replace(oldQpImgRegex, newQpImg);
  fs.writeFileSync('src/main.js', main, 'utf8');
  console.log('Successfully updated Quick Picks image tag in main.js!');
} else {
  console.warn('Could not match oldQpImgRegex in main.js');
}

