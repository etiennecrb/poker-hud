import { app, BrowserWindow } from 'electron';
import * as _ from 'lodash';

import Config  from './Config';
import HandHistoryManager from './HandHistoryManager';

class Main {
    private mainWindow: Electron.BrowserWindow;
    private handHistoryManagers: HandHistoryManager[];

    run(): void {
        // Register event listeners
        app.on('ready', this.onReady);
        app.on('window-all-closed', this.onWindowAllClosed);
    }

    private onReady(): void {
        Config.get().then((appConfig) => {
            this.handHistoryManagers = Main.createHandHistoryManagers(appConfig);
            // this.createMainWindow();
        });
    }

    private static createHandHistoryManagers(appConfig: {}): HandHistoryManager[] {
        const lastSync = new Date(1970, 10, 10);
        return (appConfig['handHistoryFolders'] || [])
            .map(({ room, pathToFolder }) => {
                return new HandHistoryManager(room, pathToFolder).start(lastSync);
            });
    }


    private createMainWindow() {
        this.mainWindow = new BrowserWindow({width: 800, height: 600});

        // and load the index.html of the app.
        this.mainWindow.loadURL(`file://${__dirname}/app-main/index.html`);
        this.mainWindow.webContents.openDevTools();

        // Emitted when the window is closed.
        this.mainWindow.on('closed', function () {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.mainWindow = null;
        });
    }

    private onWindowAllClosed(): void {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }
};

export default new Main();
