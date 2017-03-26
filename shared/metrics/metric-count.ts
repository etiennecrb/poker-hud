import * as _ from 'lodash'

import Hand from '../models/hand';

export default function computeCount(hand: Hand): { [s: string]: { count: number } } {
    let result = {};
    _(hand.players).forEach((player) => {
        result[player.name] = { count: 1 };
    });
    return result;
}
