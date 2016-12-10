const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

let config = void 0;

module.exports = {
    load: load
};

function load(callback) {
    const appData = path.join(app.getPath('appData'), 'poker-hud');
    mkdirp(appData, (err) => {
        if (err) {
            callback(err);
            return;
        }
        const configPath = path.join(appData, 'config.json');
        fs.readFile(configPath, function (err, data) {
            if (err) {
                config = createEmptyConfig();
                fs.writeFile(configPath, JSON.stringify(config), (err) => {
                    if (!err) registerEventListeners();
                    callback(err);
                });
            } else {
                config = JSON.parse(data);
                registerEventListeners();
                callback(null);
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