const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show the window until it's ready
    backgroundColor: '#ffffff', // Match splash screen background
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/logo_2.png'),
  });

  win.once('ready-to-show', () => {
    win.show();
  });

  // Fallback: Show window after 5 seconds if ready-to-show doesn't fire
  setTimeout(() => {
    if (!win.isDestroyed() && !win.isVisible()) {
      win.show();
    }
  }, 5000);

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html')).catch((err) => {
      console.error('Failed to load file:', err);
      // Even if it fails, show the window so the user sees a white screen instead of nothing
      win.show();
    });
  }

  win.setMenu(null);
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
