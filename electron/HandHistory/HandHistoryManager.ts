import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as Rx from 'rxjs';
import * as chokidar from 'chokidar';

import Config from '../Config/Config';
import Parser from '../../shared/parsers/Parser';
import HandHistoryDatabase from './HandHistoryDatabase';
import Hand from '../../shared/models/Hand';
import HudManager from '../Hud/HudManager';

export default class HandHistoryManager {
    public watcher: chokidar.FSWatcher;

    constructor(
        public room: string,
        public pathToFolder: string
    ) { }

    start(lastSync: Date): HandHistoryManager {
        Rx.Observable.bindNodeCallback(fs.readdir)(this.pathToFolder)
            .mergeMap((files) => {
                const array = files.map((filename) => Rx.Observable
                    .bindNodeCallback(fs.stat)(path.join(this.pathToFolder, filename))
                    .map((stats) => [filename, stats.mtime.getTime()])
                );
                return Rx.Observable.concat(...array);
            })
            .filter(([filename, mtime]) => !lastSync || mtime > lastSync.getTime())
            .subscribe(([filename, stats]) => this.parseFile(path.join(this.pathToFolder, filename.toString())));

        Config.setLastSync(this.room);
        this.watch();
        return this;
    }

    stop(): HandHistoryManager {
        if (this.watcher) {
            this.watcher.close();
        }
        return this;
    }

    private watch(): void {
        const watcherCallback = _.debounce((pathToFile: string) => {
            if (pathToFile.slice(-4) === '.txt') {
                this.parseFile(pathToFile).then((hand) => HudManager.setLastHand(hand));
                Config.setLastSync(this.room);
            }
        }, 500);
        this.watcher = chokidar.watch(path.join(this.pathToFolder, '*.txt'), {
            ignored: /summary/,
            ignoreInitial: true
        });
        this.watcher.on('change', watcherCallback);
        this.watcher.on('add', watcherCallback);
    }

    private parseFile(pathToFile: string): Promise<Hand> {
        return Parser.parseFile(this.room, pathToFile)
            .then((hands) => {
                HandHistoryDatabase.upsert(hands);
                return _.last(hands);
            });
    }
};
