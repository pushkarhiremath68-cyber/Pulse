const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, shell, powerSaveBlocker, session } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

let localServer = null;
let localServerPort = null;

function startLocalServer() {
  return new Promise((resolve) => {
    if (localServer && localServerPort) {
      return resolve(localServerPort);
    }

    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.mjs': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.webp': 'image/webp',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.m4a': 'audio/mp4'
    };

    const server = http.createServer((req, res) => {
      let reqPath = decodeURI(req.url.split('?')[0]);
      if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

      const distDir = path.join(__dirname, '../dist');
      const rootDir = path.join(__dirname, '..');
      const baseDir = fs.existsSync(path.join(distDir, 'index.html')) ? distDir : rootDir;

      let filePath = path.join(baseDir, reqPath);
      if (!fs.existsSync(filePath) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
        filePath = path.join(baseDir, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(data);
      });
    });

    server.listen(0, '127.0.0.1', () => {
      localServerPort = server.address().port;
      localServer = server;
      console.log(`[Pulse Desktop Server] Running on http://127.0.0.1:${localServerPort}`);
      resolve(localServerPort);
    });
  });
}

// Optimize for continuous background audio streaming
app.commandLine.appendSwitch('disable-background-timer-throttling');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
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

    // Allow media (microphone) capture for voice assistant & search
    try {
      mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'media' || permission === 'audioCapture') {
          return callback(true);
        }
        callback(false);
      });
    } catch (e) {}

    // Ensure audio and timers never throttle when window is backgrounded or minimized
    mainWindow.webContents.setBackgroundThrottling(false);

    // Load web application
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173').catch(() => {
        mainWindow.loadURL('http://localhost:3000');
      });
    } else {
      startLocalServer().then((port) => {
        mainWindow.loadURL(`http://127.0.0.1:${port}/index.html`);
      }).catch(() => {
        const distIndex = path.join(__dirname, '../dist/index.html');
        const rootIndex = path.join(__dirname, '../index.html');
        if (fs.existsSync(distIndex)) {
          mainWindow.loadFile(distIndex);
        } else {
          mainWindow.loadFile(rootIndex);
        }
      });
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

    // Allow verified Google & Firebase OAuth popups inside a dedicated secure window
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      try {
        const parsed = new URL(url);
        const isAuthUrl = parsed.hostname.endsWith('firebaseapp.com') ||
                          parsed.hostname.endsWith('google.com') ||
                          parsed.hostname.endsWith('googleapis.com') ||
                          url.includes('/__/auth/');
        if (isAuthUrl) {
          return {
            action: 'allow',
            overrideBrowserWindowOptions: {
              width: 520,
              height: 680,
              modal: true,
              parent: mainWindow,
              autoHideMenuBar: true,
              backgroundColor: '#050508',
              webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                sandbox: true,
                backgroundThrottling: false
              }
            }
          };
        }

        if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
          shell.openExternal(url);
        } else {
          console.warn('[Pulse Desktop Security] Blocked dangerous window.open protocol:', parsed.protocol);
        }
      } catch (err) {
        console.warn('[Pulse Desktop Security] Invalid URL in window open handler:', url);
      }
      return { action: 'deny' };
    });

    // Provide clean Chrome User-Agent to auth child windows so Google does not block with 403 disallowed_useragent
    mainWindow.webContents.on('did-create-window', (childWindow) => {
      childWindow.webContents.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      );
    });

    // Prevent top-level navigation away from the local app
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const isLocalHost = navigationUrl.startsWith('http://localhost:5173') || navigationUrl.startsWith('http://localhost:3000');
      const isFile = navigationUrl.startsWith('file://');
      if (!isLocalHost && !isFile) {
        event.preventDefault();
        console.warn('[Pulse Desktop Security] Blocked external navigation in main window:', navigationUrl);
        try {
          const parsed = new URL(navigationUrl);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
            shell.openExternal(navigationUrl);
          }
        } catch (_) {}
      }
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

  // Native Google OAuth for Electron Desktop
  ipcMain.handle('native-google-signin', async () => {
    return new Promise(async (resolve, reject) => {
      let authWin = null;
      try {
        const apiKey = 'AIzaSyAWQx9wqglmoO0OPY7pmXy7we_qC6Btt4M';
        const uriRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            providerId: 'google.com',
            continueUri: 'https://pulse-music-app-68.firebaseapp.com/__/auth/handler',
            customParameter: {
              prompt: 'select_account'
            }
          })
        });
        const uriData = await uriRes.json();
        if (!uriData.authUri) {
          throw new Error(uriData.error?.message || 'Failed to initialize Google Sign-In');
        }

        authWin = new BrowserWindow({
          width: 520,
          height: 680,
          parent: mainWindow,
          modal: true,
          autoHideMenuBar: true,
          backgroundColor: '#050508',
          title: 'Sign in with Google - Pulse Music',
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true
          }
        });

        authWin.webContents.setUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        );

        let resolved = false;

        const handleUrl = async (navUrl) => {
          if (resolved) return;
          try {
            if (navUrl.includes('/__/auth/handler')) {
              const urlObj = new URL(navUrl);
              const hashParams = new URLSearchParams(urlObj.hash.replace(/^#/, ''));
              const queryParams = urlObj.searchParams;
              const idToken = hashParams.get('id_token') || queryParams.get('id_token');
              const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
              const oauthCode = hashParams.get('code') || queryParams.get('code');

              if (idToken) {
                resolved = true;
                if (authWin && !authWin.isDestroyed()) authWin.close();
                resolve({ idToken, accessToken, sessionId: uriData.sessionId });
              } else if (oauthCode) {
                resolved = true;
                if (authWin && !authWin.isDestroyed()) authWin.close();
                try {
                  const idpRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      requestUri: 'https://pulse-music-app-68.firebaseapp.com/__/auth/handler',
                      postBody: `code=${encodeURIComponent(oauthCode)}&providerId=google.com`,
                      returnSecureToken: true,
                      returnIdpCredential: true
                    })
                  });
                  const idpData = await idpRes.json();
                  if (idpData.idToken) {
                    resolve({
                      idToken: idpData.idToken,
                      refreshToken: idpData.refreshToken,
                      accessToken: idpData.oauthAccessToken || accessToken,
                      rawUser: idpData
                    });
                  } else {
                    reject(new Error(idpData.error?.message || 'Failed to exchange authorization code'));
                  }
                } catch (exchangeErr) {
                  reject(exchangeErr);
                }
              }
            }
          } catch (e) {}
        };

        authWin.webContents.on('will-redirect', (_, url) => handleUrl(url));
        authWin.webContents.on('did-navigate', (_, url) => handleUrl(url));
        authWin.webContents.on('did-redirect-navigation', (_, url) => handleUrl(url));

        authWin.on('closed', () => {
          if (!resolved) {
            reject(new Error('Google sign-in window was closed by user.'));
          }
        });

        authWin.loadURL(uriData.authUri);
      } catch (err) {
        if (authWin && !authWin.isDestroyed()) authWin.close();
        reject(err);
      }
    });
  });

  app.whenReady().then(() => {
    // Safely enable streaming headers strictly for verified media CDN endpoints
    const TRUSTED_STREAM_DOMAINS = ['youtube.com', 'googlevideo.com', 'saavncdn.com', 'jiosaavn.com', 'apple.com', 'mzstatic.com'];

    session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
      const isTrusted = details.url && TRUSTED_STREAM_DOMAINS.some(domain => details.url.includes(domain));
      if (isTrusted && details.requestHeaders) {
        details.requestHeaders['Origin'] = 'https://www.youtube.com';
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      const isTrusted = details.url && TRUSTED_STREAM_DOMAINS.some(domain => details.url.includes(domain));
      if (isTrusted && details.responseHeaders) {
        details.responseHeaders['Access-Control-Allow-Origin'] = ['*'];
        details.responseHeaders['Access-Control-Allow-Headers'] = ['*'];
      }
      callback({ responseHeaders: details.responseHeaders });
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
