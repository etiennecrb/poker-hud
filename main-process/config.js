const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

let config = void 0;
const loadingPromise = load();

module.exports = {
    get: get,
    save: save
};

function getAppDataPath() {
    return path.join(app.getPath('appData'), 'poker-hud');
}

function getConfigPath() {
    return path.join(getAppDataPath(), 'config.json');
}

function save() {
    return new Promise((resolve, reject) => {
        fs.writeFile(configPath, JSON.stringify(config), (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function get() {
    return loadingPromise.then(() => config, () => createEmptyConfig());
}

function load() {
    return new Promise((resolve, reject) => {
        mkdirp(getAppDataPath(), (err) => {
            if (err) {
                reject(err);
            }
            const configPath = getConfigPath(); 
            fs.readFile(configPath, function (err, data) {
                if (err) {
                    config = createEmptyConfig();
                    save().then(resolve, reject);
                } else {
                    config = JSON.parse(data);
                    resolve();
                }
            });
        });
    });
}

function createEmptyConfig() {
    return {
        handHistoryFolders: new Set() 
    };
}
