import * as _ from 'lodash';
import Round from './Round';
import Player from './Player';
import ActionType from './ActionType';

export default class Hand {

    constructor(
        public id: string,
        public date: Date,
        public playerBySeat: { [i: number]: Player },
        public playerNames: string[],
        public buttonSeat: Number,
        public rounds: Round[]
    ) {}

    getBlindsRound(): Round {
        return this.rounds[0];
    }

    getBigBlindPlayer(): Player {
        return _.find(this.getBlindsRound().actions, {'type': ActionType.BigBlind}).player;
    }

    getPreFlop(): Round | undefined {
        return _.get(this.rounds, 1, undefined);
    }

    getFlop(): Round | undefined {
        return _.get(this.rounds, 2, undefined);
    }

    getTurn(): Round | undefined {
        return _.get(this.rounds, 3, undefined);
    }

    getRiver(): Round | undefined {
        return _.get(this.rounds, 4, undefined);
    }
}
