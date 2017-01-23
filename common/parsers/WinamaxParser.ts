import * as _ from 'lodash';
import * as Rx from 'rxjs';
import * as readline from 'readline';

import RoomParser from './RoomParser';

import Action from '../models/Action';
import ActionType from '../models/ActionType';
import Card from '../models/Card';
import Hand from '../models/Hand';
import Player from '../models/Player';
import Round from '../models/Round';

class WinamaxParser implements RoomParser {

    parse(rl: readline.ReadLine): Rx.Observable<Hand> {
        let state = 0;
        let hand = void 0;

        return Rx.Observable.create((subscriber) => {
            rl.on('line', (line) => {
                if (WinamaxParser.goToNextState[state](line)) {
                    if (WinamaxParser.endOfHand(state, line)) {
                        subscriber.next(hand);
                        state = 0;
                    } else {
                        do {
                            if (state === 8) {
                                state = 7;
                            } else {
                                state++;
                            }
                        } while (WinamaxParser.skipLine[state](line));
                    }
                }
                try {
                    hand = WinamaxParser.lineParser[state](hand, line);
                } catch (e) {
                    state = 0;
                }
            });

            rl.on('close', () => subscriber.complete());
        });
    }

    /* States:
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
    private static goToNextState = {
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

    private static lineParser = {
        0: _.noop,
        1: WinamaxParser.parseHandLine,
        2: WinamaxParser.parseButtonSeat,
        3: WinamaxParser.parsePlayerBySeat,
        4: WinamaxParser.parseRoundLine,
        5: WinamaxParser.parseActionLine,
        6: _.identity,
        7: WinamaxParser.parseRoundLine,
        8: WinamaxParser.parseActionLine
    };

    private static skipLine = {
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

    private static endOfHand(state: number, line: string): boolean {
        return state === 8 && line.indexOf('SUMMARY') > -1;
    }

    private static parseHandLine(hand: Hand, line: string): Hand {
        const idPrefix = 'HandId: #';

        let split = line.split(' - ');
        let id = split[2].slice(idPrefix.length);
        let date = new Date(split[4]);

        return new Hand(id, date, {}, [], void 0, []);
    }

    private static parseButtonSeat(hand: Hand, line: string): Hand {
        hand.buttonSeat = parseInt(
            WinamaxParser.getStringBetween(line, 'Seat #', ' is the button')
        );
        return hand;
    }

    private static parsePlayerBySeat(hand: Hand, line: string): Hand {
        const seat = WinamaxParser.getStringBetween(line, 'Seat ', ': ');
        const playerName = WinamaxParser.getStringBetween(line, ': ', ' (');
        let playerBySeat = {};
        playerBySeat[seat] = new Player(playerName);
        hand.playerBySeat = _.extend(hand.playerBySeat, playerBySeat);
        hand.playerNames.push(playerName);
        return hand;
    }

    private static parseRoundLine(hand: Hand, line: string): Hand {
        line = line.replace('][', ' ');
        const cardsString = WinamaxParser.getStringBetween(line, '[', ']');
        let cards = [];
        if (cardsString) {
            cards = _.map(cardsString.split(' '), (s) => new Card(s));
        }
        hand.rounds.push(new Round(cards, []));
        return hand;
    }

    private static parseActionLine(hand: Hand, line: string): Hand {
        const round = hand.rounds[hand.rounds.length - 1];
        const player = _.find(_.values(hand.playerBySeat), (p) => line.indexOf(p.name) > -1);

        round.actions.push(WinamaxParser.parseAction(
            player,
            line.slice(line.indexOf(player.name) + player.name.length + 1)
        ));
        return hand;
    }

    private static parseAction(player: Player, s: string): Action {
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
            properties = {value: parseInt(s.slice(s.indexOf(ANTE) + ANTE.length + 1))};
        } else if (s.indexOf(SMALL_BLIND) > -1) {
            action = ActionType.SmallBlind;
            properties = {value: parseInt(s.slice(s.indexOf(SMALL_BLIND) + SMALL_BLIND.length + 1))};
        } else if (s.indexOf(BIG_BLIND) > -1) {
            action = ActionType.BigBlind;
            properties = {value: parseInt(s.slice(s.indexOf(BIG_BLIND) + BIG_BLIND.length + 1))};
        } else if (s.indexOf(CHECK) > -1) {
            action = ActionType.Check;
        } else if (s.indexOf(CALL) > -1) {
            action = ActionType.Call;
            properties = {value: parseInt(s.slice(s.indexOf(CALL) + CALL.length + 1))};
        } else if (s.indexOf(BET) > -1) {
            action = ActionType.Bet;
            properties = {value: parseInt(s.slice(s.indexOf(BET) + BET.length + 1))};
        } else if (s.indexOf(RAISE) > -1) {
            action = ActionType.Raise;
            const parsedRaise = s.slice(s.indexOf(RAISE) + RAISE.length + 1).split(' to ');
            properties = {value: parseInt(parsedRaise[0]), total: parseInt(parsedRaise[1])};
        } else if (s.indexOf(FOLD) > -1) {
            action = ActionType.Fold;
        } else if (s.indexOf(SHOW) > -1) {
            action = ActionType.Show;
            const parsedShow = WinamaxParser.getStringBetween(s, '[', ']').split(' ');
            properties = {cards: [new Card(parsedShow[0]), new Card(parsedShow[1])]};
        } else if (s.indexOf(COLLECT) > -1) {
            action = ActionType.Collect;
            properties = {value: parseInt(s.slice(s.indexOf(COLLECT) + COLLECT.length + 1))};
        }
        return new Action(player, action, properties);
    }

    private static getStringBetween(line: string, prefix: string, suffix: string): string {
        if (line.indexOf(prefix) === -1 || line.indexOf(suffix) === -1) {
            return '';
        }
        return line.slice(line.indexOf(prefix) + prefix.length, line.indexOf(suffix));
    }
}

export default new WinamaxParser();
