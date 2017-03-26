import * as _ from 'lodash';
import * as readline from 'readline';
import { Readable } from 'stream';
import * as test  from 'tape';

import Player from '../../models/player';
import { parse } from '../parser-winamax';
import Action from '../../models/action';
import ActionType from '../../models/action-type';
import Hand from "../../models/hand";
import Round from "../../models/round";
import Card from "../../models/card";

test('Parse function output type', t => {
    t.plan(2);
    const promise = parse(createReadlineFromString(''));
    t.equal(typeof promise.then, 'function', 'parse should return a promise');
    promise.then(hands => {
        t.ok(Array.isArray(hands), 'promise should return an array');
    });
});

test('Number of hands returned', t => {
    t.plan(2);

    const rawHand1 = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***
        Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***


        Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***`;

    parse(createReadlineFromString(rawHand1)).then(hands => {
        t.equal(hands.length, 3, 'it parses the correct number of hands');
    });

    const rawHand2 = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***
        Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** UNKNOWN STATE ***
        TiennouFurax does something weird
        *** SUMMARY ***


        Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***`;

    parse(createReadlineFromString(rawHand2)).then(hands => {
        t.equal(hands.length, 2, 'it parses only valid hands');
    });
});

test('Hand properties parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        *** SUMMARY ***`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];
        const expectedId = '810940995725164559-1-1489863683';
        const expectedDate = new Date('2017/03/18 19:01:23 UTC');
        const expectedButtonSeat = 5;
        t.equal(hand.id, expectedId , 'it parses hand id');
        t.equal(hand.date.getTime(), expectedDate.getTime(), 'it parses hand date');
        t.equal(hand.buttonSeat, expectedButtonSeat, 'it parses button seat');
        t.end();
    });
});

test('Players parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.81€ + 0.20€ level:  - HandId: #810940995725164559-1-1489863683 - Holdem no limit (50/100) - 2017/03/18 19:01:23 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #5 is the button
        Seat 1: intermimi (10000)
        Seat 5: TiennouFurax (10000)
        Seat 6: Loulou Furax (10000)
        *** SUMMARY ***`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];
        const expectedPlayers = [
            new Player('intermimi', 1),
            new Player('TiennouFurax', 5),
            new Player('Loulou Furax', 6)
        ];
        t.ok(_.isEqual(hand.players, expectedPlayers) , 'it parses names (even with spaces) and seat');
        t.end();
    });
});

test('Ante & blinds parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 17 - HandId: #810940995725164547-202-1489871581 - Holdem no limit (500/2000/4000) - 2017/03/18 21:13:01 UTC
        Table: 'Hold'em [180 Max](188811914)#02' 6-max (real money) Seat #6 is the button
        Seat 1: Edmond_Vidal (36354)
        Seat 3: Krudtmejer (78981)
        Seat 4: fuoco92 (147376)
        Seat 5: TiennouFurax (94074)
        Seat 6: - Jk84 - (139666)
        *** ANTE/BLINDS ***
        Edmond_Vidal posts ante 500
        Krudtmejer posts ante 500
        fuoco92 posts ante 500
        TiennouFurax posts ante 500
        - Jk84 - posts ante 500
        Edmond_Vidal posts small blind 2000
        Krudtmejer posts big blind 4000
        Dealt to TiennouFurax [Jc Jd]
        *** SUMMARY ***`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];
        const actions = [
            new Action(findPlayer(hand, 'Edmond_Vidal') , ActionType.Ante, {value: 500}),
            new Action(findPlayer(hand, 'Krudtmejer') , ActionType.Ante, {value: 500}),
            new Action(findPlayer(hand, 'fuoco92') , ActionType.Ante, {value: 500}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Ante, {value: 500}),
            new Action(findPlayer(hand, '- Jk84 -') , ActionType.Ante, {value: 500}),
            new Action(findPlayer(hand, 'Edmond_Vidal') , ActionType.SmallBlind, {value: 2000}),
            new Action(findPlayer(hand, 'Krudtmejer') , ActionType.BigBlind, {value: 4000})
        ];
        const expectedRound = new Round([], actions);
        t.ok(_.isEqual(hand.getBlindsRound(), expectedRound) , 'it parses ante and blinds actions');
        t.end();
    });
});

test('Preflop parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level:  - HandId: #810940995725164559-6-1489863802 - Holdem no limit (50/100) - 2017/03/18 19:03:22 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #6 is the button
        Seat 1: intermimi (10050)
        Seat 2: JmB0 (10000)
        Seat 3: pschitcitron (18350)
        Seat 5: TiennouFurax (10300)
        Seat 6: gautron72 (10600)
        *** ANTE/BLINDS ***
        intermimi posts small blind 50
        JmB0 posts big blind 100
        Dealt to TiennouFurax [Kh Js]
        *** PRE-FLOP *** 
        pschitcitron folds
        TiennouFurax raises 150 to 250
        gautron72 folds
        intermimi folds
        JmB0 folds
        TiennouFurax collected 400 from pot
        *** SUMMARY ***
        Total pot 400 | No rake
        Seat 5: TiennouFurax won 400`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];
        const actions = [
            new Action(findPlayer(hand, 'pschitcitron') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Raise, {value: 150, total: 250}),
            new Action(findPlayer(hand, 'gautron72') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'intermimi') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'JmB0') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Collect, {value: 400}),
        ];
        const expectedRound = new Round([], actions);
        t.ok(_.isEqual(hand.getPreFlop(), expectedRound) , 'it parses preflop round');
        t.end();
    });
});

test('Flop parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 4 - HandId: #810940995725164559-28-1489864871 - Holdem no limit (100/200) - 2017/03/18 19:21:11 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #4 is the button
        Seat 1: intermimi (9600)
        Seat 2: JmB0 (20694)
        Seat 3: pschitcitron (18447)
        Seat 4: RoadToFish (14884)
        Seat 5: TiennouFurax (4398)
        Seat 6: gautron72 (1277)
        *** ANTE/BLINDS ***
        TiennouFurax posts small blind 100
        gautron72 posts big blind 200
        Dealt to TiennouFurax [5c 6s]
        *** PRE-FLOP *** 
        intermimi raises 200 to 400
        JmB0 folds
        pschitcitron folds
        RoadToFish folds
        TiennouFurax folds
        gautron72 calls 200
        *** FLOP *** [9d Qd 4h]
        gautron72 checks
        intermimi bets 450
        gautron72 folds
        intermimi collected 1350 from pot
        *** SUMMARY ***
        Total pot 1350 | No rake
        Board: [9d Qd 4h]
        Seat 1: intermimi won 1350`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];

        const expectedCards = [new Card('9d'), new Card('Qd'), new Card('4h')];
        const expectedActions = [
            new Action(findPlayer(hand, 'gautron72') , ActionType.Check, {}),
            new Action(findPlayer(hand, 'intermimi') , ActionType.Bet, {value: 450}),
            new Action(findPlayer(hand, 'gautron72') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'intermimi') , ActionType.Collect, {value: 1350}),
        ];
        t.ok(_.isEqual(hand.getFlop().cards, expectedCards) , 'it parses flop cards');
        t.ok(_.isEqual(hand.getFlop().actions, expectedActions) , 'it parses flop actions');
        t.end();
    });
});

test('Turn parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 6 - HandId: #810940995725164559-50-1489865549 - Holdem no limit (25/150/300) - 2017/03/18 19:32:29 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #2 is the button
        Seat 1: Le.Suisse (10000)
        Seat 2: JmB0 (14233)
        Seat 3: pschitcitron (18197)
        Seat 4: RoadToFish (14634)
        Seat 5: TiennouFurax (18049)
        Seat 6: gautron72 (4187)
        *** ANTE/BLINDS ***
        pschitcitron posts ante 25
        RoadToFish posts ante 25
        Le.Suisse posts ante 25
        JmB0 posts ante 25
        TiennouFurax posts ante 25
        gautron72 posts ante 25
        pschitcitron posts small blind 150
        RoadToFish posts big blind 300
        Dealt to TiennouFurax [9s 7s]
        *** PRE-FLOP *** 
        TiennouFurax folds
        gautron72 folds
        Le.Suisse calls 300
        JmB0 calls 300
        pschitcitron calls 150
        RoadToFish checks
        *** FLOP *** [6s Qh Kh]
        pschitcitron checks
        RoadToFish checks
        Le.Suisse bets 675
        JmB0 folds
        pschitcitron calls 675
        RoadToFish folds
        *** TURN *** [6s Qh Kh][7d]
        pschitcitron checks
        Le.Suisse bets 1350
        pschitcitron folds
        Le.Suisse collected 4050 from pot
        *** SUMMARY ***
        Total pot 4050 | No rake
        Board: [6s Qh Kh 7d]
        Seat 1: Le.Suisse won 4050`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];

        const expectedCards = [new Card('6s'), new Card('Qh'), new Card('Kh'), new Card('7d')];
        const expectedActions = [
            new Action(findPlayer(hand, 'pschitcitron') , ActionType.Check, {}),
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Bet, {value: 1350}),
            new Action(findPlayer(hand, 'pschitcitron') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Collect, {value: 4050}),
        ];
        t.ok(_.isEqual(hand.getTurn().cards, expectedCards) , 'it parses turn cards');
        t.ok(_.isEqual(hand.getTurn().actions, expectedActions) , 'it parses turn actions');
        t.end();
    });
});

test('River parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 6 - HandId: #810940995725164559-51-1489865625 - Holdem no limit (25/150/300) - 2017/03/18 19:33:45 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #3 is the button
        Seat 1: Le.Suisse (11700)
        Seat 2: JmB0 (13908)
        Seat 3: pschitcitron (17197)
        Seat 4: RoadToFish (14309)
        Seat 5: TiennouFurax (18024)
        Seat 6: gautron72 (4162)
        *** ANTE/BLINDS ***
        RoadToFish posts ante 25
        TiennouFurax posts ante 25
        Le.Suisse posts ante 25
        JmB0 posts ante 25
        pschitcitron posts ante 25
        gautron72 posts ante 25
        RoadToFish posts small blind 150
        TiennouFurax posts big blind 300
        Dealt to TiennouFurax [Ad 2s]
        *** PRE-FLOP *** 
        gautron72 folds
        Le.Suisse calls 300
        JmB0 folds
        pschitcitron folds
        RoadToFish folds
        TiennouFurax checks
        *** FLOP *** [Ah 6d 6h]
        TiennouFurax checks
        Le.Suisse bets 450
        TiennouFurax calls 450
        *** TURN *** [Ah 6d 6h][Qc]
        TiennouFurax checks
        Le.Suisse checks
        *** RIVER *** [Ah 6d 6h Qc][Qs]
        TiennouFurax bets 1200
        Le.Suisse folds
        *** SUMMARY ***
        Total pot 4200 | No rake
        Board: [Ah 6d 6h Qc Qs]
        Seat 1: Le.Suisse showed [3c As] and won 2100 with Two pairs : Aces and Queens
        Seat 5: TiennouFurax (big blind) showed [Ad 2s] and won 2100 with Two pairs : Aces and Queens`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];

        const expectedCards = [new Card('Ah'), new Card('6d'), new Card('6h'), new Card('Qc'), new Card('Qs')];
        const expectedActions = [
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Bet, {value: 1200}),
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Fold, {})
        ];
        t.ok(_.isEqual(hand.getRiver().cards, expectedCards) , 'it parses river cards');
        t.ok(_.isEqual(hand.getRiver().actions, expectedActions) , 'it parses river actions');
        t.end();
    });
});

test('Showdown parsing', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 6 - HandId: #810940995725164559-51-1489865625 - Holdem no limit (25/150/300) - 2017/03/18 19:33:45 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #3 is the button
        Seat 1: Le.Suisse (11700)
        Seat 2: JmB0 (13908)
        Seat 3: pschitcitron (17197)
        Seat 4: RoadToFish (14309)
        Seat 5: TiennouFurax (18024)
        Seat 6: gautron72 (4162)
        *** ANTE/BLINDS ***
        RoadToFish posts ante 25
        TiennouFurax posts ante 25
        Le.Suisse posts ante 25
        JmB0 posts ante 25
        pschitcitron posts ante 25
        gautron72 posts ante 25
        RoadToFish posts small blind 150
        TiennouFurax posts big blind 300
        Dealt to TiennouFurax [Ad 2s]
        *** PRE-FLOP *** 
        gautron72 folds
        Le.Suisse calls 300
        JmB0 folds
        pschitcitron folds
        RoadToFish folds
        TiennouFurax checks
        *** FLOP *** [Ah 6d 6h]
        TiennouFurax checks
        Le.Suisse bets 450
        TiennouFurax calls 450
        *** TURN *** [Ah 6d 6h][Qc]
        TiennouFurax checks
        Le.Suisse checks
        *** RIVER *** [Ah 6d 6h Qc][Qs]
        TiennouFurax bets 1200
        Le.Suisse calls 1200
        *** SHOW DOWN ***
        Le.Suisse shows [3c As] (Two pairs : Aces and Queens)
        TiennouFurax shows [Ad 2s] (Two pairs : Aces and Queens)
        TiennouFurax collected 2100 from pot
        Le.Suisse collected 2100 from pot
        *** SUMMARY ***
        Total pot 4200 | No rake
        Board: [Ah 6d 6h Qc Qs]
        Seat 1: Le.Suisse showed [3c As] and won 2100 with Two pairs : Aces and Queens
        Seat 5: TiennouFurax (big blind) showed [Ad 2s] and won 2100 with Two pairs : Aces and Queens`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];

        const expectedActions = [
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Show,
                {cards: [new Card('3c'), new Card('As')]}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Show,
                {cards: [new Card('Ad'), new Card('2s')]}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Collect, {value: 2100}),
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Collect, {value: 2100})
        ];
        t.ok(_.isEqual(hand.getShowdown().cards, []) , 'it parses no cards on showdown');
        t.ok(_.isEqual(hand.getShowdown().actions, expectedActions) , 'it parses showdown actions');
        t.end();
    });
});

test('All-in handling', t => {
    const rawHand = `Winamax Poker - Tournament "Hold'em [180 Max]" buyIn: 1.80€ + 0.20€ level: 6 - HandId: #810940995725164559-55-1489865812 - Holdem no limit (25/150/300) - 2017/03/18 19:36:52 UTC
        Table: 'Hold'em [180 Max](188811914)#14' 6-max (real money) Seat #1 is the button
        Seat 1: Le.Suisse (10973)
        Seat 2: JmB0 (19428)
        Seat 3: pschitcitron (12704)
        Seat 4: RoadToFish (14059)
        Seat 5: TiennouFurax (17924)
        Seat 6: gautron72 (4212)
        *** ANTE/BLINDS ***
        JmB0 posts ante 25
        pschitcitron posts ante 25
        Le.Suisse posts ante 25
        RoadToFish posts ante 25
        TiennouFurax posts ante 25
        gautron72 posts ante 25
        JmB0 posts small blind 150
        pschitcitron posts big blind 300
        Dealt to TiennouFurax [3h Ah]
        *** PRE-FLOP *** 
        RoadToFish folds
        TiennouFurax raises 300 to 600
        gautron72 calls 600
        Le.Suisse folds
        JmB0 calls 450
        pschitcitron raises 2550 to 3150
        TiennouFurax folds
        gautron72 raises 1037 to 4187 and is all-in
        JmB0 folds
        pschitcitron calls 1037
        *** FLOP *** [7s 8d 6d]
        *** TURN *** [7s 8d 6d][4h]
        *** RIVER *** [7s 8d 6d 4h][Tc]
        *** SHOW DOWN ***
        pschitcitron shows [Kd Ac] (High card : Ace)
        gautron72 shows [Ts Qd] (One pair : Tens)
        gautron72 collected 9724 from pot
        *** SUMMARY ***
        Total pot 9724 | No rake
        Board: [7s 8d 6d 4h Tc]
        Seat 3: pschitcitron (big blind) showed [Kd Ac] and lost with High card : Ace
        Seat 6: gautron72 showed [Ts Qd] and won 9724 with One pair : Tens`;

    parse(createReadlineFromString(rawHand)).then(hands => {
        const hand = hands[0];

        const expectedPreFlopActions = [
            new Action(findPlayer(hand, 'RoadToFish') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Raise, {value: 300, total: 600}),
            new Action(findPlayer(hand, 'gautron72') , ActionType.Call, {value: 600}),
            new Action(findPlayer(hand, 'Le.Suisse') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'JmB0') , ActionType.Call, {value: 450}),
            new Action(findPlayer(hand, 'pschitcitron') , ActionType.Raise, {value: 2550, total: 3150}),
            new Action(findPlayer(hand, 'TiennouFurax') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'gautron72') , ActionType.Raise, {value: 1037, total: 4187}),
            new Action(findPlayer(hand, 'JmB0') , ActionType.Fold, {}),
            new Action(findPlayer(hand, 'pschitcitron') , ActionType.Call, {value: 1037}),
        ];
        const board = [new Card('7s'), new Card('8d'), new Card('6d'), new Card('4h'), new Card('Tc')];
        t.ok(_.isEqual(hand.getPreFlop().actions, expectedPreFlopActions) ,
            'it parses preflop actions with a player all-in');
        t.ok(_.isEqual(hand.getFlop().cards, board.slice(0, 3)) , 'it parses flop cards');
        t.ok(_.isEqual(hand.getFlop().actions, []) , 'it parses a flop without actions');
        t.ok(_.isEqual(hand.getTurn().cards, board.slice(0, 4)) , 'it parses turn cards');
        t.ok(_.isEqual(hand.getTurn().actions, []) , 'it parses a turn without actions');
        t.ok(_.isEqual(hand.getRiver().cards, board.slice(0, 5)) , 'it parses river cards');
        t.ok(_.isEqual(hand.getRiver().actions, []) , 'it parses a river without actions');
        t.end();
    });
})

function createReadlineFromString(s: string): readline.ReadLine {
    let r = new Readable();
    r.push(s);
    r.push(null); // EOF
    return readline.createInterface({ input: r });
}

function findPlayer(hand: Hand, name: string): any {
    return _.find(hand.players, {'name': name});
}