import { Injectable } from '@angular/core';
import ConfigObject from '../../main-process/Config/ConfigObject';
import HandHistoryFolder from '../../main-process/Config/HandHistoryFolder';
declare const ipcRenderer: any;

@Injectable()
export class ConfigService {

    constructor() {}

    get(): Promise<ConfigObject> {
        return new Promise((resolve) => {
            ipcRenderer.send('config/get');
            ipcRenderer.once('config/get', (event, config) => {
                resolve(config);
            });
        });
    }

    setHandHistoryFolder(folder: HandHistoryFolder): Promise<ConfigObject> {
        return new Promise((resolve) => {
            ipcRenderer.send('config/set-hand-history-folders', [folder]);
            ipcRenderer.once('config/set-hand-history-folders', (event, config) => {
                resolve(config);
            });
        });
    }
}
