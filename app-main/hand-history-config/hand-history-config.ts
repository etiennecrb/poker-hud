import { Injectable } from '@angular/core';
import * as _ from 'lodash';

@Injectable()
export class HandHistoryConfig {
    private handHistories:Array<any>;

    constructor() {
        this.handHistories = [];
    }

    getAll() {
        return this.handHistories.slice(0);
    }

    getHandHistoryByRoom(room:string) {
        return _.find(this.handHistories, {room: room});
    }

    setHandHistory(handHistory) {
        _.remove(this.handHistories, {room: handHistory.room});
        this.handHistories.push(handHistory);
    }

    removeHandHistory(handHistory) {
        _.remove(this.handHistories, {room: handHistory.room});
    }
}
