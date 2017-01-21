const fp = require('lodash/fp');
const _ = require('lodash');
const Rx = require('rxjs');

const Action = require('../models/Action.js');
const Card = require('../models/Card.js');
const Hand = require('../models/Hand.js');
const Player = require('../models/Player.js');
const Round = require('../models/Round.js');

/*
 States:
 - 0: waiting for new hand, do nothing
 - 1: new hand line, create hand and go to next state
 - 2: get buttonSeat and go to next state
 - 3: get playerBySeat, go to next state on '***',
 - 4: create round, go to next state,
 - 5: ante & blinds actions, go to next state on 'Dealt to'
 - 6: hero's cards, do nothing for now and go to next state
 - 7: create round, go to next state,
 - 8: skip if line contains '***', create action and go to next state if '***' or end hand parsing if 'SUMMARY'
 */
const goToNextState = {
    0: fp.includes('HandId'),
    1: fp.constant(true),
    2: fp.constant(true),
    3: fp.includes('***'),
    4: fp.constant(true),
    5: fp.includes('Dealt to'),
    6: fp.constant(true),
    7: fp.constant(true),
    8: fp.includes('***')
};

const processLine = {
    0: fp.noop,
    1: parseHandLine,
    2: parseButtonSeat,
    3: parsePlayerBySeat,
    4: parseRoundLine,
    5: parseActionLine,
    6: fp.identity,
    7: parseRoundLine,
    8: parseActionLine
};

const skip = {
    0: fp.constant(false),
    1: fp.constant(false),
    2: fp.constant(false),
    3: fp.constant(false),
    4: fp.constant(false),
    5: fp.constant(false),
    6: fp.constant(false),
    7: fp.constant(false),
    8: fp.includes('***')
};

module.exports = parse;

function parse(rl) {
    let state = 0;
    let hand = void 0;
    const t0 = Date.now();

    return Rx.Observable.create((subscriber) => {
        rl.on('line', (line) => {
            if (goToNextState[state](line)) {
                if (endOfHand(state, line)) {
                    if (!hand) {
                        console.log(hand);
                    }
                    subscriber.next(hand);
                    state = 0;
                } else {
                    do {
                        if (state === 8) {
                            state = 7;
                        } else {
                            state++;
                        }
                    } while (skip[state](line));
                }
            }
            try {
                hand = processLine[state](hand, line);
            } catch(e) {
                state = 0;
            }
        });

        rl.on('close', () => {
            console.log('Duration: ' + (Date.now() - t0) + 'ms');
            subscriber.complete();
        });
    });
}

function endOfHand(state, line) {
    return state === 8 && line.indexOf('SUMMARY') > -1;
}

function parseHandLine(hand, line) {
    const idPrefix = 'HandId: #';

    let split = line.split(' - ');
    let id = split[2].slice(idPrefix.length);
    let date = new Date(split[4]);

    return new Hand(id, date, {}, void 0, []);
}

function parseButtonSeat(hand, line) {
    hand.buttonSeat = parseInt(getStringBetween(line, 'Seat #', ' is the button'));
    return hand;
}

function parsePlayerBySeat(hand, line) {
    const seat = getStringBetween(line, 'Seat ', ': ');
    const playerName = getStringBetween(line, ': ', ' (');
    let playerBySeat = {};
    playerBySeat[seat] = new Player(playerName);
    hand.playerBySeat = fp.extend(hand.playerBySeat, playerBySeat);
    return hand;
}

function parseRoundLine(hand, line) {
    line = line.replace('][', ' ');
    const cardsString = getStringBetween(line, '[', ']');
    let cards = [];
    if (cardsString) {
        cards = fp.map(cardsString.split(' '), (s) => new Card(s));
    }
    hand.rounds.push(new Round(cards, []));
    return hand;
}

function parseActionLine(hand, line) {
    const round = hand.rounds[hand.rounds.length - 1];
    const player = fp.find((p) => line.indexOf(p.name) > -1)(fp.values(hand.playerBySeat));

    round.actions.push(parseAction(player, line.slice(line.indexOf(player.name) + player.name.length + 1)));
    return hand;
}

function parseAction(player, string) {
    let action = void 0;
    let properties = {};
    string = string.replace(' and is all-in', '');
    string = string.replace(' from pot', '');

    const ANTE = 'posts ante';
    const SMALL_BLIND = 'posts small blind';
    const BIG_BLIND = 'posts big blind';
    const CHECK = 'checks';
    const CALL = 'calls';
    const BET = 'bets';
    const RAISE = 'raises';
    const FOLD = 'folds';
    const SHOW = 'shows';
    const COLLECT = 'collected';

    if (string.indexOf(ANTE) > -1) {
        action = 'ANTE';
        properties = {value: parseInt(string.slice(string.indexOf(ANTE) + ANTE.length + 1))};
    } else if (string.indexOf(SMALL_BLIND) > -1) {
        action = 'SMALL_BLIND';
        properties = {value: parseInt(string.slice(string.indexOf(SMALL_BLIND) + SMALL_BLIND.length + 1))};
    } else if (string.indexOf(BIG_BLIND) > -1) {
        action = 'BIG_BLIND';
        properties = {value: parseInt(string.slice(string.indexOf(BIG_BLIND) + BIG_BLIND.length + 1))};
    } else if (string.indexOf(CHECK) > -1) {
        action = 'CHECK';
    } else if (string.indexOf(CALL) > -1) {
        action = 'CALL';
        properties = {value: parseInt(string.slice(string.indexOf(CALL) + CALL.length + 1))};
    } else if (string.indexOf(BET) > -1) {
        action = 'BET';
        properties = {value: parseInt(string.slice(string.indexOf(BET) + BET.length + 1))};
    } else if (string.indexOf(RAISE) > -1) {
        action = 'RAISE';
        const s = string.slice(string.indexOf(RAISE) + RAISE.length + 1).split(' to ');
        properties = {value: parseInt(s[0]), total: parseInt(s[1])};
    } else if (string.indexOf(FOLD) > -1) {
        action = 'FOLD';
    } else if (string.indexOf(SHOW) > -1) {
        action = 'SHOW';
        const s = getStringBetween(string, '[', ']').split(' ');
        properties = {cards: [new Card(s[0]), new Card(s[1])]};
    } else if (string.indexOf(COLLECT) > -1) {
        action = 'COLLECT';
        properties = {value: parseInt(string.slice(string.indexOf(COLLECT) + COLLECT.length + 1))};
    }
    return new Action(player, action, properties);
}

function getStringBetween(line, prefix, suffix) {
    if (line.indexOf(prefix) === -1 || line.indexOf(suffix) === -1) {
        return '';
    }
    return line.slice(line.indexOf(prefix) + prefix.length, line.indexOf(suffix));
}
