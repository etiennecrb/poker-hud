const _ = require('lodash');

/**
 * Returns an increment object for calls, raises and bets.
 * Increment object contains:
 *   - af_pre_calls: nb of calls preflop
 *   - af_post_calls: nb of calls postflop
 *   - af_pre_bets: nb of bets or raises preflop
 *   - af_post_bets: nb of bets or raises postflop
 * @param {Hand} hand
 * @returns {{}}
 */
function compute(hand) {
    let result = {};
    hand.rounds[1].actions.forEach(function (action) {
        if (action.type === 'CALL') {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_pre_calls) result[action.player.name].af_pre_calls = 0;
            result[action.player.name].af_pre_calls++;
        } if (action.type === 'BET' || action.type === 'RAISE') {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_pre_bets) result[action.player.name].af_pre_bets = 0;
            result[action.player.name].af_pre_bets++;
        }
    });
    _(hand.rounds).slice(2, 5).map('actions').flatten().forEach(function (action) {
        if (action.type === 'CALL') {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_post_calls) result[action.player.name].af_post_calls = 0;
            result[action.player.name].af_post_calls++;
        } if (action.type === 'BET' || action.type === 'RAISE') {
            if (!result[action.player.name]) result[action.player.name] = {};
            if (!result[action.player.name].af_post_bets) result[action.player.name].af_post_bets = 0;
            result[action.player.name].af_post_bets++;
        }
    });
    return result;
}

module.exports = compute;