const _ = require('lodash');

/**
 * Returns an increment object for cbet and cbet folds.
 * Increment object contains:
 *   - cbet_p: nb of cbet
 *   - cbet_n: nb of check instead of cbet if opportunity
 *   - cbet_fold_p: nb of fold on cbet
 *   - cbet_fold_n: nb of call or raise on cbet
 * @param {Hand} hand
 * @returns {{}}
 */
function compute(hand) {
    let result = {};
    const lastPreFlopRaise = _(hand.getPreFlop().actions).filter({type: 'RAISE'}).last();
    const flop = hand.getFlop();
    if (lastPreFlopRaise && flop && flop.actions.length) {
        let cbetOpportunity = true;
        let i = 0;
        while (flop.actions[i].player !== lastPreFlopRaise.player) {
            if (flop.actions[i].type === 'BET') {
                cbetOpportunity = false;
            }
            i++;
        }
        if (cbetOpportunity && flop.actions[i].type !== 'COLLECT') {
            if (flop.actions[i].type === 'BET' ) {
                result[lastPreFlopRaise.player.name] = {cbet_p: 1};
                let j = i+1;
                while (j < flop.actions.length && flop.actions[j].player !== lastPreFlopRaise.player) {
                    if (flop.actions[j].type === 'FOLD') {
                        result[flop.actions[j].player.name] = {cbet_fold_p: 1};
                    } else {
                        result[flop.actions[j].player.name] = {cbet_fold_n: 1};
                    }
                    j++;
                }
            } else {
                result[lastPreFlopRaise.player.name] = {cbet_n: 1};
            }
        }
    }
    return result;
}

module.exports = compute;