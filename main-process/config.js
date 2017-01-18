const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

let appConfig = void 0;

module.exports = {
    get: get,
    load: load
};

function get() {
    return appConfig;
}

function load(callback) {
    const appData = path.join(app.getPath('appData'), 'poker-hud');
    const configPath = path.join(appData, 'config.json');

    mkdirp(appData, (err) => {
        if (err) {
            callback(err);
            return;
        }
        
        fs.readFile(configPath, function (err, data) {
            if (err) {
                appConfig = createEmptyConfig();
                fs.writeFile(configPath, JSON.stringify(config), (err) => {
                    if (!err) registerEventListeners();
                    callback(err, appConfig);
                });
            } else {
                appConfig = JSON.parse(data);
                registerEventListeners();
                callback(null, appConfig);
            }
        });
    });
}

function registerEventListeners() {
    ipcMain.on('/config/hand_history_folders', (event) => {
        event.sender.send('/config/hand_history_folders', config.handHistoryFolders);
    });
}

function createEmptyConfig() {
    return {
        handHistoryFolders: []
    };
}