const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

ipc.on('data', function (event, data) {
    if (data.metrics && data.playerName) {
        render(data.playerName, data.metrics);
    }
});

function render(playerName, metrics) {
    const container = document.getElementById('hud');
    // Empty container
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

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

    const title = document.createElement('strong');
    title.innerHTML = playerName + ' (' + (vpip + vnpip) + ')';

    const content = document.createElement('p');

    if (vpip + vnpip > 0) {
        content.innerHTML += '' + Math.round(100 * vpip / (vpip + vnpip)) + '% / ';
        content.innerHTML += '' + Math.round(100 * pfr / (vpip + vnpip)) + '% / ';
        if (af_pre_calls + af_post_calls > 0) {
            content.innerHTML += '' + (Math.round(10 * (af_pre_bets + af_post_bets) / (af_pre_calls + af_post_calls)) / 10) + '';
        } else if (af_pre_bets + af_post_bets > 0) {
            content.innerHTML += 'Infinity ';
        }
    }
    if (cbet_p + cbet_n > 0) {
        content.innerHTML += '<br>CBET: ' + Math.round(100 * cbet_p / (cbet_p + cbet_n)) + '% (' + (cbet_p + cbet_n) + ') / ';
    }
    if (cbet_fold_p + cbet_fold_n > 0) {
        content.innerHTML += '' + Math.round(100 * cbet_fold_p / (cbet_fold_p + cbet_fold_n)) + '% (' + (cbet_fold_p + cbet_fold_n) + ')';
    }

    container.appendChild(title);
    container.appendChild(content);
}
