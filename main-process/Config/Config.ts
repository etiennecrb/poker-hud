import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import * as Rx from 'rxjs';
import * as _ from 'lodash';

import ConfigObject from './ConfigObject';
import Utils from '../Utils/Utils';

class Config {
    private config: ConfigObject;
    private static version: number = 0.1;
    private static configPath: string = Config.getConfigPath();

    load(): Rx.Observable<ConfigObject> {
        return Rx.Observable.create((subscriber) => {
            mkdirp(Utils.getAppDataPath(), (err) => {
                if (err) {
                    throw err;
                }
                fs.readFile(Config.configPath, 'utf-8', (err, data) => {
                    const config = !err ? Config.parse(data) : null;
                    if (config && config.version == Config.version) {
                        this.config = config;
                    } else {
                        this.config = Config.createEmptyConfig();
                        this.save();
                    }

                    subscriber.next(this.config);
                    subscriber.complete();
                });
            });
        });
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

    private save(): Config {
        fs.writeFile(Config.configPath, JSON.stringify(this.config), (err) => {
            if (err) {
                throw err;
            }
        });
        return this;
    }

    private static parse(data): ConfigObject {
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
