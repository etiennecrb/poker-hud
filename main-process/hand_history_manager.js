const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const { Observable } = require('rxjs');
const HandHistoryDatabase = require('./hand_history_database');

class HandHistoryManager {
	constructor(room, pathToFolder) {
		this.room = room;
		this.pathToFolder = pathToFolder;
		this.watcher = void 0;
	}
	start(lastSync) {
		Observable.bindNodeCallback(fs.readdir)(this.pathToFolder)
			.mergeMap((files) => {
				const array = files.map((fileName) => Observable
					.bindNodeCallback(fs.stat)(path.join(this.pathToFolder, fileName))
					.map((stats) => [fileName, stats.mtime.getTime()])
					);
				return Observable.concat(...array);
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
		// Parse file and put results in DB
		console.log('Parse ' + fileName);
		HandHistoryDatabase.addFile(fileName);
	}
}

module.exports = HandHistoryManager;
