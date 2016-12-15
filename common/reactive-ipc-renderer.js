const { ipcRenderer } = require('electron');
const { Observable } = require('rxjs');
const uuid = require('uuid');

module.exports = {
    send: send
};

function send(channel, params) {
    const requestId = uuid();
    ipcRenderer.send(channel, {requestId: requestId, requestParams: params});
    return Observable.fromEvent(ipcRenderer, channel + '//' + requestId, (event, arg) => arg).first();
}
