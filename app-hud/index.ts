import '../node_modules/normalize.css/normalize.css'
import './index.css'
import './fonts.css'

import { ipcRenderer } from 'electron';
import * as _ from 'lodash';

import MetricsObject from '../shared/metrics/MetricsObject';

let playerName: string = void 0;
let metrics: {} = void 0;
let metricsIndex = 1;

setVisibleMetrics(metricsIndex);

ipcRenderer.on('update-data', (event, data) => {
    playerName = data.playerName;
    metrics = buildMetrics(data.metrics);
    render(playerName, metrics);
});

[1, 2, 3].forEach((index) => {
    const element = document.getElementById('metrics-' + index)
    element.addEventListener('click', () => {
        metricsIndex = index === 3 ? 1 : index + 1;
        setVisibleMetrics(metricsIndex);
    });
});

function render(playerName: string, metrics: {}) {
    document.getElementById('player-name').firstChild.nodeValue = playerName;
    ['count', 'vpip', 'pfr', 'af', 'cbet', 'cbet_fold'].forEach((metric) => {
        document.getElementById('metric-' + metric).firstChild.nodeValue = metrics[metric].value;
    });
    ['flop', 'turn', 'river'].forEach((roundKey) => {
        ['opp', 'raise', 'call', 'check', 'fold'].forEach((actionKey) => {
            document.getElementById('metric-' + roundKey + '-' + actionKey).firstChild.nodeValue = metrics[roundKey][actionKey].value;
        });
    });
}

function setVisibleMetrics(metricsIndex: number) {
    document.getElementById('metrics-1').style.display = metricsIndex === 1 ? null : 'none';
    document.getElementById('metrics-2').style.display = metricsIndex === 2 ? null : 'none';
    document.getElementById('metrics-3').style.display = metricsIndex === 3 ? null : 'none';
    document.getElementById('header').style.display = metricsIndex === 3 ? 'none' : null;
}

function buildMetrics(metrics: MetricsObject) {
    let results = {
        count: {
            name: 'count',
            value: metrics.count && metrics.count > 9999 ? '' + Math.round(metrics.count / 1000) + 'k' : metrics.count || 0
        },
        vpip: {
            name: 'vpip',
            value: _.isNumber(metrics.vpip) ? '' + Math.round(100 * metrics.vpip) + '%' : 'NA'
        },
        pfr: {
            name: 'pfr',
            value: _.isNumber(metrics.pfr) ? '' + Math.round(100 * metrics.pfr) + '%' : 'NA'
        },
        af: {
            name: 'af',
            value: _.isNumber(metrics.af) ? Math.round(10 * metrics.af) / 10 : 'NA'
        },
        cbet: {
            name: 'cbet',
            value: _.isNumber(metrics.cbet_opp) ? '' + Math.round(100 * metrics.cbet) + '% (' + metrics.cbet_opp + ')' : 'NA'
        },
        cbet_fold: {
            name: 'cbet_fold',
            value: _.isNumber(metrics.cbet_fold_opp) ? '' + Math.round(100 * metrics.cbet_fold) + '% (' + metrics.cbet_fold_opp + ')' : 'NA'
        },
        flop: {
            opp: {
                value: metrics.flop.opp > 999 ? '' + Math.round(metrics.flop.opp / 1000) + 'k' : metrics.flop.opp
            },
            raise: {
                name: 'raise',
                value: metrics.flop.opp > 0 ? Math.round(100 * metrics.flop.raise) : '-'
            },
            call: {
                name: 'call',
                value: metrics.flop.opp > 0 ? Math.round(100 * metrics.flop.call) : '-'
            },
            check: {
                name: 'check',
                value: metrics.flop.opp > 0 ? Math.round(100 * metrics.flop.check) : '-'
            },
            fold: {
                name: 'fold',
                value: metrics.flop.opp > 0 ? Math.round(100 * metrics.flop.fold) : '-'
            }
        },
        turn: {
            opp: {
                value: metrics.turn.opp > 999 ? '' + Math.round(metrics.turn.opp / 1000) + 'k' : metrics.turn.opp
            },
            raise: {
                name: 'raise',
                value: metrics.turn.opp > 0 ? Math.round(100 * metrics.turn.raise) : '-'
            },
            call: {
                name: 'call',
                value: metrics.turn.opp > 0 ? Math.round(100 * metrics.turn.call) : '-'
            },
            check: {
                name: 'check',
                value: metrics.turn.opp > 0 ? Math.round(100 * metrics.turn.check) : '-'
            },
            fold: {
                name: 'fold',
                value: metrics.turn.opp > 0 ? Math.round(100 * metrics.turn.fold) : '-'
            }
        },
        river: {
            opp: {
                value: metrics.river.opp > 999 ? '' + Math.round(metrics.river.opp / 1000) + 'k' : metrics.river.opp
            },
            raise: {
                name: 'raise',
                value: metrics.river.opp > 0 ? Math.round(100 * metrics.river.raise) : '-'
            },
            call: {
                name: 'call',
                value: metrics.river.opp > 0 ? Math.round(100 * metrics.river.call) : '-'
            },
            check: {
                name: 'check',
                value: metrics.river.opp > 0 ? Math.round(100 * metrics.river.check) : '-'
            },
            fold: {
                name: 'fold',
                value: metrics.river.opp > 0 ? Math.round(100 * metrics.river.fold) : '-'
            }
        }
    };

    return results;
}
