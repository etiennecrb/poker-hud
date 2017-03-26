import * as _ from 'lodash';
import Hand from '../models/hand';
import Player from '../models/player';
import MetricsObject from './metrics-object';
import ActionType from '../models/action-type';
import computeCount from './metric-count';
import computeVpip from './metric-vpip';
import computeAf from './metric-af';
import computeCbet from './metric-cbet';
import computePostFlop from './metric-post-flop';

const metrics = [computeCount, computeVpip, computeAf, computeCbet, computePostFlop];

export default function compute(hands: Hand[], players: Player[]): { [s: string]: MetricsObject } {
    const playerNames = _.map(players, 'name');
    const results = {};
    hands.forEach((hand) => {
        metrics.forEach((compute) => {
            _(compute(hand)).pick(playerNames).forEach((incrementObject, playerName) => {
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
        metricsByPlayer[playerName] = buildMetricsObject(results[playerName]);
    });
    return metricsByPlayer;
}

function buildMetricsObject(metrics: {}): MetricsObject {
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
