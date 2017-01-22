import * as fs from 'fs';
import * as path from 'path';
import * as _ from 'lodash';
import * as Rx from 'rxjs';

import Main from '../Main';
import Config from '../Config/Config';
import Parser from '../../common/parsers/Parser';
import HandHistoryDatabase from './HandHistoryDatabase';

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
			.filter(([filename, mtime]) => mtime > lastSync.getTime())
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
		const parseFileIfHandHistoryWasUpdated = (eventType, filename) => {
			if (eventType === 'change' && filename.indexOf('.txt') > -1 &&
			filename.indexOf('summary') === -1) {
				this.parseFile(filename);
				Config.setLastSync(this.room);
			}
		};
		const watcherCallback = _.debounce(parseFileIfHandHistoryWasUpdated, 200);
		this.watcher = fs.watch(this.pathToFolder, watcherCallback);
	}

	private parseFile(filename: string): void {
		console.log('Parse: ' + filename);
		Parser.parseFile(this.room, path.join(this.pathToFolder, filename))
			.subscribe((hand) => {
				HandHistoryDatabase.upsert(hand);
			});
	}
};
