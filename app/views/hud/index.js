const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

angular
    .module('hud', [])
    .controller('hudController',  ['$scope', '$timeout', controllerFunc]);

function controllerFunc($scope, $timeout) {
    $scope.toggleMetrics = toggleMetrics;

    $scope.playerName = void 0;
    $scope.handCount = 0;
    $scope.metrics = {};
    $scope.showAltMetrics = false;

    ipc.on('update-data', (event, data) => {
        $timeout(() => {
            $scope.playerName = data.playerName;
            $scope.metrics = buildMetrics(data.metrics);
            $scope.handCount = getHandCount(data.metrics);
        });
    });

    function toggleMetrics() {
        $scope.showAltMetrics = !$scope.showAltMetrics;
    }
}

function buildMetrics(metrics) {
    let results = {
        count: {
            name: 'count',
            value: '0'
        },
        vpip: {
            name: 'vpip',
            value: 'n/a'
        },
        pfr: {
            name: 'pfr',
            value: 'n/a'
        },
        af: {
            name: 'af',
            value: 'n/a'
        },
        cbet: {
            name: 'cbet',
            value: 'n/a'
        },
        cbet_fold: {
            name: 'cbet_fold',
            value: 'n/a'
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

    results['count'].value = '' + count;
    if (vpip + vnpip > 0) {
        results['vpip'].value = '' + Math.round(100 * vpip / (vpip + vnpip)) + '%';
        results['pfr'].value = '' + Math.round(100 * pfr / (vpip + vnpip)) + '%';

        if (af_pre_calls + af_post_calls > 0) {
            results['af'].value = '' + (Math.round(10 * (af_pre_bets + af_post_bets) / (af_pre_calls + af_post_calls)) / 10);
        } else if (af_pre_bets + af_post_bets > 0) {
            results['af'].value = '∞';
        }
    }
    if (cbet_p + cbet_n > 0) {
        results['cbet'].value = '' + Math.round(100 * cbet_p / (cbet_p + cbet_n)) + '% (' + (cbet_p + cbet_n) + ')';
    }
    if (cbet_fold_p + cbet_fold_n > 0) {
        results['cbet_fold'].value = '' + Math.round(100 * cbet_fold_p / (cbet_fold_p + cbet_fold_n)) + '% (' + (cbet_fold_p + cbet_fold_n) + ')';
    }

    return results;
}

// TODO: this is not hand count
function getHandCount(metrics) {
    return vpip = _.get(metrics, 'vpip', 0) + _.get(metrics, 'vnpip', 0);
}
