import * as fs from 'fs';
import * as path from 'path';
import * as Datastore from 'nedb';

import Utils from './Utils';
import Hand from '../common/models/Hand';

class HandHistoryDatabase {
    private loaded: Promise<{}>;
    private db: Datastore;
    private dbPath: string = path.join(Utils.getAppDataPath(), 'hand_history.db');

    constructor() {
        this.db = new Datastore({ filename: this.dbPath, autoload: true });
        this.db.ensureIndex({ fieldName: 'id', unique: true });
    }

    upsert(object: Hand) {
        this.db.update({ id: object.id }, object, { upsert: true });
    }
}

export default new HandHistoryDatabase();
