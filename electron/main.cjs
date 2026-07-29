const { app, BrowserWindow, shell, ipcMain, dialog, desktopCapturer, screen } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

ipcMain.handle('select-screenshot-folder', async () => {
  try {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
    const result = await dialog.showOpenDialog(win, {
      title: 'انتخاب پوشه ذخیره‌سازی اسکرین‌شات‌ها',
      properties: ['openDirectory', 'createDirectory']
    });
    if (result && !result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
  } catch (err) {
    console.error('Error selecting folder:', err);
  }
  return null;
});

ipcMain.handle('take-screenshot', async (event, monitorIndex = 0) => {
  try {
    const primaryDisplay = screen ? screen.getPrimaryDisplay() : null;
    const width = primaryDisplay ? primaryDisplay.size.width : 1920;
    const height = primaryDisplay ? primaryDisplay.size.height : 1080;

    let sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: Math.min(width, 1920), height: Math.min(height, 1080) }
    });

    if (!sources || sources.length === 0) {
      sources = await desktopCapturer.getSources({
        types: ['window', 'screen'],
        thumbnailSize: { width: 1280, height: 720 }
      });
    }

    if (sources && sources.length > 0) {
      const selectedSource = sources[monitorIndex] || sources[0];
      if (selectedSource && selectedSource.thumbnail) {
        const dataUrl = selectedSource.thumbnail.toDataURL();
        if (dataUrl && dataUrl.length > 100) {
          return { success: true, dataUrl, name: selectedSource.name };
        }
      }
    }
    return { success: false, error: 'هیچ منبع تصویری یا مانیتوری برای اسکرین‌شات یافت نشد.' };
  } catch (err) {
    console.error('Error capturing screen:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
});

ipcMain.handle('save-screenshot', async (event, { dataUrl, folderPath, filename }) => {
  try {
    if (!dataUrl) {
      return { success: false, error: 'هیچ داده تصویری برای ذخیره‌سازی ارسال نشده است.' };
    }

    let baseFolder = folderPath;
    
    // Resolve shortcut relative folder names
    if (!baseFolder || baseFolder === 'Downloads' || baseFolder.startsWith('Downloads/') || baseFolder.startsWith('Downloads\\')) {
      const userDownloads = app.getPath('downloads');
      const sub = baseFolder ? baseFolder.replace(/^Downloads[\/\\]?/, '') : '';
      baseFolder = sub ? path.join(userDownloads, sub) : path.join(userDownloads, 'TradingScreenshots');
    } else if (baseFolder === 'Desktop' || baseFolder.startsWith('Desktop/') || baseFolder.startsWith('Desktop\\')) {
      const userDesktop = app.getPath('desktop');
      const sub = baseFolder.replace(/^Desktop[\/\\]?/, '');
      baseFolder = sub ? path.join(userDesktop, sub) : userDesktop;
    } else if (baseFolder === 'Documents' || baseFolder.startsWith('Documents/') || baseFolder.startsWith('Documents\\')) {
      const userDocs = app.getPath('documents');
      const sub = baseFolder.replace(/^Documents[\/\\]?/, '');
      baseFolder = sub ? path.join(userDocs, sub) : userDocs;
    } else if (baseFolder === 'Pictures' || baseFolder.startsWith('Pictures/') || baseFolder.startsWith('Pictures\\')) {
      const userPics = app.getPath('pictures');
      const sub = baseFolder.replace(/^Pictures[\/\\]?/, '');
      baseFolder = sub ? path.join(userPics, sub) : userPics;
    }

    // Ensure path is resolved as absolute
    baseFolder = path.resolve(baseFolder);

    const today = new Date().toISOString().split('T')[0];
    const targetFolder = path.join(baseFolder, today);

    // Create target directory recursively with fallback
    let actualTargetFolder = targetFolder;
    let warningMsg = null;

    try {
      if (!fs.existsSync(targetFolder)) {
        fs.mkdirSync(targetFolder, { recursive: true });
      }
    } catch (dirErr) {
      console.error('Failed to create custom folder, falling back to Downloads:', dirErr);
      const fallbackFolder = path.join(app.getPath('downloads'), 'TradingScreenshots', today);
      if (!fs.existsSync(fallbackFolder)) {
        fs.mkdirSync(fallbackFolder, { recursive: true });
      }
      actualTargetFolder = fallbackFolder;
      warningMsg = `پوشه ${targetFolder} به دلیل محدودیت دسترسی ساخته نشد. تصویر در ${fallbackFolder} ذخیره گردید.`;
    }

    const cleanBase64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const safeName = filename || `trade-${Date.now()}.png`;
    const finalFilePath = path.join(actualTargetFolder, safeName);

    fs.writeFileSync(finalFilePath, cleanBase64, 'base64');
    return {
      success: true,
      filePath: finalFilePath,
      folderPath: actualTargetFolder,
      warning: warningMsg
    };
  } catch (err) {
    console.error('Error saving screenshot:', err);
    return {
      success: false,
      error: err && err.message ? err.message : String(err)
    };
  }
});

function startStaticServer() {
  return new Promise((resolve) => {
    const distPath = path.join(app.getAppPath(), 'dist');
    const server = http.createServer((req, res) => {
      // Remove query string or hash if present
      const cleanUrl = req.url.split('?')[0].split('#')[0];
      let filePath = path.join(distPath, cleanUrl === '/' ? 'index.html' : cleanUrl);
      
      // Handle SPA routing: if file doesn't exist, serve index.html
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      const extname = path.extname(filePath);
      let contentType = 'text/html';
      switch (extname) {
        case '.js':
          contentType = 'application/javascript';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.svg':
          contentType = 'image/svg+xml';
          break;
        case '.woff':
          contentType = 'font/woff';
          break;
        case '.woff2':
          contentType = 'font/woff2';
          break;
      }

      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end('Error loading ' + cleanUrl);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      resolve(server.address().port);
    });
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 393,
    height: 852,
    title: "Trading Desk Sk",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Check if we are in dev mode or production
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    startStaticServer().then(port => {
      win.loadURL(`http://127.0.0.1:${port}`);
    });
  }

  // Open external links in the default OS browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
