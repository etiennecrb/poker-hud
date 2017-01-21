const { app } = require('electron');
const path = require('path');

module.exports = {
    getAppDataPath: getAppDataPath
};

function getAppDataPath() {
    return path.join(app.getPath('appData'), 'poker-hud');
}
