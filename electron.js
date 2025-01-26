const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // Enable for better security
      nodeIntegration: false, // Disable for better security
    },
  });

  if (process.env.NODE_ENV === 'development') {
    // Load the React app's development server in development mode
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    // Load the React app from the build folder in production mode
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron app initialization
app.whenReady().then(createWindow);

// Quit the app when all windows are closed (on macOS, app remains active)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// For macOS: Re-create the window when the app is activated
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
