const { BrowserWindow } = require('electron');
const fs = require('fs');
const readline = require('readline');
const url = require('url');
const path = require('path');
const _ = require('lodash');

const parser = require('./common/parsers/winamax.js');
const af = require('./common/metrics/af.js');
const count = require('./common/metrics/count.js');
const cbet = require('./common/metrics/cbet.js');
const vpip = require('./common/metrics/vpip.js');

let hudWindows = {};
let watcher = void 0;

module.exports = {
    watch: watch
};

/**
 * Watches changes in given directory and updates hud windows on change.
 * @param {string} directory
 */
function watch(directory) {
    if (watcher) {
        watch.close();
    }

    watcher = fs.watch(directory, (eventType, filename) => {
        if (!hudShouldUpdate(eventType, filename)) {
            return;
        }

        parseFile(directory, filename).then(function (results) {
            const [metricsByPlayer, lastHand] = results;
            const playerBySeat = lastHand ? lastHand.playerBySeat : {};

            // Update hud windows with data from last hand players
            _(playerBySeat).forEach((player, seat) => {
                const data = {
                    metrics: metricsByPlayer[player.name],
                    playerName: player.name
                };

                if (!hudWindows[seat]) {
                    hudWindows[seat] = createHudWindow();
                    hudWindows[seat].on('closed', () => delete hudWindows[seat]);

                    // hudWindows[seat].webContents.openDevTools();
                    hudWindows[seat].webContents.on('did-finish-load', () => {
                        updateHudWindow(hudWindows[seat], data);
                    });
                } else {
                    updateHudWindow(hudWindows[seat], data);
                }
            });

            // Close unused hud windows
            _.difference(_.keys(hudWindows), _.keys(playerBySeat)).forEach((seat) => {
                hudWindows[seat].close();
            });
        });

    });
}

/**
 * Checks if hud windows must be updated after a change event emitted by an fs watcher.
 * @param {string} eventType
 * @param {string} filename
 * @returns {boolean}
 */
function hudShouldUpdate(eventType, filename) {
    return eventType === 'change' && filename.indexOf('.txt') > -1 && filename.indexOf('summary') === -1;
}

/**
 * Parses file and returns results.
 * @param {string} directory
 * @param {string} filename
 * @returns {Promise}
 */
function parseFile(directory, filename) {
    const rl = readline.createInterface({
        input: fs.createReadStream(path.join(directory, filename))
    });
    return parser.parse(rl, [af, cbet, count, vpip]);
}

/**
 * Creates a window that loads hud app.
 * @returns {BrowserWindow}
 */
function createHudWindow() {
    let hudWindow = new BrowserWindow({
        width: 150,
        height: 45,
        frame: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        useContentSize: true,
        alwaysOnTop: true
    });

    hudWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/hud/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    return hudWindow;
}

/**
 * Sends data to window.
 * @param {BrowserWindow} hudWindow
 * @param {*} data
 */
function updateHudWindow(hudWindow, data) {
    hudWindow.webContents.send('update-data', data);
}
