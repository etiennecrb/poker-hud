import * as _ from 'lodash';
import * as Rx from 'rxjs';
import * as readline from 'readline';

import Action from '../models/action';
import ActionType from '../models/action-type';
import Card from '../models/card';
import Hand from '../models/hand';
import Player from '../models/player';
import Round from '../models/round';
import { getStringBetween } from './utils';

export function parse(rl: readline.ReadLine): Promise<Hand[]> {
    /* States:
    - 0: waiting for new hand, do nothing
    - 1: new hand line, create hand and go to next state
    - 2: get buttonSeat and go to next state
    - 3: get players, go to next state on '***',
    - 4: create round, go to next state,
    - 5: ante & blinds actions, go to next state on 'Dealt to'
    - 6: hero's cards, do nothing for now and go to next state
    - 7: create round, go to next state,
    - 8: skip if line contains '***', create action and go to next state if '***' or end hand parsing if 'SUMMARY'
    */

    const parseLine = {
        0: _.noop,
        1: parseHandLine,
        2: parseButtonSeat,
        3: parsePlayers,
        4: parseRoundLine,
        5: parseActionLine,
        6: _.identity,
        7: parseRoundLine,
        8: parseActionLine
    };

    const shouldGoToNextState = {
        0: (line) => _.includes(line, 'HandId'),
        1: _.constant(true),
        2: _.constant(true),
        3: (line) => _.includes(line, '***'),
        4: _.constant(true),
        5: (line) => _.includes(line, 'Dealt to'),
        6: _.constant(true),
        7: _.constant(true),
        8: (line) => _.includes(line, '***')
    };

    const shouldSkipLine = {
        0: _.constant(false),
        1: _.constant(false),
        2: _.constant(false),
        3: _.constant(false),
        4: _.constant(false),
        5: _.constant(false),
        6: _.constant(false),
        7: _.constant(false),
        8: (line) => _.includes(line, '***')
    };

    const hands = [];
    let state = 0;
    let hand = void 0;

    return new Promise((resolve) => {
        rl.on('line', (line) => {
            if (shouldGoToNextState[state](line)) {
                if (endOfHand(line)) {
                    hands.push(hand);
                    state = 0;
                } else {
                    do {
                        if (state === 8) {
                            state = 7;
                        } else {
                            state++;
                        }
                    } while (shouldSkipLine[state](line));
                }
            }
            try {
                hand = parseLine[state](hand, line);
            } catch (e) {
                state = 0;
            }
        });

        rl.on('close', () => {
            resolve(hands);
        });
    });
};

function endOfHand(line: string): boolean {
    return line.indexOf('*** SUMMARY ***') > -1;
}

function parseHandLine(hand: Hand, line: string): Hand {
    const idPrefix = 'HandId: #';

    let split = line.replace(/".+"/, '').split(' - ');
    let id = split[2].slice(idPrefix.length);
    let date = new Date(split[4]);

    return new Hand(id, date, [], void 0, []);
}

function parseButtonSeat(hand: Hand, line: string): Hand {
    hand.buttonSeat = parseInt(
        getStringBetween(line, 'Seat #', ' is the button')
    );
    return hand;
}

function parsePlayers(hand: Hand, line: string): Hand {
    const seat = getStringBetween(line, 'Seat ', ': ');
    const playerName = getStringBetween(line, ': ', ' (');
    hand.players.push(new Player(playerName, parseInt(seat)));
    return hand;
}

function parseRoundLine(hand: Hand, line: string): Hand {
    line = line.replace('][', ' ');
    const cardsString = getStringBetween(line, '[', ']');
    let cards = [];
    if (cardsString) {
        cards = _.map(cardsString.split(' '), (s) => new Card(s));
    }
    hand.rounds.push(new Round(cards, []));
    return hand;
}

function parseActionLine(hand: Hand, line: string): Hand {
    const round = hand.rounds[hand.rounds.length - 1];
    const player = _.find(hand.players, p => line.indexOf(p.name) > -1);

    round.actions.push(parseAction(
        player,
        line.slice(line.indexOf(player.name) + player.name.length + 1)
    ));
    return hand;
}

function parseAction(player: Player, s: string): Action {
    let action = void 0;
    let properties = {};
    s = s.replace(' and is all-in', '');
    s = s.replace(' from pot', '');

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

    if (s.indexOf(ANTE) > -1) {
        action = ActionType.Ante;
        properties = { value: parseInt(s.slice(s.indexOf(ANTE) + ANTE.length + 1)) };
    } else if (s.indexOf(SMALL_BLIND) > -1) {
        action = ActionType.SmallBlind;
        properties = { value: parseInt(s.slice(s.indexOf(SMALL_BLIND) + SMALL_BLIND.length + 1)) };
    } else if (s.indexOf(BIG_BLIND) > -1) {
        action = ActionType.BigBlind;
        properties = { value: parseInt(s.slice(s.indexOf(BIG_BLIND) + BIG_BLIND.length + 1)) };
    } else if (s.indexOf(CHECK) > -1) {
        action = ActionType.Check;
    } else if (s.indexOf(CALL) > -1) {
        action = ActionType.Call;
        properties = { value: parseInt(s.slice(s.indexOf(CALL) + CALL.length + 1)) };
    } else if (s.indexOf(BET) > -1) {
        action = ActionType.Bet;
        properties = { value: parseInt(s.slice(s.indexOf(BET) + BET.length + 1)) };
    } else if (s.indexOf(RAISE) > -1) {
        action = ActionType.Raise;
        const parsedRaise = s.slice(s.indexOf(RAISE) + RAISE.length + 1).split(' to ');
        properties = { value: parseInt(parsedRaise[0]), total: parseInt(parsedRaise[1]) };
    } else if (s.indexOf(FOLD) > -1) {
        action = ActionType.Fold;
    } else if (s.indexOf(SHOW) > -1) {
        action = ActionType.Show;
        const parsedShow = getStringBetween(s, '[', ']').split(' ');
        properties = { cards: [new Card(parsedShow[0]), new Card(parsedShow[1])] };
    } else if (s.indexOf(COLLECT) > -1) {
        action = ActionType.Collect;
        properties = { value: parseInt(s.slice(s.indexOf(COLLECT) + COLLECT.length + 1)) };
    }
    return new Action(player, action, properties);
}
