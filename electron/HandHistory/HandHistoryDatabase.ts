import * as path from 'path';
import * as Datastore from 'nedb';
import * as Rx from 'rxjs';
import * as _ from 'lodash';

import Utils from '../Utils/Utils';
import Hand from '../../shared/models/hand';

class HandHistoryDatabase {
    private db: Datastore;
    private dbPath: string = path.join(Utils.getAppDataPath(), 'hand_history.db');

    constructor() {
        this.db = new Datastore({ filename: this.dbPath, autoload: true });
        this.db.ensureIndex({ fieldName: 'id', unique: true });
    }

    empty(): Promise<{}> {
        return new Promise((resolve) => {
            this.db.remove({}, {multi: true}, () => resolve());
        });
    }

    find(params: {playerNames: string[]}): Rx.Observable<Hand[]> {
        return Rx.Observable.create((subscriber: Rx.Subscriber<Hand[]>) => {
            this.db.find({ playerNames: { $in: params.playerNames } }, (err: any, docs: Hand[]) => {
                if (err) {
                    throw err;
                }
                subscriber.next(docs);
                subscriber.complete();
            });
        });
    }

    upsert(object: Hand|Hand[]) {
        (Array.isArray(object) ? object : [object]).forEach((hand) => {
            let extendedHand = _.extend({playerNames: _.map(hand.players, 'name')}, hand);
            this.db.update({ id: hand.id }, extendedHand, { upsert: true });
        });
    }
}

export default new HandHistoryDatabase();
