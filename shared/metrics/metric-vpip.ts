import ActionType from '../models/action-type';
import Hand from '../models/hand';

export default function computeVpip(hand: Hand): { [s: string]: { vpip: number, vnpip: number, pfr: number } } {
    const bbPlayer = hand.getBigBlindPlayer();
    let result = {};
    hand.getPreFlop().actions.forEach(function (action) {
        if (isActionPfr(action) && !result[action.player.name]) {
            result[action.player.name] = { pfr: 1, vpip: 1 };
        } else if (isActionVpip(bbPlayer, action) && !result[action.player.name]) {
            result[action.player.name] = { vpip: 1 };
        } else if (isActionVnpip(action) && !result[action.player.name]) {
            result[action.player.name] = { vnpip: 1 };
        }
    });
    return result;
}

function isActionPfr(action) {
    return action.type === ActionType.Raise;
}

function isActionVpip(bbPlayer, action) {
    return (action.type === ActionType.Call && action.player !== bbPlayer) || action.type === ActionType.Bet ||
        action.type === ActionType.Raise;
}

function isActionVnpip(action) {
    return action.type === ActionType.Fold;
}
