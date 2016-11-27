const { app } = require('electron');
const hud = require('./hud.js');

app.on('ready', onReady);

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

function onReady() {
    hud.watch('/home/etienne/hud-test/');
}
