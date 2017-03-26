import * as _ from 'lodash';
import Round from './round';
import Player from './player';
import ActionType from './action-type';

export default class Hand {

    constructor(
        public id: string,
        public date: Date,
        public players: Player[],
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

    getShowdown(): Round | undefined {
        return _.get(this.rounds, 5, undefined);
    }
}
