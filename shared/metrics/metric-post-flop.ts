import * as _ from 'lodash';

import ActionType from '../models/action-type';
import Hand from '../models/hand';

export default function computePostFlopStats(hand: Hand): {
    [s: string]: {
        flop: { raise: number, call: number, check: number, fold: number },
        turn: { raise: number, call: number, check: number, fold: number },
        river: { raise: number, call: number, check: number, fold: number },
    }
} {
    const metrics = {
        flop: { raise: 0, call: 0, check: 0, fold: 0 },
        turn: { raise: 0, call: 0, check: 0, fold: 0 },
        river: { raise: 0, call: 0, check: 0, fold: 0 },
    };

    let result = {};
    hand.players.forEach((player) => {
        result[player.name] = _.cloneDeep(metrics);
    });

    const rounds = { flop: hand.getFlop(), turn: hand.getTurn(), river: hand.getRiver() };
    _.forEach(rounds, (round, key) => {
        if (round) {
            round.actions.forEach((action) => {
                if (action.type == ActionType.Bet || action.type == ActionType.Raise) {
                    result[action.player.name][key].raise++;
                } else if (action.type == ActionType.Call) {
                    result[action.player.name][key].call++;
                } else if (action.type == ActionType.Check) {
                    result[action.player.name][key].check++;
                } else if (action.type == ActionType.Fold) {
                    result[action.player.name][key].fold++;
                }
            });
        }
    });
    return result;
}
