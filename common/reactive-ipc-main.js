const { ipcMain } = require('electron');

module.exports = {
    on: on
};

function on(channel, callback) {
    return ipcMain.on(channel, (event, request) => {
        event.sender.send(channel + '//' + request.requestId, callback(request.requestParams));
    });
}

