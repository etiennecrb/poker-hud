import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as mkdirp from 'mkdirp';

import Utils from './Utils';

class Config {
    private config: {};
    private loadingPromise: Promise<{}> = this.load();

    get() {
        return this.loadingPromise.then(() => this.config);
    }

    private load(): Promise<{}> {
        return new Promise((resolve, reject) => {
            mkdirp(Utils.getAppDataPath(), (err) => {
                if (err) {
                    reject(err);
                }
                const configPath = Config.getConfigPath();
                fs.readFile(configPath, 'utf-8', (err, data) => {
                    if (err) {
                        this.config = Config.createEmptyConfig();
                        this.save().then(resolve, reject);
                    } else {
                        this.config = JSON.parse(data);
                        resolve();
                    }
                });
            });
        });
    }

    private save(): Promise<{}> {
        const configPath = Config.getConfigPath();
        return new Promise((resolve, reject) => {
            fs.writeFile(configPath, JSON.stringify(this.config), (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private static getConfigPath() {
        return path.join(Utils.getAppDataPath(), 'config.json');
    }

    private static createEmptyConfig(): {} {
        return {
            handHistoryFolders: [{
                room: 'winamax',
                pathToFolder: ''
            }]
        };
    }
}

export default new Config();
