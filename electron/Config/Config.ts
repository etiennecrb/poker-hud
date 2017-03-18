import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as _ from 'lodash';
import * as EventEmitter from 'events';

import ConfigObject from './ConfigObject';
import HandHistoryFolder from './HandHistoryFolder';
import Utils from '../Utils/Utils';

class Config extends EventEmitter {
    private config: ConfigObject;
    private static version: number = 0.1;

    constructor() {
        super();

        ipcMain.on('config/get', (event) => {
            event.sender.send('config/get', this.config);
        });

        ipcMain.on('config/set-hand-history-folders', (event, folders) => {
            this.setHandHistoryFolders(folders);
            event.sender.send('config/set-hand-history-folders', this.config);
        });
    }

    load(): Config {
        mkdirp(Utils.getAppDataPath(), (err) => {
            if (err) {
                throw err;
            }
            fs.readFile(Config.getConfigPath(), 'utf-8', (err, data) => {
                const config = !err ? Config.parse(data) : null;
                if (config && config.version == Config.version) {
                    this.config = config;
                } else {
                    this.config = Config.createEmptyConfig();
                    this.save();
                }
                this.emit('ready', this.config);
            });
        });
        return this;
    }

    get() {
        return this.config;
    }

    setLastSync(room: string): void {
        const folder = _.find(this.config.handHistoryFolders, { 'room': room });
        if (folder) {
            folder.lastSync = new Date();
            this.save();
        }
    }

    setHandHistoryFolders(handHistoryFolders: HandHistoryFolder[]): void {
        this.config.handHistoryFolders = handHistoryFolders;
        this.save();
        this.emit('handHistoryFoldersChanged', this.config);
    }

    private save(): Config {
        fs.writeFile(Config.getConfigPath(), JSON.stringify(this.config), (err) => {
            if (err) {
                throw err;
            }
        });
        return this;
    }

    private static parse(data: string): ConfigObject {
        return JSON.parse(data, (key, value) => {
            if (key === 'lastSync') {
                const time = Date.parse(value);
                return _.isFinite(time) ? new Date(time) : new Date(0, 0, 0);
            }
            return value;
        });
    }

    private static getConfigPath(): string {
        return path.join(Utils.getAppDataPath(), 'config.json');
    }

    private static createEmptyConfig(): ConfigObject {
        return {
            version: Config.version,
            handHistoryFolders: []
        };
    }
}

export default new Config();
