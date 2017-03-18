import { ElectronService } from 'ngx-electron';
import { Injectable } from '@angular/core';
import ConfigObject from '../../../electron/Config/ConfigObject';
import HandHistoryFolder from '../../../electron/Config/HandHistoryFolder';

@Injectable()
export class ConfigService {

    constructor(private electronService: ElectronService) {}

    get(): Promise<ConfigObject> {
        return new Promise((resolve) => {
            this.electronService.ipcRenderer.send('config/get');
            this.electronService.ipcRenderer.once('config/get', (event, config) => {
                resolve(config);
            });
        });
    }

    setHandHistoryFolder(folder: HandHistoryFolder): Promise<ConfigObject> {
        return new Promise((resolve) => {
            this.electronService.ipcRenderer.send('config/set-hand-history-folders', [folder]);
            this.electronService.ipcRenderer.once('config/set-hand-history-folders', (event, config) => {
                resolve(config);
            });
        });
    }
}
