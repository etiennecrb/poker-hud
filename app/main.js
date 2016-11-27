const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', onReady)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const readline = require('readline');
const fs = require('fs');
const fp = require('lodash/fp');
const _ = require('lodash');

const winamax = require('./parsers/winamax.js');
const af = require('./metrics/af.js');
const cbet = require('./metrics/cbet.js');
const vpip = require('./metrics/vpip.js');

let hudWindows = {};

function onReady() {
    fs.watch('/home/etienne/Winamax Poker/accounts/TiennouFurax/history', (eventType, filename) => {
        if (eventType !== 'change' || filename.indexOf('.txt') === -1 || filename.indexOf('summary') > -1) {
            return;
        }
        const rl = readline.createInterface({
            input: fs.createReadStream(path.join(
                '/home/etienne/Winamax Poker/accounts/TiennouFurax/history',
                filename))
            });

            winamax.parse(rl, [af, cbet, vpip]).then(function (results) {
                if (!results[0] || !results[1]) {
                    return;
                }

                _(results[1].playerBySeat).forEach(function (player, seat) {
                    if (!hudWindows[seat]) {
                        hudWindows[seat] = new BrowserWindow({
                            width: 200,
                            height: 90,
                            frame: false,
                            resizable: false,
                            alwaysOnTop: true
                        })

                        // and load the index.html of the app.
                        hudWindows[seat].loadURL(url.format({
                            pathname: path.join(__dirname, 'hud.html'),
                            protocol: 'file:',
                            slashes: true
                        }))

                        // Open the DevTools.
                        //hudWindows[seat].webContents.openDevTools();

                        hudWindows[seat].webContents.on('did-finish-load', () => {
                            hudWindows[seat].webContents.send('data', {metrics: results[0][player.name], playerName: player.name});
                        });

                        // Emitted when the window is closed.
                        hudWindows[seat].on('closed', () => {
                            // Dereference the window object, usually you would store windows
                            // in an array if your app supports multi windows, this is the time
                            // when you should delete the corresponding element.
                            delete hudWindows[seat];
                        });
                    } else {
                        hudWindows[seat].webContents.send('data', {metrics: results[0][player.name], playerName: player.name});
                    }
                });

                _.difference(_.keys(hudWindows), _.keys(results[1].playerBySeat)).forEach((seat) => {
                    hudWindows[seat].close();
                })
            });
        });
    }
