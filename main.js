const { app, BrowserWindow } = require('electron');
const _ = require('lodash');

const config = require('./main-process/config.js');
const HandHistoryManager = require('./main-process/hand_history_manager.js');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow = void 0;

app.on('ready', onReady);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function onReady() {
    config.load((err, appConfig) => {
        if (err) {
            throw err;
        }

        createHandHistoryManagers(appConfig);
        createMainWindow();
    });
}

function createHandHistoryManagers(appConfig) {
    const lastSync = { getTime: () => 0 };
    _.get(appConfig, 'handHistoryFolders', []).forEach((handHistoryFolder) => {
        console.log(handHistoryFolder);
        const handHistoryManager = new HandHistoryManager(handHistoryFolder.room, handHistoryFolder.pathToFolder);
        handHistoryManager.start(lastSync);
    });
}

function createMainWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}
