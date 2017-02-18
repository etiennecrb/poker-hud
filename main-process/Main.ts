import { app, BrowserWindow } from 'electron';
import * as _ from 'lodash';

import Config  from './Config/Config';
import ConfigObject from './Config/ConfigObject';
import HandHistoryManager from './HandHistory/HandHistoryManager';

class Main {
    private mainWindow: Electron.BrowserWindow;
    private handHistoryManagers: HandHistoryManager[];

    run(): void {
        // Register event listeners
        app.on('ready', this.onReady);
        app.on('window-all-closed', Main.onWindowAllClosed);
    }

    private onReady(): void {
        Config.load()
            .on('ready', (appConfig) => {
                this.handHistoryManagers = Main.createHandHistoryManagers(appConfig);
                this.createMainWindow();
            })
            .on('handHistoryFoldersChange', (appConfig) => {
                this.handHistoryManagers.forEach((manager) => manager.stop());
                this.handHistoryManagers = Main.createHandHistoryManagers(appConfig);
            });
    }

    private static createHandHistoryManagers(appConfig: ConfigObject): HandHistoryManager[] {
        return appConfig.handHistoryFolders.map(({ room, pathToFolder, lastSync }) => {
            return new HandHistoryManager(room, pathToFolder).start(lastSync);
        });
    }


    createMainWindow(): void {
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

    private static onWindowAllClosed(): void {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }
};

export default new Main();
