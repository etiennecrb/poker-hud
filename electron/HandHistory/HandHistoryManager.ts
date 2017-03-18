import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as Rx from 'rxjs';

import Config from '../Config/Config';
import Parser from '../../shared/parsers/Parser';
import HandHistoryDatabase from './HandHistoryDatabase';
import Hand from '../../shared/models/Hand';
import HudManager from '../Hud/HudManager';

export default class HandHistoryManager {
    public watcher: fs.FSWatcher;

    constructor(
        public room: string,
        public pathToFolder: string
    ) {}

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
            .subscribe(([filename, stats]) => this.parseFile(filename.toString()));

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
        const parseFileIfHandHistoryWasUpdated = (eventType: string, filename: string) => {
            if (filename.indexOf('.txt') > -1 && filename.indexOf('summary') === -1) {
                this.parseFile(filename).then((hand) => HudManager.setLastHand(hand));
                Config.setLastSync(this.room);
            }
        };
        const watcherCallback = _.debounce(parseFileIfHandHistoryWasUpdated, 500);
        this.watcher = fs.watch(this.pathToFolder, watcherCallback);
    }

    private parseFile(filename: string): Promise<Hand> {
        return Parser.parseFile(this.room, path.join(this.pathToFolder, filename))
            .then((hands) => {
                HandHistoryDatabase.upsert(hands);
                return _.last(hands);
            });
    }
};
