// Test runtime execution of bundled assets
const fs = require('fs');
const path = require('path');

console.log("Checking index.html in docs and dist...");
const docsHtml = fs.readFileSync('docs/index.html', 'utf-8');
const distHtml = fs.readFileSync('dist/index.html', 'utf-8');

// Find asset JS file
const match = docsHtml.match(/src=["']\.\/assets\/(index-[^"']+\.js)["']/);
if (match) {
    const jsFile = path.join('docs', 'assets', match[1]);
    console.log("Found JS bundle:", jsFile);
    if (fs.existsSync(jsFile)) {
        const content = fs.readFileSync(jsFile, 'utf-8');
        console.log("JS bundle size:", content.length, "bytes");
    } else {
        console.error("ERROR: JS bundle does not exist at:", jsFile);
    }
} else {
    console.error("ERROR: No bundled JS file referenced in docs/index.html!");
}
