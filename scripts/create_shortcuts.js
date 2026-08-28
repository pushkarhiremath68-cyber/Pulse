import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const exePath = path.join(rootDir, 'dist', 'win-app', 'Pulse Music-win32-x64', 'Pulse Music.exe');
const iconPath = path.join(rootDir, 'public', 'icons', 'icon.ico');
const workingDir = path.join(rootDir, 'dist', 'win-app', 'Pulse Music-win32-x64');

if (!fs.existsSync(exePath)) {
  console.error(`Pulse Music.exe not found at: ${exePath}`);
  console.log('Please run "npm run dist:win" or electron-packager first.');
  process.exit(1);
}

// Get Desktop & Start Menu paths using PowerShell
let desktopPath = '';
let startMenuPath = '';
try {
  desktopPath = execSync('powershell -NoProfile -Command "[Environment]::GetFolderPath(\'Desktop\')"', { encoding: 'utf8' }).trim();
  startMenuPath = execSync('powershell -NoProfile -Command "[Environment]::GetFolderPath(\'Programs\')"', { encoding: 'utf8' }).trim();
} catch (e) {
  console.warn('Could not resolve special folders automatically, falling back to standard paths.');
}

const locations = [
  desktopPath ? path.join(desktopPath, 'Pulse Music.lnk') : null,
  startMenuPath ? path.join(startMenuPath, 'Pulse Music.lnk') : null,
  path.join(rootDir, 'Pulse Music.lnk')
].filter(Boolean);

console.log('Creating Pulse Music shortcuts with Pulse logo icon...');

locations.forEach(shortcutPath => {
  try {
    const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
$Shortcut.TargetPath = "${exePath.replace(/\\/g, '\\\\')}"
$Shortcut.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
$Shortcut.IconLocation = "${iconPath.replace(/\\/g, '\\\\')},0"
$Shortcut.Description = "Pulse Music - High-Fidelity Streaming App"
$Shortcut.Save()
`;
    const base64Script = Buffer.from(psScript, 'utf16le').toString('base64');
    execSync(`powershell -NoProfile -EncodedCommand ${base64Script}`);
    console.log(`✓ Created shortcut: ${shortcutPath}`);
  } catch (err) {
    console.error(`✗ Failed to create shortcut at ${shortcutPath}:`, err.message);
  }
});

console.log('\nAll shortcuts created successfully with the Pulse logo!');
