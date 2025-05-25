const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function waitForServer(url, attempts = 0) {
    return new Promise((resolve, reject) => {
        if (attempts > 30) return reject('Server did not start in time');
        http.get(url, () => resolve())
            .on('error', () => setTimeout(() => resolve(waitForServer(url, attempts + 1)), 500));
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: { nodeIntegration: false }
    });
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', async () => {
    serverProcess = spawn('npm', ['start'], { shell: true, stdio: 'inherit' });
    await waitForServer('http://localhost:3000');
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
    if (serverProcess) serverProcess.kill();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});