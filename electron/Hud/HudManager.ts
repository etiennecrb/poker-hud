import { BrowserWindow } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as _ from 'lodash';

import Hand from '../../shared/models/hand';
import Player from '../../shared/models/player';
import MetricsObject from '../../shared/metrics/metrics-object';
import MetricsEngine from '../../shared/metrics/metrics-engine';
import HandHistoryDatabase from '../HandHistory/HandHistoryDatabase';

class HudManager {
    private lastHand: Hand;
    private hudWindows: { [i: number]: Electron.BrowserWindow } = {};

    setLastHand(lastHand: Hand): void {
        this.lastHand = lastHand;
        HandHistoryDatabase.find({ playerNames: lastHand.players.map(p => p.name) })
            .subscribe((rawHands) => {
                const hands = rawHands.map((rawHand) => {
                    return new Hand(rawHand.id, new Date(rawHand.date), rawHand.players,
                        rawHand.buttonSeat, rawHand.rounds)
                });
                const metricsByPlayer = MetricsEngine(hands, this.lastHand.players);
                this.updateHudWindows(this.lastHand.players, metricsByPlayer);
            });
    }

    /**
     * Update hud windows with data from last hand players
     */
    private updateHudWindows(players: Player[], metricsByPlayer: {[s: string]: MetricsObject}): void {
        players.forEach((player) => {
            const data = {
                metrics: metricsByPlayer[player.name],
                playerName: player.name
            };

            if (!this.hudWindows[player.seat]) {
                this.hudWindows[player.seat] = HudManager.createHudWindow();
                this.hudWindows[player.seat].on('closed', () => delete this.hudWindows[player.seat]);

                this.hudWindows[player.seat].webContents.on('did-finish-load', () => {
                    HudManager.updateHudWindow(this.hudWindows[player.seat], data);
                });
            } else {
                HudManager.updateHudWindow(this.hudWindows[player.seat], data);
            }
        });

        // Close unused hud windows
        _.difference(_.keys(this.hudWindows), players.map(p => p.seat.toString())).forEach((seat) => {
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
