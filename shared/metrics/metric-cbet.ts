import * as _ from 'lodash';

import ActionType from '../models/action-type';
import Hand from '../models/hand';

export default function computeCbet(hand: Hand):
    { [s: string]: { cbet_p: number, cbet_n: number, cbet_fold_p: number, cbet_fold_n: number } } {
    let result = {};
    const lastPreFlopRaise = _(hand.getPreFlop().actions).filter({ type: ActionType.Raise }).last();
    const flop = hand.getFlop();

    if (lastPreFlopRaise && flop && flop.actions.length) {
        let cbetOpportunity = true;
        let i = 0;
        while (i < flop.actions.length && flop.actions[i].player.name !== lastPreFlopRaise.player.name) {
            if (flop.actions[i].type === ActionType.Bet) {
                cbetOpportunity = false;
            }
            i++;
        }
        if (cbetOpportunity && flop.actions[i] && flop.actions[i].type !== ActionType.Collect) {
            if (flop.actions[i].type === ActionType.Bet) {
                result[lastPreFlopRaise.player.name] = { cbet_p: 1 };
                let j = i + 1;
                while (j < flop.actions.length && flop.actions[j].player.name !== lastPreFlopRaise.player.name) {
                    if (flop.actions[j].type === ActionType.Fold) {
                        result[flop.actions[j].player.name] = { cbet_fold_p: 1 };
                    } else {
                        result[flop.actions[j].player.name] = { cbet_fold_n: 1 };
                    }
                    j++;
                }
            } else {
                result[lastPreFlopRaise.player.name] = { cbet_n: 1 };
            }
        }
    }
    return result;
}
