import * as _ from 'lodash';

import ActionType from '../models/action-type';
import Hand from '../models/hand';

export default function computeAf(hand: Hand):
    { [s: string]: { af_pre_calls: number, af_pre_bets: number, af_post_calls: number, af_post_bets: number } } {
    let result = {};
    hand.rounds[1].actions.forEach((action) => {
        if (action.type === ActionType.Call) {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_pre_calls) result[action.player.name].af_pre_calls = 0;
            result[action.player.name].af_pre_calls++;
        } if (action.type === ActionType.Bet || action.type === ActionType.Raise) {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_pre_bets) result[action.player.name].af_pre_bets = 0;
            result[action.player.name].af_pre_bets++;
        }
    });
    _(hand.rounds).slice(2, 5).forEach((round) => {
        round.actions.forEach((action) => {
            if (action.type === ActionType.Call) {
                if (!result[action.player.name]) result[action.player.name] = {};
                if (!result[action.player.name].af_post_calls) result[action.player.name].af_post_calls = 0;
                result[action.player.name].af_post_calls++;
            } if (action.type === ActionType.Bet || action.type === ActionType.Raise) {
                if (!result[action.player.name]) result[action.player.name] = {};
                if (!result[action.player.name].af_post_bets) result[action.player.name].af_post_bets = 0;
                result[action.player.name].af_post_bets++;
            }
        });
    });
    return result;
}
