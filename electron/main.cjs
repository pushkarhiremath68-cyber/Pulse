const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, shell, powerSaveBlocker, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Optimize for continuous background audio streaming
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let mainWindow = null;
let tray = null;
let isQuitting = false;
let powerBlockerId = null;

// Prevent OS suspension while app is active
try {
  powerBlockerId = powerSaveBlocker.start('prevent-app-suspension');
  console.log('[Pulse Desktop] Power save blocker active (id:', powerBlockerId, ')');
} catch (e) {}

// Store window bounds in user preferences
function getWindowStatePath() {
  return path.join(app.getPath('userData'), 'window-state.json');
}

function loadWindowState() {
  try {
    const data = fs.readFileSync(getWindowStatePath(), 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return { width: 1280, height: 800, isMaximized: false };
  }
}

function saveWindowState() {
  if (!mainWindow) return;
  try {
    const bounds = mainWindow.getBounds();
    const isMaximized = mainWindow.isMaximized();
    fs.writeFileSync(getWindowStatePath(), JSON.stringify({
      ...bounds,
      isMaximized
    }));
  } catch (e) {}
}

// Ensure single-instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createMainWindow() {
    const savedState = loadWindowState();

    mainWindow = new BrowserWindow({
      width: savedState.width || 1280,
      height: savedState.height || 800,
      minWidth: 900,
      minHeight: 600,
      x: savedState.x,
      y: savedState.y,
      center: !savedState.x,
      frame: false, // Frameless native window with custom titlebar
      titleBarStyle: 'hidden',
      titleBarOverlay: process.platform === 'darwin' ? {
        color: '#050508',
        symbolColor: '#ffffff',
        height: 38
      } : false,
      backgroundColor: '#050508',
      icon: path.join(__dirname, '../public/icons/icon-512.png'),
      show: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        spellcheck: false,
        backgroundThrottling: false, // Prevents audio pausing or throttling when minimized / backgrounded
        devTools: !app.isPackaged
      }
    });

    if (savedState.isMaximized) {
      mainWindow.maximize();
    }

    // Load web application
    const isDev = process.env.NODE_ENV === 'development';
    const distIndex = path.join(__dirname, '../dist/index.html');
    const rootIndex = path.join(__dirname, '../index.html');

    if (isDev) {
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        mainWindow.loadURL('http://localhost:3000');
      });
    } else if (fs.existsSync(distIndex)) {
      mainWindow.loadFile(distIndex);
    } else {
      mainWindow.loadFile(rootIndex);
    }

    // Graceful presentation once DOM content is ready
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.focus();
    });

    // Save bounds on resize/move
    mainWindow.on('resize', saveWindowState);
    mainWindow.on('move', saveWindowState);

    // Hide to tray instead of quitting on close (standard music player behavior)
    mainWindow.on('close', (e) => {
      if (!isQuitting) {
        e.preventDefault();
        saveWindowState();
        mainWindow.hide();
      }
    });

    // Open external links in default system browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });
  }

  function createTray() {
    const iconPath = path.join(__dirname, '../public/icons/icon-32.png');
    if (!fs.existsSync(iconPath)) return;

    tray = new Tray(iconPath);
    tray.setToolTip('Pulse Music - Playing High Quality Sound');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Open Pulse Music',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Play / Pause',
        click: () => {
          if (mainWindow) mainWindow.webContents.send('media-command', 'togglePlayPause');
        }
      },
      {
        label: 'Next Track',
        click: () => {
          if (mainWindow) mainWindow.webContents.send('media-command', 'playNext');
        }
      },
      {
        label: 'Previous Track',
        click: () => {
          if (mainWindow) mainWindow.webContents.send('media-command', 'playPrev');
        }
      },
      { type: 'separator' },
      {
        label: 'Quit Pulse',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  }

  function registerGlobalMediaShortcuts() {
    try {
      globalShortcut.register('MediaPlayPause', () => {
        if (mainWindow) mainWindow.webContents.send('media-command', 'togglePlayPause');
      });
      globalShortcut.register('MediaNextTrack', () => {
        if (mainWindow) mainWindow.webContents.send('media-command', 'playNext');
      });
      globalShortcut.register('MediaPreviousTrack', () => {
        if (mainWindow) mainWindow.webContents.send('media-command', 'playPrev');
      });
    } catch (e) {
      console.warn('Could not register global media keys:', e);
    }
  }

  // IPC Handlers for Native Titlebar & System Controls
  ipcMain.handle('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.handle('window-maximize-toggle', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      return mainWindow.isMaximized();
    }
    return false;
  });

  ipcMain.handle('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-is-maximized', () => {
    return mainWindow ? mainWindow.isMaximized() : false;
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  app.whenReady().then(() => {
    // Bypass CORS for YouTube Audio Engine and APIs
    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['Origin'] = 'https://www.youtube.com';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Access-Control-Allow-Origin': ['*'],
          'Access-Control-Allow-Headers': ['*']
        }
      });
    });

    createMainWindow();
    createTray();
    registerGlobalMediaShortcuts();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
      else if (mainWindow) mainWindow.show();
    });
  });

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });

  app.on('before-quit', () => {
    isQuitting = true;
  });
}
