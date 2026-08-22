import { createWindowsInstaller } from 'electron-winstaller';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildInstaller() {
  const rootPath = path.join(__dirname, '..');
  const appDirectory = path.join(rootPath, 'dist', 'win-app', 'Pulse Music-win32-x64');
  const outputDirectory = path.join(rootPath, 'dist', 'win-installer');
  const iconPath = path.join(rootPath, 'public', 'icons', 'icon.ico');

  // Check if raw binary exists
  if (!fs.existsSync(appDirectory)) {
    console.error(`Error: App directory not found at ${appDirectory}. Run electron-packager first.`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  console.log('Starting Windows installer creation...');
  console.log(`Input: ${appDirectory}`);
  console.log(`Output: ${outputDirectory}`);

  try {
    await createWindowsInstaller({
      appDirectory: appDirectory,
      outputDirectory: outputDirectory,
      authors: 'Pushkar Hiremath',
      exe: 'Pulse Music.exe',
      setupExe: 'Pulse Music Setup.exe',
      setupIcon: fs.existsSync(iconPath) ? iconPath : undefined,
      iconUrl: 'https://raw.githubusercontent.com/pushkarhiremath68-cyber/Pulse/main/public/icons/icon.ico',
      noMsi: true,
      title: 'Pulse Music',
      description: 'Pulse Music - High-Fidelity Cross-Platform Music Streaming App'
    });
    console.log('Successfully created Windows installer!');
  } catch (e) {
    console.error(`Error creating Windows installer: ${e.message}`);
    process.exit(1);
  }
}

buildInstaller();
