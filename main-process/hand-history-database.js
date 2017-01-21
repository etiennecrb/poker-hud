const fs = require('fs');
const path = require('path');
const Datastore = require('nedb');

const utils = require('./utils.js');

class HandHistoryDatabase {
    constructor() {
        const dbPath = path.join(utils.getAppDataPath(), 'hand_history.db');
        this.loaded = new Promise((resolve) => {
            this.db = new Datastore({ filename: dbPath });
            this.db.loadDatabase(() => {
                this.db.ensureIndex({ fieldName: 'id', unique: true });
                resolve();
            });
        });
    }

    upsert(object) {
        this.loaded.then(() => {
            this.db.update({ id: object.id }, object, { upsert: true });
        });
    }
}

module.exports = new HandHistoryDatabase();
