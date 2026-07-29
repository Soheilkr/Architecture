const { app, BrowserWindow, shell, ipcMain, dialog, desktopCapturer } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

ipcMain.handle('select-screenshot-folder', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'انتخاب پوشه ذخیره‌سازی اسکرین‌شات‌ها',
      properties: ['openDirectory', 'createDirectory']
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
  } catch (err) {
    console.error('Error selecting folder:', err);
  }
  return null;
});

ipcMain.handle('take-screenshot', async (event, monitorIndex = 0) => {
  try {
    let sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: 1920, height: 1080 }
    });

    if (!sources || sources.length === 0) {
      sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 1280, height: 720 }
      });
    }

    if (sources && sources.length > 0) {
      const selectedSource = sources[monitorIndex] || sources[0];
      const dataUrl = selectedSource.thumbnail.toDataURL();
      return { success: true, dataUrl, name: selectedSource.name };
    }
    return { success: false, error: 'هیچ منبع تصویری یا مانیتوری یافت نشد.' };
  } catch (err) {
    console.error('Error capturing screen:', err);
    return { success: false, error: err && err.message ? err.message : String(err) };
  }
});

ipcMain.handle('save-screenshot', async (event, { dataUrl, folderPath, filename }) => {
  try {
    if (!folderPath) {
      folderPath = app.getPath('pictures');
    }
    const today = new Date().toISOString().split('T')[0];
    const targetFolder = path.join(folderPath, today);

    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(targetFolder, filename || `trade-${Date.now()}.png`);
    fs.writeFileSync(filePath, base64Data, 'base64');
    return filePath;
  } catch (err) {
    console.error('Error saving screenshot:', err);
    throw err;
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
