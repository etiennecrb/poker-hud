const { ipcMain } = require('electron');

module.exports = {
    on: on
};

function on(channel, callback) {
    return ipcMain.on(channel, (event, request) => {
        const result = callback(request.requestParams);
        if (result && typeof result.then == 'function') {
            result.then((result) => {
                event.sender.send(channel + '//' + request.requestId, result);
            });
        } else if (result && typeof result.subscribe == 'function') {
            result.subscribe((result) => {
                event.sender.send(channel + '//' + request.requestId, result);
            }); 
        } else {
            event.sender.send(channel + '//' + request.requestId, result);
        }
    });
}

