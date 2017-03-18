import { BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as _ from 'lodash';

import Hand from '../../shared/models/Hand';
import Player from '../../shared/models/Player';
import MetricsObject from '../../shared/metrics/MetricsObject';
import MetricsEngine from '../../shared/metrics/MetricsEngine';
import HandHistoryDatabase from '../HandHistory/HandHistoryDatabase';

class HudManager {
    private lastHand: Hand;
    private hudWindows: { [i: number]: Electron.BrowserWindow } = {};

    setLastHand(lastHand: Hand): void {
        this.lastHand = lastHand;

        HandHistoryDatabase.find({ playerNames: lastHand.playerNames })
            .subscribe((rawHands) => {
                const hands = rawHands.map((rawHand) => {
                    return new Hand(rawHand.id, new Date(rawHand.date), rawHand.playerBySeat, rawHand.playerNames,
                        rawHand.buttonSeat, rawHand.rounds)
                });
                const metricsByPlayer = MetricsEngine.compute(hands, _.values(lastHand.playerBySeat));
                this.updateHudWindows(this.lastHand.playerBySeat, metricsByPlayer);
            });
    }

    /**
     * Update hud windows with data from last hand players
     */
    private updateHudWindows(playerBySeat: {[i: number]: Player}, metricsByPlayer: {[s: string]: MetricsObject}): void {
        _.forIn(playerBySeat, (player: Player, seat: string) => {
            const data = {
                metrics: metricsByPlayer[player.name],
                playerName: player.name
            };

            if (!this.hudWindows[seat]) {
                this.hudWindows[seat] = HudManager.createHudWindow();
                this.hudWindows[seat].on('closed', () => delete this.hudWindows[seat]);

                this.hudWindows[seat].webContents.on('did-finish-load', () => {
                    HudManager.updateHudWindow(this.hudWindows[seat], data);
                });
            } else {
                HudManager.updateHudWindow(this.hudWindows[seat], data);
            }
        });

        // Close unused hud windows
        _.difference(_.keys(this.hudWindows), _.keys(playerBySeat)).forEach((seat) => {
            this.hudWindows[seat].close();
        });
    }

    /**
     * Creates a window that loads hud app.
     */
    private static createHudWindow(): Electron.BrowserWindow {
        const hudWindow = new BrowserWindow({
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
            pathname: path.join(__dirname, 'app-hud.html'),
            protocol: 'file:',
            slashes: true
        }));

        // hudWindow.webContents.openDevTools();

        return hudWindow;
    }

    /**
     * Sends data to window.
     */
    private static updateHudWindow(hudWindow: Electron.BrowserWindow, data: { metrics: {}, playerName: string}): void {
        hudWindow.webContents.send('update-data', data);
    }
}

export default new HudManager();
