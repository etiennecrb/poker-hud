const electron = require('electron')
const { BrowserWindow } = require('electron');
const { app } = require('electron');
const hud = require('./hud.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

app.on('ready', onReady);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

function onReady() {
    hud.watch('/home/etienne/Winamax Poker/accounts/TiennouFurax/history');

    mainWindow = new BrowserWindow({width: 800, height: 600})

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`)
    mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      mainWindow = null
    })
}
