const fs = require('fs');
const path = require('path')
const _ = require('lodash');
const Rx = require('rxjs');

const parser = require('../common/parsers/index.js');
const HandHistoryDatabase = require('./hand-history-database.js');

class HandHistoryManager {
	constructor(room, pathToFolder) {
		this.room = room;
		this.pathToFolder = pathToFolder;
		this.watcher = void 0;
	}
	start(lastSync) {
		Rx.Observable.bindNodeCallback(fs.readdir)(this.pathToFolder)
			.mergeMap((files) => {
				const array = files.map((fileName) => Rx.Observable
					.bindNodeCallback(fs.stat)(path.join(this.pathToFolder, fileName))
					.map((stats) => [fileName, stats.mtime.getTime()])
					);
				return Rx.Observable.concat(...array);
			})
			.filter(([fileName, mtime]) => mtime > lastSync.getTime())
			.subscribe(([fileName, stats]) => this.parseFile(fileName));

		this.watch();
	}
	stop() {
		if (this.watcher) {
			this.watch.close();
		}
	}
	watch() {
		const parseFileIfHandHistoryWasUpdated = (eventType, fileName) => {
			if (eventType === 'change' && fileName.indexOf('.txt') > -1 && fileName.indexOf('summary') === -1) {
				this.parseFile(fileName);
			}
		};
		this.watcher = fs.watch(this.pathToFolder, _.debounce(parseFileIfHandHistoryWasUpdated, 200));
	}
	parseFile(fileName) {
		parser.parseFile(this.room, path.join(this.pathToFolder, fileName))
			.subscribe((hand) => {
				HandHistoryDatabase.upsert(hand);
			});
	}
}

module.exports = HandHistoryManager;
