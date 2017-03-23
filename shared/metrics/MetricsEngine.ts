import * as _ from 'lodash';
import Hand from "../models/Hand";
import Player from "../models/Player";
import MetricsObject from "./MetricsObject";
import ActionType from "../models/ActionType";

class MetricsEngine {
    private static stats: string[] = ['computeCount', 'computeVpip', 'computeAf',
        'computeCbet', 'computePostFlopStats'];

    static compute(hands: Hand[], players: Player[]): { [s: string]: MetricsObject } {
        const playerNames = _.map(players, 'name');
        const results = {};
        hands.forEach((hand) => {
            MetricsEngine.stats.forEach((s) => {
                _(MetricsEngine[s](hand)).pick(playerNames).forEach((incrementObject, playerName) => {
                    if (!results[playerName]) {
                        results[playerName] = {};
                    }
                    _(incrementObject).forEach((value, metric) => {
                        if (_.isPlainObject(value)) {
                            // Handle stats by round
                            if (!results[playerName][metric]) {
                                results[playerName][metric] = { opp: 0 };
                            }
                            _(value).forEach((actionValue, action) => {
                                if (!results[playerName][metric][action]) {
                                    results[playerName][metric][action] = 0;
                                }
                                results[playerName][metric][action] += actionValue;
                            });
                        } else {
                            if (!results[playerName][metric]) {
                                results[playerName][metric] = 0;
                            }
                            results[playerName][metric] += value;
                        }
                    });
                });
            });
        });

        const metricsByPlayer = {};
        playerNames.forEach((playerName: string) => {
            metricsByPlayer[playerName] = MetricsEngine.buildMetricsObject(results[playerName]);
        });
        return metricsByPlayer;
    }

    private static buildMetricsObject(metrics: {}): MetricsObject {
        const metricsObject = {
            count: 0,
            vpip: null,
            pfr: null,
            af: null,
            cbet: null,
            cbet_opp: null,
            cbet_fold: null,
            cbet_fold_opp: null,
            flop: {
                opp: 0,
                raise: null,
                call: null,
                check: null,
                fold: null
            },
            turn: {
                opp: 0,
                raise: null,
                call: null,
                check: null,
                fold: null
            },
            river: {
                opp: 0,
                raise: null,
                call: null,
                check: null,
                fold: null
            }
        };

        const count = _.get(metrics, 'count', 0);
        const vpip = _.get(metrics, 'vpip', 0);
        const pfr = _.get(metrics, 'pfr', 0);
        const vnpip = _.get(metrics, 'vnpip', 0);
        const af_pre_calls = _.get(metrics, 'af_pre_calls', 0);
        const af_post_calls = _.get(metrics, 'af_post_calls', 0);
        const af_pre_bets = _.get(metrics, 'af_pre_bets', 0);
        const af_post_bets = _.get(metrics, 'af_post_bets', 0);
        const cbet_p = _.get(metrics, 'cbet_p', 0);
        const cbet_n = _.get(metrics, 'cbet_n', 0);
        const cbet_fold_p = _.get(metrics, 'cbet_fold_p', 0);
        const cbet_fold_n = _.get(metrics, 'cbet_fold_n', 0);

        metricsObject['count'] = count;
        if (vpip + vnpip > 0) {
            metricsObject['vpip'] = vpip / (vpip + vnpip);
            metricsObject['pfr'] = pfr / (vpip + vnpip);

            if (af_pre_calls + af_post_calls > 0) {
                metricsObject['af'] = (af_pre_bets + af_post_bets) / (af_pre_calls + af_post_calls);
            } else if (af_pre_bets + af_post_bets > 0) {
                metricsObject['af'] = Infinity;
            }
        }
        if (cbet_p + cbet_n > 0) {
            metricsObject['cbet'] = cbet_p / (cbet_p + cbet_n);
            metricsObject['cbet_opp'] = cbet_p + cbet_n;
        }
        if (cbet_fold_p + cbet_fold_n > 0) {
            metricsObject['cbet_fold'] = cbet_fold_p / (cbet_fold_p + cbet_fold_n);
            metricsObject['cbet_fold_opp'] = cbet_fold_p + cbet_fold_n;
        }

        ['flop', 'turn', 'river'].forEach((roundKey) => {
            const opp = _(metrics[roundKey]).values().sum();
            metricsObject[roundKey].opp = opp;
            if (opp > 0) {
                ['raise', 'call', 'check', 'fold'].forEach((actionKey) => {
                    metricsObject[roundKey][actionKey] = metrics[roundKey][actionKey] / opp;
                });
            }
        });

        return metricsObject;
    }

    private static computeCount(hand: Hand): { [s: string]: { count: number } } {
        let result = {};
        _(hand.playerBySeat).forEach((player) => {
            result[player.name] = { count: 1 };
        });
        return result;
    }

    private static computeVpip(hand: Hand): { [s: string]: { vpip: number, vnpip: number, pfr: number } } {
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

        //////////

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
    }

    private static computeAf(hand: Hand):
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

    private static computeCbet(hand: Hand):
        { [s: string]: { cbet_p: number, cbet_n: number, cbet_fold_p: number, cbet_fold_n: number } } {
        let result = {};
        const lastPreFlopRaise = _(hand.getPreFlop().actions).filter({ type: ActionType.Raise }).last();
        const flop = hand.getFlop();

        if (lastPreFlopRaise && flop && flop.actions.length) {
            let cbetOpportunity = true;
            let i = 0;
            while (i < flop.actions.length && flop.actions[i].player.name !== lastPreFlopRaise.player.name) {
                if (flop.actions[i].type === ActionType.Bet) {
                    cbetOpportunity = false;
                }
                i++;
            }
            if (cbetOpportunity && flop.actions[i] && flop.actions[i].type !== ActionType.Collect) {
                if (flop.actions[i].type === ActionType.Bet) {
                    result[lastPreFlopRaise.player.name] = { cbet_p: 1 };
                    let j = i + 1;
                    while (j < flop.actions.length && flop.actions[j].player.name !== lastPreFlopRaise.player.name) {
                        if (flop.actions[j].type === ActionType.Fold) {
                            result[flop.actions[j].player.name] = { cbet_fold_p: 1 };
                        } else {
                            result[flop.actions[j].player.name] = { cbet_fold_n: 1 };
                        }
                        j++;
                    }
                } else {
                    result[lastPreFlopRaise.player.name] = { cbet_n: 1 };
                }
            }
        }
        return result;
    }

    private static computePostFlopStats(hand: Hand): {
        [s: string]: {
            flop: { raise: number, call: number, check: number, fold: number },
            turn: { raise: number, call: number, check: number, fold: number },
            river: { raise: number, call: number, check: number, fold: number },
        }
    } {
        const metrics = {
            flop: { raise: 0, call: 0, check: 0, fold: 0 },
            turn: { raise: 0, call: 0, check: 0, fold: 0 },
            river: { raise: 0, call: 0, check: 0, fold: 0 },
        };

        let result = {};
        hand.playerNames.forEach((playerName) => {
            result[playerName] = _.cloneDeep(metrics);
        });

        const rounds = { flop: hand.getFlop(), turn: hand.getTurn(), river: hand.getRiver() };
        _.forEach(rounds, (round, key) => {
            if (round) {
                round.actions.forEach((action) => {
                    if (action.type == ActionType.Bet || action.type == ActionType.Raise) {
                        result[action.player.name][key].raise++;
                    } else if (action.type == ActionType.Call) {
                        result[action.player.name][key].call++;
                    } else if (action.type == ActionType.Check) {
                        result[action.player.name][key].check++;
                    } else if (action.type == ActionType.Fold) {
                        result[action.player.name][key].fold++;
                    }
                });
            }
        });
        return result;
    }

}

export default MetricsEngine;
