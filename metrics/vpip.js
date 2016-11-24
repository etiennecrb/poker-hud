/**
 * Returns an increment object for voluntary put money in the pot and voluntary not put money in the pot.
 * Increment object is either:
 *   - {vpip: 1} if player calls and is not the BB, bets or raises
 *   - {vnpip: 1} if player folds
 * @param {Hand} hand
 * @returns {{}}
 */
function compute(hand) {
    const bbPlayer = hand.getBigBlindPlayer();
    let result = {};
    hand.getPreFlop().actions.forEach(function (action) {
        if (isActionPfr(action) && !result[action.player.name]) {
            result[action.player.name] = {pfr: 1, vpip: 1};
        } else if (isActionVpip(bbPlayer, action) && !result[action.player.name]) {
            result[action.player.name] = {vpip: 1};
        } else if (isActionVnpip(action) && !result[action.player.name]) {
            result[action.player.name] = {vnpip: 1};
        }
    });
    return result;
}

function isActionPfr(action) {
    return action.type === 'RAISE';
}

function isActionVpip(bbPlayer, action) {
    return (action.type === 'CALL' && action.player !== bbPlayer) || action.type === 'BET' || action.type === 'RAISE';
}

function isActionVnpip(action) {
    return action.type === 'FOLD';
}

module.exports = compute;