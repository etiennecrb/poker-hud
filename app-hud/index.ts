import './index.css'
import './fonts.css'

import { ipcRenderer } from 'electron';
import * as _  from 'lodash';

import MetricsObject from '../shared/metrics/MetricsObject';

let playerName: string = void 0;
let metrics: {} = void 0;
let showAltMetrics = false;

setVisibleMetrics(showAltMetrics);

ipcRenderer.on('update-data', (event, data) => {
    playerName = data.playerName;
    metrics = buildMetrics(data.metrics);
    render(playerName, metrics);
});

[].forEach.call(document.getElementsByClassName('content'), function (el: Element) {
    el.addEventListener('click', () => {
        showAltMetrics = !showAltMetrics;
        setVisibleMetrics(showAltMetrics);
    });
});

function render(playerName: string, metrics: {}) {
    document.getElementById('player-name').firstChild.nodeValue = playerName;
    ['count', 'vpip', 'pfr', 'af', 'cbet', 'cbet_fold'].forEach((metric) => {
        document.getElementById('metric-' + metric).firstChild.nodeValue = metrics[metric].value;
    });
}

function setVisibleMetrics(showAltMetrics: boolean) {
    document.getElementById('main-metrics').style.display = showAltMetrics ? 'none' : null;
    document.getElementById('alt-metrics').style.display = showAltMetrics ? null : 'none';
}

function buildMetrics(metrics: MetricsObject) {
    let results = {
        count: {
            name: 'count',
            value: metrics.count || 0
        },
        vpip: {
            name: 'vpip',
            value: _.isNumber(metrics.vpip) ? '' + Math.round(100 * metrics.vpip) + '%' : 'n/a'
        },
        pfr: {
            name: 'pfr',
            value: _.isNumber(metrics.pfr) ? '' + Math.round(100 * metrics.pfr) + '%' : 'n/a'
        },
        af: {
            name: 'af',
            value: _.isNumber(metrics.af) ? Math.round(10 * metrics.af) / 10 : 'n/a'
        },
        cbet: {
            name: 'cbet',
            value: _.isNumber(metrics.cbet_opp) ? '' + Math.round(100 * metrics.cbet) + '% (' + metrics.cbet_opp + ')' : 'n/a'
        },
        cbet_fold: {
            name: 'cbet_fold',
            value: _.isNumber(metrics.cbet_fold_opp) ? '' + Math.round(100 * metrics.cbet_fold) + '% (' + metrics.cbet_fold_opp + ')' : 'n/a'
        }
    };

    return results;
}
