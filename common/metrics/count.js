const _ = require('lodash');
/**
 * Returns an increment object for hand count.
 * @param {Hand} hand
 * @returns {{}}
 */
function compute(hand) {
    let result = {};
    _(hand.playerBySeat).forEach((player) => {
        result[player.name] = {count: 1};
    });
    return result;
}

module.exports = compute;
